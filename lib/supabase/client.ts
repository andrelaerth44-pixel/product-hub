import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fmqdyaoqttvubynmjbxt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cQwCwWG9t7NncfJXpF6tcg_AsKPktmL';

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
