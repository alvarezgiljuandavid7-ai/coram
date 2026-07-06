import { createClient } from '@supabase/supabase-js';

const fallbackSupabaseUrl = 'https://qbjcqnhgijsotmdzccmi.supabase.co';
const fallbackSupabasePublishableKey = 'sb_publishable_WDddK-0ooIp5Zrv-gXuOOA_6tQy3-I4';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || fallbackSupabaseUrl;
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || fallbackSupabasePublishableKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
