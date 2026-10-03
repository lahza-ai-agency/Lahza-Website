create table public.contact_requests (id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text, company text, interest text, message text not null, created_at timestamptz not null default now());
grant insert on public.contact_requests to anon, authenticated;
grant select, delete on public.contact_requests to authenticated;
grant all on public.contact_requests to service_role;
alter table public.contact_requests enable row level security;
create policy "anyone can send" on public.contact_requests for insert to anon, authenticated
  with check (char_length(name) between 1 and 120 and char_length(email) between 3 and 255 and char_length(message) between 1 and 4000);
create policy "admin reads" on public.contact_requests for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin deletes" on public.contact_requests for delete to authenticated using (public.has_role(auth.uid(),'admin'));