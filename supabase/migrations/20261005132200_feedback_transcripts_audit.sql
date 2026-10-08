-- Internal knowledge layer for forum transcripts, individual assessments and auditing.
-- This file creates schema only; it does not import or alter the Excel source files.

create schema if not exists private;
revoke all on schema private from public;

create type public.staff_role as enum ('administrador', 'gestor', 'lector');
create type public.review_recommendation as enum ('repetir', 'pendiente', 'no_repetir');
create type public.transcript_state as enum ('pendiente', 'disponible', 'no_publica', 'revisar');

-- Managed by an administrator after the corporate identity has been verified.
create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre text not null,
  rol public.staff_role not null default 'lector',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stores only transcripts that are public or for which UNIR has a right to reuse them.
create table public.forum_transcripts (
  id uuid primary key default gen_random_uuid(),
  foro_id uuid not null references public.foros(id) on delete cascade,
  source_url text not null,
  idioma text not null default 'es',
  estado public.transcript_state not null default 'pendiente',
  contenido text,
  resumen text,
  temas_clave text[] not null default '{}',
  source_updated_at timestamptz,
  imported_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (foro_id, idioma)
);

-- Every editor has their own assessment; no-one can overwrite another editor's view.
create table public.speaker_reviews (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null references public.personas(id) on delete cascade,
  participacion_id uuid references public.participaciones(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  estrellas smallint not null check (estrellas between 1 and 5),
  aportacion smallint check (aportacion between 1 and 5),
  recomendacion public.review_recommendation not null default 'pendiente',
  comentario text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index speaker_reviews_per_participation_author
  on public.speaker_reviews(persona_id, participacion_id, author_id)
  where participacion_id is not null;
create unique index speaker_reviews_per_person_author
  on public.speaker_reviews(persona_id, author_id)
  where participacion_id is null;
create index forum_transcripts_forum_idx on public.forum_transcripts(foro_id);
create index speaker_reviews_persona_idx on public.speaker_reviews(persona_id);

-- The log is written by a trigger, never by a browser client.
create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_entity_idx on public.audit_events(entity_type, entity_id, created_at desc);

alter table public.staff_profiles enable row level security;
alter table public.forum_transcripts enable row level security;
alter table public.speaker_reviews enable row level security;
alter table public.audit_events enable row level security;

-- Read access is limited to an authenticated internal session. Writes to profiles,
-- transcripts and the audit log are made only from privileged server code.
create policy "authenticated staff can read staff profiles" on public.staff_profiles
  for select to authenticated using (true);
create policy "authenticated staff can read transcripts" on public.forum_transcripts
  for select to authenticated using (true);
create policy "authenticated staff can read reviews" on public.speaker_reviews
  for select to authenticated using (true);
create policy "authors add their own review" on public.speaker_reviews
  for insert to authenticated with check ((select auth.uid()) = author_id);
create policy "authors update their own review" on public.speaker_reviews
  for update to authenticated using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);
create policy "authors delete their own review" on public.speaker_reviews
  for delete to authenticated using ((select auth.uid()) = author_id);
create policy "authenticated staff can read audit" on public.audit_events
  for select to authenticated using (true);

-- The function lives in a non-exposed schema and is executed only by triggers.
create or replace function private.audit_directory_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    insert into public.audit_events(actor_id, action, entity_type, entity_id, before_data)
    values ((select auth.uid()), lower(tg_op), tg_table_name, old.id, to_jsonb(old));
    return old;
  end if;

  insert into public.audit_events(actor_id, action, entity_type, entity_id, before_data, after_data)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    new.id,
    case when tg_op = 'UPDATE' then to_jsonb(old) else null end,
    to_jsonb(new)
  );
  return new;
end;
$$;
revoke all on function private.audit_directory_change() from public;

create trigger audit_personas
after insert or update or delete on public.personas
for each row execute function private.audit_directory_change();
create trigger audit_foros
after insert or update or delete on public.foros
for each row execute function private.audit_directory_change();
create trigger audit_participaciones
after insert or update or delete on public.participaciones
for each row execute function private.audit_directory_change();
create trigger audit_radar
after insert or update or delete on public.radar
for each row execute function private.audit_directory_change();
create trigger audit_forum_transcripts
after insert or update or delete on public.forum_transcripts
for each row execute function private.audit_directory_change();
create trigger audit_speaker_reviews
after insert or update or delete on public.speaker_reviews
for each row execute function private.audit_directory_change();
