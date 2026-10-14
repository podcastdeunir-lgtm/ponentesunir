import { NextRequest, NextResponse } from 'next/server';
import { inferForumConcepts } from '@/lib/foros-search';

const allowedConcepts = [
  'Inteligencia artificial', 'Tecnología digital', 'Gestión pública', 'Literatura', 'Cultura',
  'Educación', 'Salud', 'Ciberseguridad', 'Empresa e innovación', 'Deporte',
  'Comunicación', 'Diseño y creatividad', 'Sociedad, derecho y seguridad', 'Sostenibilidad',
] as const;

type Interpretation = { concepts?: unknown; normalized_query?: unknown; clarification?: unknown };

function outputText(body: any): string {
  if (typeof body?.output_text === 'string') return body.output_text;
  return (body?.output ?? []).flatMap((item: any) => item?.content ?? [])
    .map((content: any) => content?.text).filter((text: unknown): text is string => typeof text === 'string').join('');
}

export async function POST(request: NextRequest) {
  const query = (await request.json().catch(() => ({})))?.query;
  if (typeof query !== 'string' || !query.trim()) return NextResponse.json({ error: 'Indica qué foro quieres programar.' }, { status: 400 });
  const clean = query.trim().slice(0, 320);
  const deterministicConcepts = inferForumConcepts(clean).map(concept => concept.label).filter((concept): concept is typeof allowedConcepts[number] => allowedConcepts.includes(concept as typeof allowedConcepts[number]));
  const deterministicQuery = deterministicConcepts.join(' ') || clean;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ query: clean, normalized_query: deterministicQuery, concepts: deterministicConcepts, used_ai: false, note: deterministicConcepts.length ? 'Se han reconocido el tema y posibles erratas antes de consultar el archivo.' : 'La interpretación asistida no está configurada; se ha usado la búsqueda verificada.' });

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        store: false,
        max_output_tokens: 180,
        instructions: `Eres un clasificador para el planificador interno de Foros UNIR. No sugieras personas ni hechos. Corrige de forma silenciosa erratas y variantes coloquiales (por ejemplo, "esctitors" significa escritores y corresponde a Literatura). Extrae únicamente los temas buscados de esta lista cerrada: ${allowedConcepts.join(', ')}. Devuelve una consulta normalizada formada solo por las etiquetas seleccionadas, y una aclaración breve si falta un tema clave.`,
        input: clean,
        text: { format: { type: 'json_schema', name: 'forum_search_interpretation', strict: true, schema: {
          type: 'object', additionalProperties: false,
          properties: {
            concepts: { type: 'array', items: { type: 'string', enum: [...allowedConcepts] }, maxItems: 3 },
            normalized_query: { type: 'string' },
            clarification: { type: 'string' },
          },
          required: ['concepts', 'normalized_query', 'clarification'],
        } } },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`OpenAI returned ${response.status}`);
    const parsed = JSON.parse(outputText(await response.json())) as Interpretation;
    const concepts = Array.isArray(parsed.concepts) ? parsed.concepts.filter((concept): concept is typeof allowedConcepts[number] => typeof concept === 'string' && allowedConcepts.includes(concept as typeof allowedConcepts[number])) : [];
    const resolvedConcepts = concepts.length ? concepts : deterministicConcepts;
    const normalizedQuery = resolvedConcepts.join(' ') || clean;
    return NextResponse.json({ query: clean, normalized_query: normalizedQuery, concepts: resolvedConcepts, clarification: typeof parsed.clarification === 'string' ? parsed.clarification.slice(0, 180) : '', used_ai: true });
  } catch {
    // Search must remain available if the optional interpretation service is unavailable.
    return NextResponse.json({ query: clean, normalized_query: clean, concepts: [], used_ai: false, note: 'No se pudo interpretar la consulta con IA; se ha usado la búsqueda verificada.' });
  }
}
