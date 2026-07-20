import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMobileAuth } from '../../src/auth/AuthProvider';
import { CoramBannerAd } from '../../src/ads/CoramBannerAd';

export default function AppHomeRoute() {
  const { session, signOut } = useMobileAuth();
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>CORAM NATIVO</Text>
        <Text style={styles.title}>Tu sesión está protegida</Text>
        <Text style={styles.copy}>{session?.user.email ?? 'Cuenta CorAM activa'}</Text>
        <Text style={styles.note}>La fundación móvil comparte usuarios con Supabase sin reutilizar almacenamiento del navegador.</Text>
        <CoramBannerAd placement="home" />
        <Pressable accessibilityRole="button" onPress={() => router.push('/plans')} style={styles.planButton}>
          <Text style={styles.planButtonText}>Ver mi plan</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.button}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F3E7', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#FFFDF8', borderRadius: 24, padding: 24, gap: 14 },
  eyebrow: { color: '#9A6B13', fontWeight: '800', letterSpacing: 2 },
  title: { color: '#082B4C', fontSize: 34, fontWeight: '700' },
  copy: { color: '#277443', fontWeight: '700', fontSize: 16 },
  note: { color: '#536171', fontSize: 16, lineHeight: 24 },
  button: { minHeight: 50, borderRadius: 14, backgroundColor: '#082B4C', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  planButton: { minHeight: 50, borderRadius: 14, backgroundColor: '#2468E8', alignItems: 'center', justifyContent: 'center' },
  planButtonText: { color: '#fff', fontWeight: '800' },
});
