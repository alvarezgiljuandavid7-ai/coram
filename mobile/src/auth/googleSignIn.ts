import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { requireMobileSupabase } from './mobileSupabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const supabase = requireMobileSupabase();
  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Supabase no devolvió una URL de acceso con Google.');
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return;
  const code = new URL(result.url).searchParams.get('code');
  if (!code) throw new Error('Google no devolvió un código de autorización válido.');
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
}
