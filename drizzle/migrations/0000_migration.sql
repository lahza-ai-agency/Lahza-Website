create type public.app_role as enum ('admin','client');

create table public.profiles (
  id uuid primary key,
  full_name text,
  company text,
  email text,
  created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own or admin read profiles" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own update profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, company, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'company', new.email);
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'client');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- portal tables: every row belongs to a client
create table public.projects (id uuid primary key default gen_random_uuid(), client_id uuid not null, name text not null, description text, status text not null default 'active', progress int not null default 0, due_date date, created_at timestamptz not null default now());
create table public.tasks (id uuid primary key default gen_random_uuid(), client_id uuid not null, project_id uuid references public.projects(id) on delete cascade, title text not null, status text not null default 'todo', due_date date, created_at timestamptz not null default now());
create table public.approvals (id uuid primary key default gen_random_uuid(), client_id uuid not null, title text not null, details text, link text, status text not null default 'pending', feedback text, created_at timestamptz not null default now());
create table public.campaigns (id uuid primary key default gen_random_uuid(), client_id uuid not null, name text not null, channel text, status text not null default 'planned', budget numeric, start_date date, created_at timestamptz not null default now());
create table public.reports (id uuid primary key default gen_random_uuid(), client_id uuid not null, title text not null, period text, summary text, link text, created_at timestamptz not null default now());
create table public.files (id uuid primary key default gen_random_uuid(), client_id uuid not null, name text not null, url text not null, created_at timestamptz not null default now());
create table public.invoices (id uuid primary key default gen_random_uuid(), client_id uuid not null, number text not null, amount numeric not null default 0, currency text not null default 'EGP', status text not null default 'unpaid', due_date date, created_at timestamptz not null default now());
create table public.messages (id uuid primary key default gen_random_uuid(), client_id uuid not null, sender_id uuid not null default auth.uid(), body text not null, created_at timestamptz not null default now());
create table public.tickets (id uuid primary key default gen_random_uuid(), client_id uuid not null, subject text not null, body text, status text not null default 'open', reply text, created_at timestamptz not null default now());

do $$ declare t text; begin
  foreach t in array array['projects','tasks','approvals','campaigns','reports','files','invoices','messages','tickets'] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "client reads own" on public.%I for select to authenticated using (client_id = auth.uid() or public.has_role(auth.uid(),''admin''))', t);
    execute format('create policy "admin manages" on public.%I for all to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

create policy "client sends messages" on public.messages for insert to authenticated
  with check (client_id = auth.uid() and sender_id = auth.uid());
create policy "client opens tickets" on public.tickets for insert to authenticated
  with check (client_id = auth.uid());
create policy "client answers approvals" on public.approvals for update to authenticated
  using (client_id = auth.uid()) with check (client_id = auth.uid());

-- clients may only change approval status/feedback
create or replace function public.guard_approval_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then
    if new.title is distinct from old.title or new.details is distinct from old.details
       or new.link is distinct from old.link or new.client_id is distinct from old.client_id then
      raise exception 'Only status and feedback can be changed';
    end if;
    if new.status not in ('approved','changes') then raise exception 'Invalid status'; end if;
  end if;
  return new;
end $$;
create trigger guard_approval before update on public.approvals for each row execute function public.guard_approval_update();

alter publication supabase_realtime add table public.messages;