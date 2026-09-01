import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mvocwhyuovfqtxsmjidl.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_86EuzEdyiEDBBdz_XZzSWA_z-h1MtXg';

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
