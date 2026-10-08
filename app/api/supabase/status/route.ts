import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Comprobación técnica: no devuelve ningún dato interno del directorio.
export async function GET() {
  const supabaseServer = getSupabaseServer();

  if (!supabaseServer) {
    return NextResponse.json({ connected: false, configured: false }, { status: 503 });
  }

  const { error } = await supabaseServer.from('personas').select('id', { head: true, count: 'exact' });

  if (error) {
    return NextResponse.json({ connected: false }, { status: 503 });
  }

  return NextResponse.json({ connected: true });
}
