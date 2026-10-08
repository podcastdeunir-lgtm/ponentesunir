import { NextResponse } from 'next/server';

type SerperResult = { title?: string; link?: string; snippet?: string };

function candidateName(title = '') {
  return title.split(/\s[|–—-]\s/)[0]?.trim() || title;
}

function looksLikePerson(title = '') {
  const name = candidateName(title).replace(/^dr\.?\s+/i, '').trim();
  return /^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+(?:\s+(?:de|del|la|y|[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+)){1,5}$/.test(name);
}

export async function POST(request: Request) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Búsqueda externa no configurada.' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const query = typeof body.query === 'string' ? body.query.trim().slice(0, 240) : '';
  const tags = Array.isArray(body.tags) ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string').slice(0, 6) : [];
  const country = typeof body.country === 'string' && ['España', 'Colombia', 'México', 'Perú', 'Ecuador', 'Sedes UNIR'].includes(body.country) ? body.country : 'España';
  if (!query) return NextResponse.json({ error: 'Indica qué perfil estás buscando.' }, { status: 400 });

  const locationQuery = country === 'Sedes UNIR' ? '(España OR Colombia OR México OR Ecuador OR Perú OR Argentina)' : `"${country}"`;
  const searchQuery = `site:linkedin.com/in ${query} ${tags.join(' ')} ${locationQuery} (ponente OR experto OR investigador OR investigadora OR profesor OR profesora)`;
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
    body: JSON.stringify({ q: searchQuery, gl: 'es', hl: 'es', num: 10 }),
    cache: 'no-store',
  });
  if (!response.ok) return NextResponse.json({ error: 'No se pudo consultar el radar externo.' }, { status: 502 });

  const data = await response.json() as { organic?: SerperResult[] };
  const candidates = (data.organic || [])
    .filter(result => result.title && result.link && result.snippet)
    .filter(result => /linkedin\.com\/in\//i.test(result.link || ''))
    .filter(result => looksLikePerson(result.title) || /\b(ponente|experto|investigador|investigadora|profesor|profesora|doctor|doctora)\b/i.test(`${result.title} ${result.snippet}`))
    .slice(0, 8)
    .map(result => ({
      name: candidateName(result.title),
      title: result.title,
      source: new URL(result.link!).hostname.replace(/^www\./, ''),
      url: result.link,
      evidence: result.snippet,
      tags,
    }));

  return NextResponse.json({ candidates });
}
