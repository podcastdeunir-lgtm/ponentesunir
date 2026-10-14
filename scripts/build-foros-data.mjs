#!/usr/bin/env node
/* Build traceable, versionable local artifacts from foros_unir_buscador.json.
   Usage: node scripts/build-foros-data.mjs /absolute/path/to/foros_unir_buscador.json */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const input = process.argv[2];
if (!input) throw new Error('Indica la ruta del JSON fuente.');
const raw = readFileSync(input); const source = JSON.parse(raw);
const output = resolve('data/foros-unir'); mkdirSync(output, { recursive: true });
const sha256 = createHash('sha256').update(raw).digest('hex');
const byId = new Map(source.speakers.map(x => [x.id, x]));
const forums = new Map(source.forums.map(x => [x.id, x]));
const appearances = new Map();
for (const a of source.appearances) { const key = `${a.forum_id}:${a.speaker_id}:${a.name_as_published}`; if (!appearances.has(key)) appearances.set(key, a); }
const tagEvidence = new Map(source.tag_evidence.map(x => [`${x.tag_id}:${x.forum_id}`, x]));
const evaluations = source.taxonomy.map(tag => {
  const candidates = tag.speaker_ids.map(speaker_id => {
    const speaker = byId.get(speaker_id); const relevant = [...appearances.values()].filter(a => a.speaker_id === speaker_id && tag.forum_ids.includes(a.forum_id));
    const appearance = relevant[0]; const forum = appearance && forums.get(appearance.forum_id);
    const specialty = (speaker.explicit_specialties ?? []).find(s => /.+/.test(s));
    const evidence = forum && tagEvidence.get(`${tag.id}:${forum.id}`);
    return { speaker_id, status: specialty ? 'directly_supported_if_specialty_is_relevant' : 'related_requires_review', evidence_type: specialty ? 'explicit_specialty_or_participation' : 'thematic_participation', forum_id: forum?.id ?? null, source_url: appearance?.source_url ?? forum?.url ?? null, excerpt: specialty ?? evidence?.evidence ?? null };
  });
  return { id: `eval_${tag.id}`, tag_id: tag.id, natural_query: tag.query, short_query: tag.label.split(' > ').slice(-1)[0], noisy_or_synonym_query: tag.lexical_pattern ?? tag.label, interpretation: tag.label, filters: { tag_id: tag.id, forum_ids: tag.forum_ids }, expected_candidates: candidates, excluded_candidates: 'No incluir participantes fuera de los foros vinculados ni convertir una participación temática en especialidad.', limitations: [tag.status, 'Los candidatos marcados related_requires_review no son una acreditación de especialidad.'] };
});
const explicitCases = [
  { id: 'edge_accent', query: 'Adrian Suarez Mourino', expected_speaker_ids: ['ponente_f5064b3cda15'], expectation: 'Normaliza tildes; contrastar con la fuente.' },
  { id: 'edge_combined', query: 'IA para diseño y animación', expected_tag_ids: ['tag_001', 'tag_035'], expectation: 'Admite varias intenciones, sin exigir un orden.' },
  { id: 'edge_ambiguous', query: 'seguridad', expected_tag_ids: ['tag_005', 'tag_037', 'tag_038'], expectation: 'Debe pedir o mostrar desambiguación por contexto.' },
  { id: 'edge_no_answer', query: 'especialista en astrofísica cuántica de UNIR', expected_speaker_ids: [], expectation: 'No inventar candidatos.' },
  { id: 'edge_not_credential', query: 'especialista en microbiota y rendimiento deportivo', expected_tag_ids: ['tag_018', 'tag_021'], expectation: 'Distinguir especialidades publicadas de participación temática.' },
  { id: 'edge_moderator', query: 'especialista en podcast', expected_tag_ids: ['tag_028'], expectation: 'No presentar moderadores como especialistas si el rol no lo acredita.' },
];
const evaluation = { schema_version: '1.0', source: { path: input, sha256, retrieved_at_utc: source.retrieved_at_utc, scope: source.scope }, generated_at_utc: new Date().toISOString(), evaluations, edge_cases: explicitCases };
const manifest = { source_file_sha256: sha256, source_schema_version: source.schema_version, counts: { forums: source.forums.length, speakers: source.speakers.length, appearances: source.appearances.length, unique_appearance_rows: appearances.size, areas: source.areas.length, taxonomy: source.taxonomy.length, evaluation_intents: evaluations.length }, known_gaps: source.field_gaps, possible_aliases_not_merged: source.possible_aliases, import_key: { forums: 'id', speakers: 'id', appearances: 'forum_id + speaker_id + name_as_published' } };
const normalizedArchive = { schema_version: '1.0', source: { sha256, retrieved_at_utc: source.retrieved_at_utc, scope: source.scope }, entities: { forums: source.forums, identities: source.speakers, appearances: source.appearances, areas: source.areas, tags: source.taxonomy, tag_evidence: source.tag_evidence, possible_aliases: source.possible_aliases, field_gaps: source.field_gaps } };
writeFileSync(`${output}/normalized-archive.json`, JSON.stringify(normalizedArchive, null, 2) + '\n');
writeFileSync(`${output}/evaluation-queries.json`, JSON.stringify(evaluation, null, 2) + '\n');
writeFileSync(`${output}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
const header = ['evaluation_id','tag_id','natural_query','short_query','candidate_speaker_id','candidate_status','forum_id','source_url','excerpt'];
const csv = [header.join(',')];
for (const e of evaluations) for (const c of e.expected_candidates) csv.push([e.id,e.tag_id,e.natural_query,e.short_query,c.speaker_id,c.status,c.forum_id ?? '',c.source_url ?? '',c.excerpt ?? ''].map(v => `"${String(v).replaceAll('"','""')}"`).join(','));
writeFileSync(`${output}/evaluation-queries.csv`, csv.join('\n') + '\n');
console.log(JSON.stringify(manifest.counts));
