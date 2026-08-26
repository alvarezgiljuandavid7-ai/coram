import { createClient } from '@supabase/supabase-js';

type SupabaseBrowserEnvironment = Readonly<{
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}>;

export function resolveSupabaseBrowserConfig(environment: SupabaseBrowserEnvironment) {
  const url = environment.VITE_SUPABASE_URL?.trim();
  const publishableKey = environment.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  return url && publishableKey ? { url, publishableKey } : null;
}

const config = resolveSupabaseBrowserConfig(import.meta.env as SupabaseBrowserEnvironment);

export const isSupabaseConfigured = Boolean(config);

export const supabase = isSupabaseConfigured
  ? createClient(config!.url, config!.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
