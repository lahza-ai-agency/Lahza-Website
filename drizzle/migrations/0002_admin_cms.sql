-- Admin dashboard: site content (CMS), inquiry management, first-run setup helper.

-- 1) Editable site content (brand/contact, pricing, services, page copy). Public read, admin write.
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant all on public.site_content to service_role;
alter table public.site_content enable row level security;
create policy "anyone reads content" on public.site_content for select to anon, authenticated using (true);
create policy "admin writes content" on public.site_content for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- 2) Inquiry handling
alter table public.contact_requests add column if not exists status text not null default 'new';
alter table public.contact_requests add column if not exists notes text;
grant update on public.contact_requests to authenticated;
create policy "admin updates inquiries" on public.contact_requests for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- 3) Admins can edit client profiles
create policy "admin updates profiles" on public.profiles for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
