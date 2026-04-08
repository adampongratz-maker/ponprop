import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// Support both env var names — VITE_SUPABASE_ANON_KEY is the standard name
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Single canonical Supabase client — import from here everywhere:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Explicitly enable PKCE flow and URL session detection so Supabase
    // automatically exchanges the ?code= param on the /auth/callback page.
    // AuthCallback must NOT call exchangeCodeForSession() manually — doing
    // so double-exchanges the code, the second call fails, and the user
    // lands back on the login page.
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});