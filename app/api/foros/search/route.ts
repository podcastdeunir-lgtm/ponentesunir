import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { searchForos, type SearchData } from '@/lib/foros-search';

type NormalizedArchive = {
  source?: { scope?: string };
  entities?: {
    forums?: SearchData['forums'];
    identities?: SearchData['speakers'];
    appearances?: SearchData['appearances'];
    tags?: SearchData['taxonomy'];
  };
};

/** The checked-in archive is a normalized export, whose searchable entities
 * live under `entities` and call speakers `identities`. The optional external
 * source file keeps the original, flat SearchData shape. */
function toSearchData(raw: SearchData | NormalizedArchive): SearchData {
  const normalized = raw as NormalizedArchive;
  if (normalized.entities) {
    return {
      forums: normalized.entities.forums ?? [],
      speakers: normalized.entities.identities ?? [],
      appearances: normalized.entities.appearances ?? [],
      taxonomy: normalized.entities.tags ?? [],
    };
  }
  return raw as SearchData;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!query) return NextResponse.json({ query, results: [], note: 'Indica una consulta.' });
  try {
    const file = process.env.FOROS_UNIR_DATA_PATH
      ?? join(process.cwd(), 'data', 'foros-unir', 'normalized-archive.json');
    const raw = JSON.parse(await readFile(file, 'utf8')) as SearchData | NormalizedArchive;
    const data = toSearchData(raw);
    return NextResponse.json({
      query,
      results: searchForos(query, data),
      source_scope: (raw as NormalizedArchive).source?.scope,
    });
  } catch {
    return NextResponse.json({ query, results: [], note: 'No se pudo leer el archivo de datos de Foros UNIR.' }, { status: 503 });
  }
}
