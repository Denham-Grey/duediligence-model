-- M3 / 4 of 4 — private storage buckets (50 MB per file).
-- No storage.objects policies are created for anon/authenticated: every file read or
-- write goes through server routes using the service role and short-lived signed URLs.
--   partner-files/{case_id}/{request_id}/{round_n}/{file_id}
--   section-files/{case_id}/{section_code}/{file_id}
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('partner-files', 'partner-files', false, 52428800),
  ('section-files', 'section-files', false, 52428800)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;
