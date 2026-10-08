import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Este cliente es exclusivamente para rutas del servidor. Nunca debe importarse
// desde un componente de cliente ni exponer su clave al navegador.
export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
