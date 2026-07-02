create extension if not exists pgcrypto;

create table if not exists public.invitations (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  invitation_id text not null references public.invitations(id) on delete cascade,
  date text not null,
  time text not null,
  activity text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table public.invitations enable row level security;
alter table public.responses enable row level security;

drop policy if exists "Anyone can create invitations" on public.invitations;
create policy "Anyone can create invitations"
on public.invitations
for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can create responses" on public.responses;
create policy "Anyone can create responses"
on public.responses
for insert
to anon, authenticated
with check (true);

create or replace function public.get_invitation(invitation_id text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select data
  from public.invitations
  where id = invitation_id
  limit 1;
$$;

grant execute on function public.get_invitation(text) to anon, authenticated;
