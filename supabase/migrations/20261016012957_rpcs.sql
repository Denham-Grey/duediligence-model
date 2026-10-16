-- M3 / 3 of 4 â€” RPCs.
--
-- Pattern: the implementation is SECURITY DEFINER in schema `private` (not exposed by the
-- Data API); the callable RPC in `public` is a thin SECURITY INVOKER wrapper. Every
-- implementation checks the caller itself and writes its own audit row.
--
-- Error codes (supabase-js: error.code):
--   42501  insufficient_privilege          caller's role/account may not do this      -> 403
--   P0002  no_data_found                   object missing OR outside the rep's institution -> 404
--   22023  invalid_parameter_value         bad / missing input (e.g. text required)   -> 400
--   55000  object_not_in_prerequisite_state workflow rule (accepted, no file, ...)     -> 409

-- ---------------------------------------------------------------------------
-- Internal helpers
-- ---------------------------------------------------------------------------
create or replace function private.caller_name()
returns text
language sql stable security definer
set search_path = ''
as $$
  select p.name from public.profiles p where p.id = auth.uid();
$$;

-- Loads and locks a PFI request the caller may act on. Raises 42501 when the caller is
-- neither active staff nor an active rep; P0002 when the request does not exist or
-- belongs to another institution (reps never learn that it exists).
create or replace function private.pfi_request_for_caller(p_request_id bigint)
returns public.pfi_requests
language plpgsql security definer
set search_path = ''
as $$
declare
  v_staff boolean := private.is_staff();
  v_rep   bigint  := private.rep_case_id();
  v_req   public.pfi_requests;
begin
  if not v_staff and v_rep is null then
    raise exception 'Not permitted.' using errcode = '42501';
  end if;
  select * into v_req from public.pfi_requests r where r.id = p_request_id for update;
  if not found or (not v_staff and v_req.case_id <> v_rep) then
    raise exception 'Request not found.' using errcode = 'P0002';
  end if;
  return v_req;
end;
$$;

-- ---------------------------------------------------------------------------
-- Board report versions (Â§7.7) â€” lead/admin; version = max + 1; audit report.generated
-- ---------------------------------------------------------------------------
create or replace function private.generate_report_version(p_case_id bigint, p_note text, p_snapshot jsonb)
returns public.report_versions
language plpgsql security definer
set search_path = ''
as $$
declare
  v_n   integer;
  v_row public.report_versions;
begin
  if not private.is_lead() then
    raise exception 'Lead or admin role required.' using errcode = '42501';
  end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then
    raise exception 'A snapshot object is required.' using errcode = '22023';
  end if;
  perform 1 from public.cases c where c.id = p_case_id for update;
  if not found then
    raise exception 'Case not found.' using errcode = 'P0002';
  end if;

  select coalesce(max(v.version), 0) + 1 into v_n from public.report_versions v where v.case_id = p_case_id;

  insert into public.report_versions (case_id, version, generated_by, generated_by_id, note, snapshot)
  values (p_case_id, v_n, private.caller_name(), auth.uid(), coalesce(p_note, ''), p_snapshot)
  returning * into v_row;

  insert into public.audit_log (case_id, action, detail) values (p_case_id, 'report.generated', 'v' || v_n);
  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- PFI: add request (staff)
-- ---------------------------------------------------------------------------
create or replace function private.pfi_add_request(p_case_id bigint, p_title text, p_note text)
returns public.pfi_requests
language plpgsql security definer
set search_path = ''
as $$
declare
  v_title text := btrim(coalesce(p_title, ''));
  v_order integer;
  v_row   public.pfi_requests;
begin
  if not private.is_staff() then
    raise exception 'Not permitted.' using errcode = '42501';
  end if;
  if v_title = '' then
    raise exception 'A title is required.' using errcode = '22023';
  end if;
  perform 1 from public.cases c where c.id = p_case_id for update;
  if not found then
    raise exception 'Case not found.' using errcode = 'P0002';
  end if;

  select coalesce(max(r.sort_order), 0) + 1 into v_order from public.pfi_requests r where r.case_id = p_case_id;

  insert into public.pfi_requests (case_id, title, note, requested_by, sort_order)
  values (p_case_id, v_title, btrim(coalesce(p_note, '')), private.caller_name(), v_order)
  returning * into v_row;

  insert into public.audit_log (case_id, action, detail) values (p_case_id, 'pfi.request.added', v_title);
  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- PFI: record an upload (rep of the institution, or staff)
--   p_files = [{ id?: uuid, name: text, size?: bigint, mime?: text, storage_path?: text }]
--   storage_path, when given, must lie under '{case_id}/{request_id}/'.
-- ---------------------------------------------------------------------------
create or replace function private.pfi_record_upload(p_request_id bigint, p_files jsonb)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_staff boolean := private.is_staff();
  v_req   public.pfi_requests;
  v_round public.pfi_rounds;
  v_name  text := private.caller_name();
  v_f     jsonb;
  v_fname text;
  v_path  text;
  v_id    uuid;
  v_ids   uuid[] := '{}';
  v_k     integer;
begin
  v_req := private.pfi_request_for_caller(p_request_id);

  if p_files is null or jsonb_typeof(p_files) <> 'array' or jsonb_array_length(p_files) = 0 then
    raise exception 'At least one file is required.' using errcode = '22023';
  end if;
  if v_req.status = 'Accepted' then
    raise exception 'This request has been accepted; no further uploads.' using errcode = '55000';
  end if;

  select * into v_round from public.pfi_rounds o
  where o.request_id = v_req.id and o.dropped_at is null
  order by o.n desc limit 1;

  if not found or v_req.status in ('Clarification required', 'Reupload required', 'Rejected') then
    insert into public.pfi_rounds (request_id, case_id, n, created_by)
    values (v_req.id, v_req.case_id, coalesce(v_round.n, 0) + 1, v_name)
    returning * into v_round;
  end if;

  for v_f in select value from jsonb_array_elements(p_files) loop
    v_fname := btrim(coalesce(v_f ->> 'name', ''));
    if v_fname = '' then
      raise exception 'Each file needs a name.' using errcode = '22023';
    end if;
    v_path := nullif(v_f ->> 'storage_path', '');
    if v_path is not null and left(v_path, length(v_req.case_id || '/' || v_req.id || '/')) <> v_req.case_id || '/' || v_req.id || '/' then
      raise exception 'storage_path must start with %/%/', v_req.case_id, v_req.id using errcode = '22023';
    end if;
    insert into public.pfi_files (id, round_id, request_id, case_id, name, size, mime, storage_path, uploaded_by, uploaded_by_id)
    values (
      coalesce(nullif(v_f ->> 'id', '')::uuid, gen_random_uuid()),
      v_round.id, v_req.id, v_req.case_id, v_fname,
      coalesce(nullif(v_f ->> 'size', '')::bigint, 0),
      coalesce(v_f ->> 'mime', ''),
      v_path, v_name, auth.uid()
    )
    returning id into v_id;
    v_ids := v_ids || v_id;
  end loop;

  v_k := array_length(v_ids, 1);
  update public.pfi_requests set status = 'Submitted' where id = v_req.id;

  insert into public.pfi_messages (request_id, case_id, kind, role, who, author_id, text)
  values (v_req.id, v_req.case_id, 'event', case when v_staff then 'dd' else 'rep' end, v_name, auth.uid(),
          format('Uploaded %s file%s as version %s.', v_k, case when v_k = 1 then '' else 's' end, v_round.n));

  insert into public.audit_log (case_id, action, detail)
  values (v_req.case_id, 'pfi.upload', format('%s Â· v%s Â· %s file(s)', v_req.title, v_round.n, v_k));

  return jsonb_build_object('round_id', v_round.id, 'n', v_round.n, 'file_ids', to_jsonb(v_ids), 'status', 'Submitted');
end;
$$;

-- ---------------------------------------------------------------------------
-- PFI: remove a file from the current version (soft delete)
--   staff: any status; rep: not once Accepted. Either way only files in the current
--   (latest live) version, as in the prototype.
-- ---------------------------------------------------------------------------
create or replace function private.pfi_remove_file(p_file_id uuid)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_staff  boolean := private.is_staff();
  v_rep    bigint  := private.rep_case_id();
  v_file   public.pfi_files;
  v_req    public.pfi_requests;
  v_round  public.pfi_rounds;
  v_name   text := private.caller_name();
  v_status text;
begin
  if not v_staff and v_rep is null then
    raise exception 'Not permitted.' using errcode = '42501';
  end if;
  select * into v_file from public.pfi_files f where f.id = p_file_id;
  if not found or v_file.removed_at is not null or (not v_staff and v_file.case_id <> v_rep) then
    raise exception 'File not found.' using errcode = 'P0002';
  end if;

  v_req := private.pfi_request_for_caller(v_file.request_id);
  if not v_staff and v_req.status = 'Accepted' then
    raise exception 'This request has been accepted; files can no longer be removed.' using errcode = '55000';
  end if;

  select * into v_round from public.pfi_rounds o
  where o.request_id = v_req.id and o.dropped_at is null
  order by o.n desc limit 1;
  if not found or v_round.id <> v_file.round_id then
    raise exception 'Only files in the current version can be removed.' using errcode = '55000';
  end if;

  update public.pfi_files set removed_at = now(), removed_by = v_name where id = v_file.id;

  if not exists (select 1 from public.pfi_files f where f.round_id = v_round.id and f.removed_at is null) then
    update public.pfi_rounds set dropped_at = now() where id = v_round.id;
  end if;

  v_status := v_req.status;
  if not exists (select 1 from public.pfi_rounds o where o.request_id = v_req.id and o.dropped_at is null) then
    v_status := 'Pending upload';
    update public.pfi_requests set status = v_status where id = v_req.id;
  end if;

  insert into public.pfi_messages (request_id, case_id, kind, role, who, author_id, text)
  values (v_req.id, v_req.case_id, 'event', case when v_staff then 'dd' else 'rep' end, v_name, auth.uid(),
          format('Removed %s from version %s.', v_file.name, v_round.n));

  insert into public.audit_log (case_id, action, detail)
  values (v_req.case_id, 'pfi.file.removed', format('%s Â· %s', v_req.title, v_file.name));

  return jsonb_build_object('file_id', v_file.id, 'storage_path', v_file.storage_path, 'status', v_status);
end;
$$;

-- ---------------------------------------------------------------------------
-- PFI: post to the thread
--   rep:   'reply' only, text required, only after staff have posted on the request;
--          Clarification required -> Submitted.
--   staff: 'comment' | 'clarify' | 'reupload' (text required)
--          'reject' (text required, a current version must exist, not already Rejected)
--          'accept' (text optional -> 'Accepted.', a current version must exist, not already Accepted)
-- ---------------------------------------------------------------------------
create or replace function private.pfi_post(p_request_id bigint, p_kind text, p_text text, p_about text)
returns public.pfi_messages
language plpgsql security definer
set search_path = ''
as $$
declare
  v_staff     boolean := private.is_staff();
  v_req       public.pfi_requests;
  v_text      text := btrim(coalesce(p_text, ''));
  v_has_round boolean;
  v_tag       text;
  v_status    text;
  v_msg       public.pfi_messages;
begin
  v_req := private.pfi_request_for_caller(p_request_id);

  if p_kind is null or p_kind not in ('reply', 'comment', 'clarify', 'reupload', 'reject', 'accept') then
    raise exception 'Unknown message kind.' using errcode = '22023';
  end if;
  if v_staff and p_kind = 'reply' then
    raise exception 'Only partner representatives can reply.' using errcode = '42501';
  end if;
  if not v_staff and p_kind <> 'reply' then
    raise exception 'Only the DD team can do this.' using errcode = '42501';
  end if;
  if p_kind <> 'accept' and v_text = '' then
    raise exception 'Text is required.' using errcode = '22023';
  end if;

  v_has_round := exists (select 1 from public.pfi_rounds o where o.request_id = v_req.id and o.dropped_at is null);

  if p_kind = 'reply'
     and not exists (select 1 from public.pfi_messages m where m.request_id = v_req.id and m.role = 'dd') then
    raise exception 'You can reply once the DD team has posted on this request.' using errcode = '55000';
  end if;
  if p_kind = 'reject' and (not v_has_round or v_req.status = 'Rejected') then
    raise exception 'Nothing to reject.' using errcode = '55000';
  end if;
  if p_kind = 'accept' and (not v_has_round or v_req.status = 'Accepted') then
    raise exception 'Nothing to accept.' using errcode = '55000';
  end if;

  v_tag := case p_kind
    when 'reply'    then 'Reply'
    when 'comment'  then 'Comment'
    when 'clarify'  then 'Clarification requested'
    when 'reupload' then 'Reupload requested'
    when 'reject'   then 'Rejected'
    when 'accept'   then 'Accepted'
  end;

  insert into public.pfi_messages (request_id, case_id, kind, role, who, author_id, text, about, tag)
  values (v_req.id, v_req.case_id, p_kind, case when v_staff then 'dd' else 'rep' end,
          private.caller_name(), auth.uid(),
          case when v_text = '' then 'Accepted.' else v_text end,
          case when v_staff then btrim(coalesce(p_about, '')) else '' end,
          v_tag)
  returning * into v_msg;

  v_status := case p_kind
    when 'clarify'  then 'Clarification required'
    when 'reupload' then 'Reupload required'
    when 'reject'   then 'Rejected'
    when 'accept'   then 'Accepted'
    when 'reply'    then case when v_req.status = 'Clarification required' then 'Submitted' else v_req.status end
    else v_req.status
  end;
  if v_status <> v_req.status then
    update public.pfi_requests set status = v_status where id = v_req.id;
  end if;

  insert into public.audit_log (case_id, action, detail) values (v_req.case_id, 'pfi.' || p_kind, v_req.title);
  return v_msg;
end;
$$;

-- ---------------------------------------------------------------------------
-- Public RPC wrappers (SECURITY INVOKER)
-- ---------------------------------------------------------------------------
create or replace function public.generate_report_version(p_case_id bigint, p_note text default '', p_snapshot jsonb default null)
returns public.report_versions
language sql security invoker
set search_path = ''
as $$ select * from private.generate_report_version(p_case_id, p_note, p_snapshot); $$;

create or replace function public.pfi_add_request(p_case_id bigint, p_title text, p_note text default '')
returns public.pfi_requests
language sql security invoker
set search_path = ''
as $$ select * from private.pfi_add_request(p_case_id, p_title, p_note); $$;

create or replace function public.pfi_record_upload(p_request_id bigint, p_files jsonb)
returns jsonb
language sql security invoker
set search_path = ''
as $$ select private.pfi_record_upload(p_request_id, p_files); $$;

create or replace function public.pfi_remove_file(p_file_id uuid)
returns jsonb
language sql security invoker
set search_path = ''
as $$ select private.pfi_remove_file(p_file_id); $$;

create or replace function public.pfi_post(p_request_id bigint, p_kind text, p_text text default '', p_about text default '')
returns public.pfi_messages
language sql security invoker
set search_path = ''
as $$ select * from private.pfi_post(p_request_id, p_kind, p_text, p_about); $$;

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------
revoke all on function
  private.caller_name(), private.pfi_request_for_caller(bigint),
  private.generate_report_version(bigint, text, jsonb), private.pfi_add_request(bigint, text, text),
  private.pfi_record_upload(bigint, jsonb), private.pfi_remove_file(uuid),
  private.pfi_post(bigint, text, text, text)
  from public, anon, authenticated;
grant execute on function
  private.caller_name(), private.pfi_request_for_caller(bigint),
  private.generate_report_version(bigint, text, jsonb), private.pfi_add_request(bigint, text, text),
  private.pfi_record_upload(bigint, jsonb), private.pfi_remove_file(uuid),
  private.pfi_post(bigint, text, text, text)
  to authenticated, service_role;

revoke all on function
  public.generate_report_version(bigint, text, jsonb), public.pfi_add_request(bigint, text, text),
  public.pfi_record_upload(bigint, jsonb), public.pfi_remove_file(uuid),
  public.pfi_post(bigint, text, text, text)
  from public, anon;
grant execute on function
  public.generate_report_version(bigint, text, jsonb), public.pfi_add_request(bigint, text, text),
  public.pfi_record_upload(bigint, jsonb), public.pfi_remove_file(uuid),
  public.pfi_post(bigint, text, text, text)
  to authenticated, service_role;
