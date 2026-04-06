import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let supabase: any;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn("Supabase env vars missing, using mock client");
    supabase = {
      from: () => ({
        select: () => ({ order: () => ({ data: [], error: null }) }),
        insert: () => ({ data: null, error: null }),
      }),
    };
  }
} catch (e) {
  console.error("Failed to create Supabase client", e);
  supabase = {
    from: () => ({
      select: () => ({ order: () => ({ data: [], error: null }) }),
      insert: () => ({ data: null, error: null }),
    }),
  };
}

export { supabase };