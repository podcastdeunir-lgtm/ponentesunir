#!/usr/bin/env node
import { readFileSync } from 'node:fs';
const file = process.argv[2]; if (!file) throw new Error('Indica el JSON fuente.');
const d = JSON.parse(readFileSync(file, 'utf8'));
const ids = key => new Set(d[key].map(x => x.id));
const forumIds = ids('forums'), speakerIds = ids('speakers');
const appearances = new Set(); let failures = [];
for (const a of d.appearances) { const key = `${a.forum_id}:${a.speaker_id}:${a.name_as_published}`; if (appearances.has(key)) failures.push(`duplicada: ${key}`); appearances.add(key); if (!forumIds.has(a.forum_id)) failures.push(`foro ausente: ${a.forum_id}`); if (!speakerIds.has(a.speaker_id)) failures.push(`ponente ausente: ${a.speaker_id}`); }
for (const tag of d.taxonomy) { for (const id of tag.forum_ids) if (!forumIds.has(id)) failures.push(`etiqueta ${tag.id} → foro ausente ${id}`); for (const id of tag.speaker_ids) if (!speakerIds.has(id)) failures.push(`etiqueta ${tag.id} → ponente ausente ${id}`); }
const expected = d.stats;
if (d.forums.length !== expected.forums) failures.push('recuento de foros');
if (d.speakers.length !== expected.unique_speakers) failures.push('recuento de identidades');
if (d.appearances.length !== expected.appearances) failures.push('recuento de participaciones');
if (d.taxonomy.length !== 44) failures.push('recuento de intenciones/tags');
console.log(JSON.stringify({ valid: failures.length === 0, counts: { forums: d.forums.length, speakers: d.speakers.length, appearances: d.appearances.length, areas: d.areas.length, taxonomy: d.taxonomy.length }, failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
