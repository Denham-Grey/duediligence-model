-- Supabase's default event-trigger helper does not need to be callable through the API
-- (advisor lints 0028/0029). The event trigger itself keeps working.
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
