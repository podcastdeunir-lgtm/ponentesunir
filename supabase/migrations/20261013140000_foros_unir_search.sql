-- Datos de archivo de Foros UNIR. Ejecutar en el proyecto asignado únicamente.
-- Las claves publicadas se preservan para permitir importaciones idempotentes.
create table if not exists public.foros_unir_fuentes (
  id text primary key, url text not null, titulo text not null, fecha date,
  descripcion_publicada text, facultad_publicada text, areas_publicadas jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb, imported_at timestamptz not null default now()
);
create table if not exists public.identidades_foros_unir (
  id text primary key, nombre_publicado text not null, variantes jsonb not null default '[]'::jsonb,
  especialidades_publicadas jsonb not null default '[]'::jsonb, metadata jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now()
);
create table if not exists public.participaciones_foros_unir (
  foro_id text not null references public.foros_unir_fuentes(id) on delete cascade,
  identidad_id text not null references public.identidades_foros_unir(id) on delete cascade,
  nombre_publicado text not null, rol_publicado text, rol_participacion text,
  bio_publicada text, especialidades_publicadas jsonb not null default '[]'::jsonb,
  fuente_url text not null, fecha_foro date,
  primary key (foro_id, identidad_id, nombre_publicado)
);
create table if not exists public.etiquetas_foros_unir (
  id text primary key, nivel_1 text, nivel_2 text, nivel_3 text, etiqueta text not null,
  estado text not null, metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.evidencias_etiquetas_foros_unir (
  foro_id text not null references public.foros_unir_fuentes(id) on delete cascade,
  etiqueta_id text not null references public.etiquetas_foros_unir(id) on delete cascade,
  evidencia text not null, metodo text not null, primary key (foro_id, etiqueta_id)
);
create table if not exists public.aliases_foros_unir_pendientes (
  nombre_a text not null, nombre_b text not null, estado text not null,
  primary key (nombre_a, nombre_b)
);
alter table public.foros_unir_fuentes enable row level security;
alter table public.identidades_foros_unir enable row level security;
alter table public.participaciones_foros_unir enable row level security;
alter table public.etiquetas_foros_unir enable row level security;
alter table public.evidencias_etiquetas_foros_unir enable row level security;
alter table public.aliases_foros_unir_pendientes enable row level security;
create policy "staff read foros unir" on public.foros_unir_fuentes for select to authenticated using (true);
create policy "staff read identities foros unir" on public.identidades_foros_unir for select to authenticated using (true);
create policy "staff read appearances foros unir" on public.participaciones_foros_unir for select to authenticated using (true);
create policy "staff read tags foros unir" on public.etiquetas_foros_unir for select to authenticated using (true);
create policy "staff read evidence foros unir" on public.evidencias_etiquetas_foros_unir for select to authenticated using (true);
create policy "staff read aliases foros unir" on public.aliases_foros_unir_pendientes for select to authenticated using (true);
