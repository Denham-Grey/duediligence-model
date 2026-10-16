-- M3 / 1 of 4 — core tables, constraints, indexes, updated_at triggers.
-- See supabase/README.md for the model. Timestamps are timestamptz (UTC).

-- ---------------------------------------------------------------------------
-- cases
-- ---------------------------------------------------------------------------
create table public.cases (
  id               bigint generated always as identity primary key,
  bank             text not null,
  country          text not null default '',
  category         text not null check (category in ('Onboarding', 'Periodic review')),
  created_at       timestamptz not null default now(),
  created_by       text,
  final_decision   text not null default ''
                   check (final_decision in ('', 'Approve', 'Approve with conditions', 'Defer', 'Decline')),
  covenants        text not null default '',
  profile          jsonb,
  ratios           jsonb,
  prudential       jsonb,
  prudential_notes jsonb,
  eligibility      jsonb,
  updated_at       timestamptz,
  updated_by       uuid
);

-- ---------------------------------------------------------------------------
-- profiles (one per auth user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  username        text not null unique check (username = lower(username) and length(username) > 0),
  name            text not null,
  role            text not null check (role in ('analyst', 'lead', 'admin', 'rep')),
  institution_id  bigint references public.cases (id),
  active          boolean not null default true,
  locked          boolean not null default false,
  failed_attempts integer not null default 0,
  must_change     boolean not null default true,
  theme           text check (theme in ('light', 'dark')),
  created_at      timestamptz not null default now(),
  constraint profiles_rep_institution_chk
    check ((role = 'rep') = (institution_id is not null))
);
create index profiles_institution_id_idx on public.profiles (institution_id);

-- ---------------------------------------------------------------------------
-- case_sections (21 rows per case) and case_report_parts (18 rows per case)
-- ---------------------------------------------------------------------------
create table public.case_sections (
  case_id    bigint not null references public.cases (id) on delete cascade,
  code       text not null check (code ~ '^S([1-9]|1[0-9]|2[01])$'),
  data       jsonb not null,
  updated_at timestamptz,
  updated_by uuid,
  primary key (case_id, code)
);

create table public.case_report_parts (
  case_id    bigint not null references public.cases (id) on delete cascade,
  part_id    text not null check (part_id in (
               'cover', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10',
               'r11', 'r12', 'r13', 'r14', 'r15', 'r16', 'annexA')),
  data       jsonb not null,
  updated_at timestamptz,
  updated_by uuid,
  primary key (case_id, part_id)
);

-- ---------------------------------------------------------------------------
-- report_versions (immutable; written by generate_report_version())
-- ---------------------------------------------------------------------------
create table public.report_versions (
  id              bigint generated always as identity primary key,
  case_id         bigint not null references public.cases (id) on delete cascade,
  version         integer not null check (version > 0),
  generated_by    text,
  generated_by_id uuid,
  generated_at    timestamptz not null default now(),
  note            text not null default '',
  snapshot        jsonb not null,
  unique (case_id, version)
);

-- ---------------------------------------------------------------------------
-- Partner documents (PFI)
-- ---------------------------------------------------------------------------
create table public.pfi_requests (
  id           bigint generated always as identity primary key,
  case_id      bigint not null references public.cases (id) on delete cascade,
  title        text not null,
  note         text not null default '',
  requested_by text,
  requested_at timestamptz not null default now(),
  status       text not null default 'Pending upload' check (status in (
                 'Pending upload', 'Submitted', 'Clarification required',
                 'Reupload required', 'Rejected', 'Accepted')),
  sort_order   integer not null default 0
);
create index pfi_requests_case_id_idx on public.pfi_requests (case_id, sort_order);

-- A round is a partner-document "version". When its last live file is removed the
-- round is dropped (dropped_at set) and its number may be reused, exactly as the
-- prototype pops the empty round. Hence uniqueness applies to live rounds only.
create table public.pfi_rounds (
  id         bigint generated always as identity primary key,
  request_id bigint not null references public.pfi_requests (id) on delete cascade,
  case_id    bigint not null references public.cases (id) on delete cascade,
  n          integer not null check (n > 0),
  created_at timestamptz not null default now(),
  created_by text,
  dropped_at timestamptz
);
create unique index pfi_rounds_request_n_live_uidx on public.pfi_rounds (request_id, n) where dropped_at is null;
create index pfi_rounds_request_id_idx on public.pfi_rounds (request_id);
create index pfi_rounds_case_id_idx on public.pfi_rounds (case_id);

create table public.pfi_files (
  id             uuid primary key default gen_random_uuid(),
  round_id       bigint not null references public.pfi_rounds (id) on delete cascade,
  request_id     bigint not null references public.pfi_requests (id) on delete cascade,
  case_id        bigint not null references public.cases (id) on delete cascade,
  name           text not null,
  size           bigint not null default 0 check (size >= 0),
  mime           text not null default '',
  storage_path   text,
  uploaded_by    text,
  uploaded_by_id uuid,
  uploaded_at    timestamptz not null default now(),
  removed_at     timestamptz,
  removed_by     text
);
create index pfi_files_round_id_idx on public.pfi_files (round_id);
create index pfi_files_request_id_idx on public.pfi_files (request_id);
create index pfi_files_case_id_idx on public.pfi_files (case_id);

create table public.pfi_messages (
  id         bigint generated always as identity primary key,
  request_id bigint not null references public.pfi_requests (id) on delete cascade,
  case_id    bigint not null references public.cases (id) on delete cascade,
  kind       text not null check (kind in ('event', 'reply', 'comment', 'clarify', 'reupload', 'reject', 'accept')),
  role       text not null check (role in ('rep', 'dd')),
  who        text,
  author_id  uuid,
  at         timestamptz not null default now(),
  text       text not null default '',
  about      text not null default '',
  tag        text not null default ''
);
create index pfi_messages_request_id_idx on public.pfi_messages (request_id, at);
create index pfi_messages_case_id_idx on public.pfi_messages (case_id);

-- ---------------------------------------------------------------------------
-- audit_log (append-only) and app_settings
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id      bigint generated always as identity primary key,
  case_id bigint references public.cases (id) on delete cascade,
  at      timestamptz not null default now(),
  user_id uuid,
  who     text,
  role    text,
  action  text not null,
  detail  text not null default '',
  ip      inet
);
create index audit_log_case_id_idx on public.audit_log (case_id, at desc);
create index audit_log_at_idx on public.audit_log (at desc);

create table public.app_settings (
  key   text primary key,
  value jsonb
);

-- ---------------------------------------------------------------------------
-- RLS on everywhere (policies are in the next migration)
-- ---------------------------------------------------------------------------
alter table public.cases             enable row level security;
alter table public.profiles          enable row level security;
alter table public.case_sections     enable row level security;
alter table public.case_report_parts enable row level security;
alter table public.report_versions   enable row level security;
alter table public.pfi_requests      enable row level security;
alter table public.pfi_rounds        enable row level security;
alter table public.pfi_files         enable row level security;
alter table public.pfi_messages      enable row level security;
alter table public.audit_log         enable row level security;
alter table public.app_settings      enable row level security;

-- ---------------------------------------------------------------------------
-- updated_at / updated_by touch trigger
-- ---------------------------------------------------------------------------
create schema if not exists private;

create or replace function private.touch_updated()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if auth.uid() is not null then
    new.updated_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger cases_touch             before insert or update on public.cases             for each row execute function private.touch_updated();
create trigger case_sections_touch     before insert or update on public.case_sections     for each row execute function private.touch_updated();
create trigger case_report_parts_touch before insert or update on public.case_report_parts for each row execute function private.touch_updated();
