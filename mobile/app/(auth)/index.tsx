import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useMobileAuth } from '../../src/auth/AuthProvider';
import { signInWithGoogle } from '../../src/auth/googleSignIn';

export default function LoginRoute() {
  const { configurationError, signInWithPassword } = useMobileAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'email' | 'google' | null>(null);

  async function run(kind: 'email' | 'google', action: () => Promise<void>) {
    setError(null);
    setLoading(kind);
    try {
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible iniciar sesión.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>CORAM MÓVIL</Text>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.copy}>Ingresa con la misma cuenta que utilizas en CorAM web.</Text>
        <Pressable
          accessibilityRole="button"
          disabled={Boolean(loading || configurationError)}
          onPress={() => void run('google', signInWithGoogle)}
          style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
        >
          {loading === 'google' ? <ActivityIndicator /> : <Text style={styles.googleText}>Continuar con Google</Text>}
        </Pressable>
        <Text style={styles.divider}>O USA TU CORREO</Text>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="tu@correo.com"
          style={styles.input}
          value={email}
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="current-password"
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {(configurationError || error) && (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {configurationError ?? error}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={Boolean(loading || configurationError || !email || !password)}
          onPress={() => void run('email', () => signInWithPassword(email.trim(), password))}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          {loading === 'email' ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Entrar</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F3E7', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#FFFDF8', borderRadius: 24, padding: 24, gap: 12 },
  eyebrow: { color: '#9A6B13', fontWeight: '800', letterSpacing: 2 },
  title: { color: '#082B4C', fontSize: 38, fontWeight: '700' },
  copy: { color: '#536171', fontSize: 16, lineHeight: 24, marginBottom: 8 },
  divider: { color: '#788394', fontSize: 12, fontWeight: '700', textAlign: 'center', marginVertical: 4 },
  label: { color: '#082B4C', fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderColor: '#D8DEE5', borderRadius: 14, paddingHorizontal: 16, color: '#082B4C', backgroundColor: '#fff' },
  googleButton: { minHeight: 50, borderWidth: 1, borderColor: '#D8DEE5', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  googleText: { color: '#082B4C', fontWeight: '700' },
  primaryButton: { minHeight: 52, borderRadius: 14, backgroundColor: '#2468E8', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  pressed: { opacity: 0.78 },
  error: { color: '#A12C2C', lineHeight: 20 },
});
