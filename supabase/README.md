# DD Portal — Supabase schema, RLS and storage (M3)

Project: `bdlvolxdazxrfjaabsra` (eu-west-2). Migrations in `migrations/`, applied in this order
(file names match the versions recorded in `supabase_migrations.schema_migrations`):

| File | Contents |
|---|---|
| `20261016012524_core_tables.sql` | Tables, constraints, FK indexes, `updated_at` touch triggers, RLS enabled |
| `20261016012629_helpers_rls_guards.sql` | Helper functions, table privileges, RLS policies, guard triggers |
| `20261016012957_rpcs.sql` | `generate_report_version` and the partner-document (PFI) RPCs |
| `20261016013014_storage_buckets.sql` | Private buckets `partner-files`, `section-files` |

Tests: `npm run test:rls` (= `node --env-file=.env.local tests/rls/run.mjs`), covering T3.3–T3.7.

---

## Tables (`public`)

All timestamps are `timestamptz` (the app formats them as `14 Aug 2026 10:41 UTC`). Children
cascade-delete from `cases` / `pfi_requests`; every FK column is indexed. There is **no delete
feature**: no role but the service role has a delete privilege, and `audit_log` and
`report_versions` refuse deletes even from the service role.

| Table | Key / notable columns |
|---|---|
| `profiles` | `id` → `auth.users` (cascade). `username` unique, must be lowercase. `role` ∈ analyst/lead/admin/rep. `institution_id` → `cases`, **required iff role = rep**. `active`, `locked`, `failed_attempts`, `must_change` (default true), `theme` ∈ light/dark/null. |
| `cases` | `id` identity. `category` ∈ Onboarding / Periodic review. `final_decision` ∈ '' / Approve / Approve with conditions / Defer / Decline. `profile`, `ratios`, `prudential`, `prudential_notes`, `eligibility` jsonb. `updated_at`/`updated_by` set by trigger. |
| `case_sections` | PK (`case_id`, `code`), code `S1`–`S21`, `data` jsonb. |
| `case_report_parts` | PK (`case_id`, `part_id`), part ∈ cover, r1–r16, annexA; `data` jsonb. |
| `report_versions` | unique (`case_id`, `version`); `generated_by` (name), `generated_by_id`, `generated_at`, `note`, `snapshot`. **Immutable.** |
| `pfi_requests` | `status` ∈ Pending upload / Submitted / Clarification required / Reupload required / Rejected / Accepted; `sort_order`. |
| `pfi_rounds` | Partner-document "versions": `request_id`, `case_id`, `n`, `created_by`, **`dropped_at`** (see below). |
| `pfi_files` | `id` uuid, `round_id`, `request_id`, `case_id`, `name`, `size` (bytes), `mime`, `storage_path` (null for demo placeholders), `uploaded_by(_id)`, `removed_at`/`removed_by` (soft delete). |
| `pfi_messages` | Thread: `kind` ∈ event/reply/comment/clarify/reupload/reject/accept, `role` ∈ rep/dd, `who`, `author_id`, `at`, `text`, `about`, `tag`. |
| `audit_log` | `case_id` (nullable = global), `at`, `user_id`, `who`, `role`, `action`, `detail`, `ip`. **Append-only.** |
| `app_settings` | `key` → `value` jsonb (e.g. `periods`, written by the app). |

**Deviation from the brief, `pfi_rounds`:** the prototype pops a version when its last file is
removed, and the next upload reuses that number. The row is kept and marked
`dropped_at` (its soft-removed files still point to it), so uniqueness is a **partial** unique
index on (`request_id`, `n`) `where dropped_at is null`. The "current version" is the live
round with the highest `n`. Reps never see dropped rounds or removed files. Staff see them.

## Helper functions (schema `private`, not exposed by the API)

All `SECURITY DEFINER`, `stable`, `search_path = ''`, executable by `authenticated` and
`service_role` only (needed because RLS policies evaluate them as the caller).

| Function | Returns |
|---|---|
| `private.app_role()` | caller's role, or null |
| `private.is_staff()` | analyst/lead/admin **and** active **and** not locked |
| `private.is_lead()` | lead/admin, active, not locked |
| `private.is_admin()` | admin, active, not locked |
| `private.rep_case_id()` | caller's `institution_id` if an **active, unlocked rep**; else null |
| `private.my_institution()` | `(id, bank)` of the rep's institution only |

## RPCs (`public`, call with `supabase.rpc(name, args)`)

Each public RPC is a `SECURITY INVOKER` wrapper around a `SECURITY DEFINER` implementation in
`private`. The implementation checks the caller and writes the audit row. Not executable by `anon`.

| RPC | Who | Returns |
|---|---|---|
| `my_institution()` | active rep | `[{ id, bank }]` (0 rows for anyone else) |
| `generate_report_version(p_case_id, p_note = '', p_snapshot jsonb)` | lead/admin | `report_versions` row. Version = max + 1 (case row locked). Audit `report.generated` / `v<n>`. |
| `pfi_add_request(p_case_id, p_title, p_note = '')` | staff | `pfi_requests` row. `requested_by` = caller name, `sort_order` = max + 1. Audit `pfi.request.added` / `<title>`. |
| `pfi_record_upload(p_request_id, p_files jsonb)` | staff, or rep of that case | `{ round_id, n, file_ids[], status }`. `p_files = [{ id?, name, size?, mime?, storage_path? }]`. `storage_path` must start with `{case_id}/{request_id}/`. Audit `pfi.upload` / `<title> · v<n> · <k> file(s)`. |
| `pfi_remove_file(p_file_id uuid)` | staff, or rep of that case (not once Accepted) | `{ file_id, storage_path, status }`. Soft delete. Audit `pfi.file.removed` / `<title> · <name>`. |
| `pfi_post(p_request_id, p_kind, p_text = '', p_about = '')` | rep: `reply`; staff: `comment`, `clarify`, `reupload`, `reject`, `accept` | `pfi_messages` row. Audit `pfi.<kind>` / `<title>`. |

Workflow rules (Application Guide §7.6, same as the prototype):
- **Upload** starts a new version when there is none, or the status is Clarification required / Reupload required / Rejected. Otherwise files join the current version. The status becomes Submitted. Thread event: `Uploaded n file(s) as version v.` (`file`/`files`), role rep/dd. Refused once Accepted.
- **Remove**: only files in the current version, for staff and reps alike. Reps cannot remove once the request is Accepted. If the version empties it is dropped. If no versions remain, the status returns to Pending upload. Event: `Removed <name> from version <n>.`
- **Post**:
  - Text is required except for `accept`, which defaults to `Accepted.`.
  - `reject` needs a current version and a status that is not already Rejected. `accept` needs a current version and a status that is not already Accepted.
  - `reply` needs at least one earlier `role = 'dd'` message, and turns Clarification required into Submitted.
  - Tags: Reply, Comment, Clarification requested, Reupload requested, Rejected, Accepted.
  - `about` is kept for staff and blanked for reps.

### Error contract (`error.code` from supabase-js)

| Code | Meaning | Map to HTTP |
|---|---|---|
| `42501` | Role or account not allowed. Also covers a locked/disabled rep, an analyst generating a report, staff using `reply`, a rep using a staff kind, and an analyst changing `final_decision` ("Lead or admin role required."). | 403 |
| `P0002` | Not found, **or belongs to another institution** (`Request not found.`, `File not found.`, `Case not found.`) | **404** |
| `22023` | Invalid input: text required, title required, no files, bad `storage_path`, unknown kind | 400 |
| `55000` | Workflow rule: upload or remove after Accepted, file not in the current version, nothing to reject or accept, reply before staff posted | 409 |

## RLS model per role

| | analyst / lead / admin (active, unlocked) | rep (active, unlocked) | locked / disabled user | anon |
|---|---|---|---|---|
| `cases`, `case_sections`, `case_report_parts`, `app_settings` | select, insert, update | — | — | — |
| `cases.final_decision` | change: **lead/admin only** (trigger, 42501) | — | — | — |
| `report_versions` | select; insert only via `generate_report_version` (lead/admin) | — | — | — |
| `audit_log` | select, insert (trigger overwrites `user_id`, `who`, `role`, `at`) | — (RPCs write rep audit rows) | — | — |
| `profiles` | select all; update **own `theme` only** | select own; update own `theme` only | select own; update own theme | — |
| `pfi_*` | select all (including removed files and dropped rounds); writes via RPCs | select own institution only (no removed files, no dropped rounds); writes via RPCs | — | — |
| delete (any table) | — | — | — | — |

The service role bypasses RLS (seed scripts, the M4 server routes for sign-in, user admin and
passcodes). Profile inserts and non-theme profile updates are service-role only. Guard
triggers skip their checks when `auth.uid()` is null, i.e. for the service role. The exception
is immutability: `audit_log` and `report_versions` reject UPDATE, DELETE and TRUNCATE from
**everyone**, service role included.

Layers: table privileges (`anon` gets nothing; `authenticated` gets select, insert/update only
where staff edit directly, and column-level `update(theme)` on profiles), then RLS policies,
then guard triggers.

## Storage

Two private buckets with a 50 MB per-file limit. There are **no `storage.objects` policies** for
anon or authenticated. All uploads and downloads go through server routes that use the service
role and short-lived signed URLs (M6).

- `partner-files/{case_id}/{request_id}/{round_n}/{file_id}`
- `section-files/{case_id}/{section_code}/{file_id}`

## Auth

- Internal emails `{username}@users.dd-portal.invalid` **work**. `auth.admin.createUser({ email,
  password, email_confirm: true })` accepts them and password sign-in succeeds (the RLS suite
  checks this on every run).
- **Manual dashboard step (P1):** Authentication → Sign In / Providers → Email → *Minimum
  password length* = **6**. The Supabase MCP cannot change auth settings. Also confirm that
  "Confirm email" is off or irrelevant (users are created with `email_confirm: true`).

## RLS test suite (`tests/rls/run.mjs`)

- It creates 7 auth users per run (analyst, lead, admin, rep A, rep B, a locked rep A, a disabled rep A), named `rlstest_*`, with random passwords. It signs each one in with the publishable key and prints one PASS/FAIL line per assertion. It exits non-zero on any failure.
- **Fixture cases are permanent.** `RLS Test Bank A` / `RLS Test Bank B` are found or created and reused, because their `audit_log` and `report_versions` rows are immutable. A case cascade-deletes into those tables, so the cases cannot be deleted either.
- Each run adds a few audit rows and 2 report versions to these two cases. Everything else is removed at the end: users, `pfi_*` rows, section and report rows, the `rls_test_probe` setting and `final_decision`.
- Point the suite at a non-production project. In production, the two fixture cases would appear on the staff dashboard.

## Advisors (after M3)

- Security: nothing raised for M3 objects. The only findings concern `public.rls_auto_enable()`, the Supabase-provided event-trigger function, which is executable by anon and authenticated. Recommended hardening, not applied here: `revoke execute on function public.rls_auto_enable() from anon, authenticated, public;`
- Performance: INFO "unused index" only, because the database is fresh.
