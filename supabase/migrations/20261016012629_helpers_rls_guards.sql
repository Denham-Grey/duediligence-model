-- M3 / 2 of 4 — helper functions, table privileges, RLS policies, guard triggers.
--
-- Helper functions live in schema `private`, which is NOT exposed through the Data API,
-- so they cannot be called as RPCs. They are SECURITY DEFINER (owner bypasses RLS on
-- profiles, so there is no policy recursion) and are executable by `authenticated`
-- because RLS policies evaluate them as the calling role.

grant usage on schema private to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------
create or replace function private.app_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = auth.uid();
$$;

create or replace function private.is_staff()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('analyst', 'lead', 'admin')
      and p.active and not p.locked
  );
$$;

create or replace function private.is_lead()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('lead', 'admin')
      and p.active and not p.locked
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.active and not p.locked
  );
$$;

-- Institution (case id) of the caller when the caller is an ACTIVE, UNLOCKED rep; else null.
create or replace function private.rep_case_id()
returns bigint
language sql stable security definer
set search_path = ''
as $$
  select p.institution_id from public.profiles p
  where p.id = auth.uid()
    and p.role = 'rep'
    and p.active and not p.locked;
$$;

-- Partner portal: the rep's own institution (id, bank) only.
create or replace function private.my_institution()
returns table (id bigint, bank text)
language sql stable security definer
set search_path = ''
as $$
  select c.id, c.bank from public.cases c where c.id = private.rep_case_id();
$$;

-- Public, invoker-rights wrapper so the portal can call it as an RPC.
create or replace function public.my_institution()
returns table (id bigint, bank text)
language sql stable security invoker
set search_path = ''
as $$
  select * from private.my_institution();
$$;

-- ---------------------------------------------------------------------------
-- Table privileges (defence in depth on top of RLS)
--   anon:          nothing
--   authenticated: select everything (RLS filters); insert/update only where staff
--                  edit directly; profile update limited to the `theme` column.
--                  No delete anywhere. All pfi_* and report_versions writes go
--                  through SECURITY DEFINER RPCs.
-- ---------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;

grant select on all tables in schema public to authenticated;
grant insert, update on public.cases, public.case_sections, public.case_report_parts, public.app_settings to authenticated;
grant insert on public.audit_log to authenticated;
grant update (theme) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------
-- profiles
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_staff()));
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- staff-only case tables: select / insert / update
create policy cases_select on public.cases for select to authenticated using ((select private.is_staff()));
create policy cases_insert on public.cases for insert to authenticated with check ((select private.is_staff()));
create policy cases_update on public.cases for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

create policy case_sections_select on public.case_sections for select to authenticated using ((select private.is_staff()));
create policy case_sections_insert on public.case_sections for insert to authenticated with check ((select private.is_staff()));
create policy case_sections_update on public.case_sections for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

create policy case_report_parts_select on public.case_report_parts for select to authenticated using ((select private.is_staff()));
create policy case_report_parts_insert on public.case_report_parts for insert to authenticated with check ((select private.is_staff()));
create policy case_report_parts_update on public.case_report_parts for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

create policy app_settings_select on public.app_settings for select to authenticated using ((select private.is_staff()));
create policy app_settings_insert on public.app_settings for insert to authenticated with check ((select private.is_staff()));
create policy app_settings_update on public.app_settings for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- report_versions: staff read; inserts only via public.generate_report_version()
create policy report_versions_select on public.report_versions for select to authenticated using ((select private.is_staff()));

-- audit_log: staff read and append (identity fixed by trigger)
create policy audit_log_select on public.audit_log for select to authenticated using ((select private.is_staff()));
create policy audit_log_insert on public.audit_log for insert to authenticated with check ((select private.is_staff()));

-- pfi_*: staff read all; an active, unlocked rep reads own institution only
create policy pfi_requests_select on public.pfi_requests for select to authenticated
  using ((select private.is_staff()) or case_id = (select private.rep_case_id()));
create policy pfi_rounds_select on public.pfi_rounds for select to authenticated
  using ((select private.is_staff()) or (case_id = (select private.rep_case_id()) and dropped_at is null));
create policy pfi_files_select on public.pfi_files for select to authenticated
  using ((select private.is_staff()) or (case_id = (select private.rep_case_id()) and removed_at is null));
create policy pfi_messages_select on public.pfi_messages for select to authenticated
  using ((select private.is_staff()) or case_id = (select private.rep_case_id()));

-- ---------------------------------------------------------------------------
-- Guard triggers
-- ---------------------------------------------------------------------------

-- cases.final_decision: lead/admin only (skipped for service role / seed: auth.uid() is null)
create or replace function private.guard_final_decision()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if (tg_op = 'INSERT' and new.final_decision <> '')
     or (tg_op = 'UPDATE' and new.final_decision is distinct from old.final_decision) then
    if not private.is_lead() then
      raise exception 'Lead or admin role required.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
create trigger cases_guard_final_decision
  before insert or update on public.cases
  for each row execute function private.guard_final_decision();

-- profiles: a signed-in user may change only their own `theme`.
create or replace function private.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if new.id <> auth.uid() or (to_jsonb(new) - 'theme') <> (to_jsonb(old) - 'theme') then
    raise exception 'Only your own theme can be changed.' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function private.guard_profile_update();

-- audit_log: server fills identity and time from the caller (cannot be forged).
create or replace function private.audit_fill_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_role text;
begin
  if auth.uid() is not null then
    select p.name, p.role into v_name, v_role from public.profiles p where p.id = auth.uid();
    new.user_id := auth.uid();
    new.who     := v_name;
    new.role    := v_role;
    new.at      := now();
  end if;
  return new;
end;
$$;
create trigger audit_log_fill_identity
  before insert on public.audit_log
  for each row execute function private.audit_fill_identity();

-- audit_log and report_versions are immutable for everyone, service role included.
create or replace function private.reject_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is append-only: % is not allowed.', tg_table_name, lower(tg_op) using errcode = '42501';
end;
$$;
create trigger audit_log_immutable
  before update or delete on public.audit_log
  for each row execute function private.reject_mutation();
create trigger audit_log_no_truncate
  before truncate on public.audit_log
  for each statement execute function private.reject_mutation();
create trigger report_versions_immutable
  before update or delete on public.report_versions
  for each row execute function private.reject_mutation();
create trigger report_versions_no_truncate
  before truncate on public.report_versions
  for each statement execute function private.reject_mutation();

-- ---------------------------------------------------------------------------
-- Function privileges
-- ---------------------------------------------------------------------------
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function
  private.app_role(), private.is_staff(), private.is_lead(), private.is_admin(),
  private.rep_case_id(), private.my_institution()
  to authenticated, service_role;

revoke all on function public.my_institution() from public, anon;
grant execute on function public.my_institution() to authenticated, service_role;
