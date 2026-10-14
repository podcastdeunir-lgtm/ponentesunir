/** Deterministic, evidence-first search for the UNIR forum archive.
 * Published specialties and contextual participation are always separated.
 */
export type ForumSource = { id: string; title: string; date: string | null; url: string; description_full?: string; tags?: string[] };
export type AppearanceSource = { forum_id: string; speaker_id: string; role_as_published?: string | null; bio_as_published?: string | null; explicit_specialty_sentences?: string[]; participation_role?: string | null; source_url: string };
export type SpeakerSource = { id: string; name: string; name_variants?: string[]; explicit_specialties?: string[]; tags?: string[]; forum_ids?: string[] };
export type TagSource = { id: string; label: string; lexical_pattern?: string; speaker_ids?: string[]; forum_ids?: string[] };

export type SearchData = { forums: ForumSource[]; speakers: SpeakerSource[]; appearances: AppearanceSource[]; taxonomy: TagSource[] };
export type SearchResult = {
  speaker_id: string; name: string; score: number; evidence_type: 'explicit_specialty' | 'thematic_participation';
  reason: string; excerpt: string; matched_concepts: string[]; matched_tags: string[];
  forum: { id: string; title: string; date: string | null; url: string }; limitations: string[];
};

export type ForumConcept = { label: string; phrases: string[] };
const ignoredWords = new Set(['a','al','de','del','el','en','es','experto','experta','foros','foro','la','las','lo','los','para','ponente','ponentes','que','quiero','sobre','un','una','y','ya','haya','han','participado','aplicada','aplicado','aplicar','tema','temas','gestion']);
const concepts: ForumConcept[] = [
  { label: 'Inteligencia artificial', phrases: ['inteligencia artificial', 'ia generativa', 'inteligencia generativa', 'iag', 'ia', 'prompts', 'automatizacion', 'agentes de ia'] },
  { label: 'Tecnología digital', phrases: ['tecnologia', 'tecnologico', 'transformacion digital', 'desarrollo de software', 'software', 'iot', 'industria digital'] },
  { label: 'Gestión pública', phrases: ['gestion publica', 'administracion publica', 'sector publico', 'politica publica', 'gobierno abierto', 'gobernanza', 'empleo publico', 'contratacion publica', 'estado abierto'] },
  { label: 'Literatura', phrases: ['literatura', 'literario', 'escritor', 'escritora', 'poesia', 'poeta', 'dramaturgia', 'dramaturgo', 'novela', 'editorial'] },
  { label: 'Cultura', phrases: ['cultura', 'cultural', 'patrimonio', 'humanidades', 'cine', 'musica', 'audiovisual'] },
  { label: 'Educación', phrases: ['educacion', 'docencia', 'docente', 'pedagogia', 'aprendizaje', 'aula', 'alumnado', 'gamificacion', 'inclusion', 'altas capacidades', 'acoso escolar', 'oposiciones', 'formacion profesional'] },
  { label: 'Salud', phrases: ['salud', 'sanitario', 'medicina', 'psicologia', 'psiquiatria', 'nutricion', 'microbiota', 'salud mental', 'dependencia', 'trastornos alimentarios', 'cancer infantil'] },
  { label: 'Ciberseguridad', phrases: ['ciberseguridad', 'ciberdefensa', 'seguridad digital', 'seguridad de la informacion'] },
  { label: 'Empresa e innovación', phrases: ['empresa', 'empresas', 'negocio', 'innovacion', 'emprendimiento', 'liderazgo', 'logistica', 'empleo', 'competencias'] },
  { label: 'Deporte', phrases: ['deporte', 'deportivo', 'rendimiento', 'esports', 'e sports', 'gaming'] },
  { label: 'Comunicación', phrases: ['comunicacion', 'marketing', 'podcast', 'periodismo', 'oratoria', 'storytelling', 'seo', 'ventas'] },
  { label: 'Diseño y creatividad', phrases: ['diseno', 'creatividad', 'animacion', '3d', 'interiorismo'] },
  { label: 'Sociedad, derecho y seguridad', phrases: ['criminologia', 'geopolitica', 'seguridad internacional', 'fiscalidad', 'regulacion', 'trabajo social', 'justicia'] },
  { label: 'Sostenibilidad', phrases: ['sostenibilidad', 'clima', 'medio ambiente'] },
];

export function normalize(value = ''): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
function includesPhrase(text: string, phrase: string) { return ` ${normalize(text)} `.includes(` ${phrase} `); }
function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function isTypoOf(token: string, word: string): boolean {
  if (token.length < 5 || word.length < 5) return false;
  const maximumDistance = Math.max(token.length, word.length) >= 9 ? 3 : 2;
  return Math.abs(token.length - word.length) <= maximumDistance && editDistance(token, word) <= maximumDistance;
}

/** Maps wording and common misspellings to the closed forum taxonomy.
 * It is deliberately local and deterministic, so the directory still works
 * when the optional AI interpretation service is unavailable. */
export function inferForumConcepts(query: string): ForumConcept[] {
  const normalized = normalize(query);
  const tokens = normalized.split(' ').filter(Boolean);
  return concepts.filter(concept => concept.phrases.some(phrase => {
    if (includesPhrase(normalized, phrase)) return true;
    return phrase.split(' ').some(word => tokens.some(token => isTypoOf(token, word)));
  }));
}
function queryConcepts(query: string): ForumConcept[] {
  const normalized = normalize(query);
  const matched = inferForumConcepts(normalized);
  if (matched.length) return matched;
  return normalized.split(' ').filter(term => term.length > 2 && !ignoredWords.has(term)).map(term => ({ label: term, phrases: [term] }));
}
function matchedPhrases(text: string, concept: ForumConcept) { return concept.phrases.filter(phrase => includesPhrase(text, phrase)); }
function snippet(text: string, phrases: string[]) {
  const plain = text.replace(/\s+/g, ' ').trim(); const hit = phrases.map(phrase => normalize(plain).indexOf(phrase)).find(index => index >= 0) ?? 0;
  return plain.slice(Math.max(0, hit - 80), hit + 260).trim();
}

export function searchForos(query: string, data: SearchData, limit = 12): SearchResult[] {
  const requested = queryConcepts(query); if (!requested.length) return [];
  const forums = new Map(data.forums.map(forum => [forum.id, forum]));
  const tagById = new Map(data.taxonomy.map(tag => [tag.id, tag]));
  const results: SearchResult[] = [];
  for (const speaker of data.speakers) {
    const candidates = data.appearances.filter(appearance => appearance.speaker_id === speaker.id).map(appearance => {
      const forum = forums.get(appearance.forum_id); if (!forum) return null;
      const tags = (forum.tags ?? []).map(id => tagById.get(id)).filter((tag): tag is TagSource => Boolean(tag));
      const text = [forum.title, forum.description_full, appearance.role_as_published, appearance.bio_as_published, tags.map(tag => tag.label).join(' ')].filter(Boolean).join(' ');
      const matches = requested.map(concept => ({ concept, phrases: matchedPhrases(text, concept) }));
      // A combined brief (for example, IA + gestión pública) must be evidenced for every requested subject.
      if (matches.some(match => match.phrases.length === 0)) return null;
      const specialtyText = (speaker.explicit_specialties ?? []).join(' ');
      return { forum, tags, text, matches, specialtyText, direct: requested.every(concept => matchedPhrases(specialtyText, concept).length > 0) };
    }).filter(Boolean) as Array<{ forum: ForumSource; tags: TagSource[]; text: string; matches: Array<{ concept: ForumConcept; phrases: string[] }>; specialtyText: string; direct: boolean }>;
    const chosen = candidates.sort((a, b) => ((b.direct ? 100 : 0) + b.matches.flatMap(match => match.phrases).length) - ((a.direct ? 100 : 0) + a.matches.flatMap(match => match.phrases).length))[0];
    if (!chosen) continue;
    const matchedConcepts = chosen.matches.map(match => match.concept.label);
    const allPhrases = chosen.matches.flatMap(match => match.phrases);
    const evidenceType = chosen.direct ? 'explicit_specialty' : 'thematic_participation';
    results.push({
      speaker_id: speaker.id, name: speaker.name, score: (chosen.direct ? 100 : 40) + allPhrases.length * 10, evidence_type: evidenceType,
      reason: chosen.direct ? `Especialidad publicada que cubre: ${matchedConcepts.join(' + ')}.` : `Participó en «${chosen.forum.title}», con evidencia para: ${matchedConcepts.join(' + ')}.`,
      excerpt: chosen.direct ? chosen.specialtyText : snippet(chosen.text, allPhrases), matched_concepts: matchedConcepts,
      matched_tags: chosen.tags.map(tag => tag.label).filter(label => requested.some(concept => concept.phrases.some(phrase => includesPhrase(label, phrase)))),
      forum: { id: chosen.forum.id, title: chosen.forum.title, date: chosen.forum.date, url: chosen.forum.url },
      limitations: evidenceType === 'thematic_participation' ? ['La participación temática no acredita por sí sola una especialidad.'] : [],
    });
  }
  return results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'es')).slice(0, limit);
}
