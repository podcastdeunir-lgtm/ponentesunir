/** Deterministic, local search for the UNIR forum archive.
 *
 * It intentionally separates published specialties from thematic participation:
 * a thematic match is useful for discovery, but is never presented as a credential.
 */
export type ForumSource = { id: string; title: string; date: string | null; url: string; description_full?: string; tags?: string[] };
export type AppearanceSource = { forum_id: string; speaker_id: string; role_as_published?: string | null; bio_as_published?: string | null; explicit_specialty_sentences?: string[]; participation_role?: string | null; source_url: string };
export type SpeakerSource = { id: string; name: string; name_variants?: string[]; explicit_specialties?: string[]; tags?: string[]; forum_ids?: string[] };
export type TagSource = { id: string; label: string; lexical_pattern?: string; speaker_ids?: string[]; forum_ids?: string[] };

export type SearchData = { forums: ForumSource[]; speakers: SpeakerSource[]; appearances: AppearanceSource[]; taxonomy: TagSource[] };
export type SearchResult = { speaker_id: string; name: string; score: number; evidence_type: 'explicit_specialty' | 'thematic_participation'; reason: string; forum: { id: string; title: string; date: string | null; url: string }; excerpt: string; limitations: string[] };

const synonyms: Record<string, string[]> = {
  ia: ['inteligencia artificial', 'inteligencia artificial generativa', 'iag'],
  inteligencia: ['ia'], gamificacion: ['juego', 'ludificacion'], aula: ['educacion', 'alumnado'],
  podcast: ['podcast', 'podcasting', 'podcast'], ciberseguridad: ['ciberseguridad', 'ciberdefensa', 'seguridad digital'],
  pantallas: ['digital', 'moviles', 'redes'], microbiota: ['nutricion', 'alimentacion'],
  liderazgo: ['lideres', 'equipos', 'bienestar'], geopolitica: ['seguridad internacional'],
  animacion: ['3d', 'diseno'], diseno: ['animacion'],
};

export function normalize(value = ''): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

function queryTerms(query: string) {
  const initial = normalize(query).split(' ').filter(x => x.length > 1);
  return [...new Set(initial.flatMap(term => [term, ...(synonyms[term] ?? []).flatMap(normalize)]))];
}
function overlap(terms: string[], text: string) { const normalized = normalize(text); return terms.filter(t => normalized.includes(t)).length; }
function snippet(text: string, terms: string[]) {
  const plain = text.replace(/\s+/g, ' ').trim(); const hit = terms.map(t => normalize(plain).indexOf(t)).find(i => i >= 0) ?? 0;
  return plain.slice(Math.max(0, hit - 80), hit + 240).trim();
}

export function searchForos(query: string, data: SearchData, limit = 12): SearchResult[] {
  const directTerms = normalize(query).split(' ').filter(x => x.length > 1);
  const terms = queryTerms(query); if (!terms.length) return [];
  const forums = new Map(data.forums.map(f => [f.id, f]));
  const tagById = new Map(data.taxonomy.map(t => [t.id, t]));
  const results: SearchResult[] = [];
  for (const speaker of data.speakers) {
    const specialties = speaker.explicit_specialties ?? [];
    // A broad synonym (for example, "educación" expanded from "aula") can
    // discover a forum, but cannot by itself turn an unrelated profile into an
    // explicitly qualified specialist. Direct evidence uses the literal terms.
    const direct = specialties.map(s => ({ value: s, hits: overlap(directTerms, s) })).sort((a, b) => b.hits - a.hits)[0];
    const appearances = data.appearances.filter(a => a.speaker_id === speaker.id);
    const thematic = appearances.map(a => {
      const forum = forums.get(a.forum_id); if (!forum) return null;
      const tagText = (forum.tags ?? []).map(id => tagById.get(id)?.label ?? '').join(' ');
      const text = [forum.title, forum.description_full, a.bio_as_published, tagText].filter(Boolean).join(' ');
      return { a, forum, text, hits: overlap(terms, text) };
    }).filter(Boolean).sort((a: any, b: any) => b.hits - a.hits)[0] as any;
    if ((!direct || direct.hits === 0) && (!thematic || thematic.hits === 0)) continue;
    const isDirect = Boolean(direct?.hits && (!thematic || direct.hits * 5 >= thematic.hits * 4));
    const chosen = thematic;
    if (!chosen) continue;
    const type = isDirect ? 'explicit_specialty' : 'thematic_participation';
    const excerpt = isDirect ? direct.value : snippet(chosen.text, terms);
    results.push({
      speaker_id: speaker.id, name: speaker.name, score: (isDirect ? 100 : 40) + (direct?.hits ?? 0) * 10 + chosen.hits * 4,
      evidence_type: type,
      reason: isDirect ? `Especialidad publicada: ${direct.value}` : `Participó en el foro «${chosen.forum.title}», relacionado con la consulta.`,
      forum: { id: chosen.forum.id, title: chosen.forum.title, date: chosen.forum.date, url: chosen.forum.url }, excerpt,
      limitations: type === 'thematic_participation' ? ['La participación temática no acredita por sí sola una especialidad.'] : [],
    });
  }
  return results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'es')).slice(0, limit);
}
