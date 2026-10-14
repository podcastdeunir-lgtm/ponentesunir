/** Server-only, idempotent import for the UNIR forum archive.
 * Run this from a trusted job with a Supabase service-role client; never in a browser.
 */
import { readFile } from 'node:fs/promises';
import type { SupabaseClient } from '@supabase/supabase-js';

type Archive = any;
const chunks = <T,>(items: T[], size = 250) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));
async function upsert(client: SupabaseClient, table: string, rows: unknown[], conflict: string) {
  for (const group of chunks(rows)) { const { error } = await client.from(table).upsert(group, { onConflict: conflict }); if (error) throw new Error(`${table}: ${error.message}`); }
}

export async function importForosUnir(client: SupabaseClient, jsonPath: string) {
  const source = JSON.parse(await readFile(jsonPath, 'utf8')) as Archive;
  await upsert(client, 'foros_unir_fuentes', source.forums.map((f: any) => ({ id: f.id, url: f.url, titulo: f.title, fecha: f.date, descripcion_publicada: f.description_full ?? f.description, facultad_publicada: f.faculty, areas_publicadas: f.areas, metadata: { date_metadata: f.date_metadata, time: f.time, event_type: f.event_type, listing_urls: f.listing_urls } })), 'id');
  await upsert(client, 'identidades_foros_unir', source.speakers.map((s: any) => ({ id: s.id, nombre_publicado: s.name, variantes: s.name_variants ?? [], especialidades_publicadas: s.explicit_specialties ?? [], metadata: { source_urls: s.source_urls ?? [], areas: s.areas ?? [], forum_count: s.forum_count ?? 0 } })), 'id');
  // The composite primary key preserves repeated program lines only when their published name differs.
  await upsert(client, 'participaciones_foros_unir', source.appearances.map((a: any) => ({ foro_id: a.forum_id, identidad_id: a.speaker_id, nombre_publicado: a.name_as_published, rol_publicado: a.role_as_published, rol_participacion: a.participation_role, bio_publicada: a.bio_as_published, especialidades_publicadas: a.explicit_specialty_sentences ?? [], fuente_url: a.source_url, fecha_foro: a.forum_date })), 'foro_id,identidad_id,nombre_publicado');
  await upsert(client, 'etiquetas_foros_unir', source.taxonomy.map((t: any) => ({ id: t.id, nivel_1: t.level1, nivel_2: t.level2, nivel_3: t.level3, etiqueta: t.label, estado: t.status, metadata: { lexical_pattern: t.lexical_pattern, query: t.query, forum_ids: t.forum_ids, speaker_ids: t.speaker_ids } })), 'id');
  await upsert(client, 'evidencias_etiquetas_foros_unir', source.tag_evidence.map((e: any) => ({ foro_id: e.forum_id, etiqueta_id: e.tag_id, evidencia: e.evidence, metodo: e.method })), 'foro_id,etiqueta_id');
  await upsert(client, 'aliases_foros_unir_pendientes', source.possible_aliases.map((a: any) => ({ nombre_a: a.name_a, nombre_b: a.name_b, estado: a.status })), 'nombre_a,nombre_b');
  return { forums: source.forums.length, identities: source.speakers.length, appearances: source.appearances.length, tags: source.taxonomy.length };
}
