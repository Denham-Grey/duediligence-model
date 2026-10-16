-- One-off cleanup (decision: option A, 16 Oct 2026) — run by the project owner in the
-- Supabase Dashboard → SQL Editor. Not a migration; not run by the app or by Claude.
--
-- Removes the two fixture cases the M3 RLS test suite left behind ("RLS Test Bank A" / "B")
-- together with their audit rows and report versions, which are otherwise immutable.
-- Everything runs in ONE transaction: the two immutability triggers are switched off only for
-- these deletes and switched back on before COMMIT, so the protection is never off for anyone
-- else. The script aborts, changing nothing, if the database holds any case other than the two
-- fixtures, any user profile, or any audit row that does not belong to them.

begin;

do $$
declare
  other_cases int;
  other_audit int;
  n_profiles int;
begin
  select count(*) into other_cases from public.cases where bank not in ('RLS Test Bank A', 'RLS Test Bank B');
  select count(*) into other_audit from public.audit_log
    where case_id is null or case_id not in (select id from public.cases where bank in ('RLS Test Bank A', 'RLS Test Bank B'));
  select count(*) into n_profiles from public.profiles;
  if other_cases > 0 or other_audit > 0 or n_profiles > 0 then
    raise exception 'Aborted: found % other case(s), % other audit row(s), % profile(s). Nothing was changed.',
      other_cases, other_audit, n_profiles;
  end if;
end $$;

alter table public.audit_log disable trigger audit_log_immutable;
alter table public.report_versions disable trigger report_versions_immutable;

delete from public.audit_log
  where case_id in (select id from public.cases where bank in ('RLS Test Bank A', 'RLS Test Bank B'));
delete from public.report_versions
  where case_id in (select id from public.cases where bank in ('RLS Test Bank A', 'RLS Test Bank B'));
-- Sections, report parts and partner-document rows cascade from the case.
delete from public.cases where bank in ('RLS Test Bank A', 'RLS Test Bank B');

alter table public.audit_log enable trigger audit_log_immutable;
alter table public.report_versions enable trigger report_versions_immutable;

-- Case numbers start again at 1, so the demo seed can use the prototype's ids (1–3).
alter table public.cases alter column id restart with 1;

commit;

-- Check (must show 0 / 0 / 0 and both triggers enabled = 'O'):
select 'cases' as what, count(*)::text as value from public.cases
union all select 'audit_log', count(*)::text from public.audit_log
union all select 'report_versions', count(*)::text from public.report_versions
union all select tgname, tgenabled::text from pg_trigger
  where tgname in ('audit_log_immutable', 'report_versions_immutable');
