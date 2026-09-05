import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CORAM_PLANS, getPlanLimits } from '@coram/shared-domain';
import { useRevenueCat } from '../../src/billing/RevenueCatProvider';

export default function PlansRoute() {
  const billing = useRevenueCat();
  const limits = getPlanLimits(billing.plan);
  const purchasesDisabled = billing.status === 'disabled' || billing.status === 'purchasing';
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PLAN CORAM</Text>
        <Text style={styles.title}>{CORAM_PLANS[billing.plan].label}</Text>
        <Text style={styles.copy}>
          {limits.activeServices === null ? 'Servicios ilimitados' : `${limits.activeServices} servicios activos`} ·{' '}
          {limits.organizationMembers === null ? 'Miembros ilimitados' : `${limits.organizationMembers} miembros por ministerio`} ·{' '}
          {limits.personalSongs === null ? 'Canciones personales ilimitadas' : `${limits.personalSongs} canciones personales`}
        </Text>
        <Text style={styles.copy}>Las compras móviles usan StoreKit en iOS y Google Play Billing en Android.</Text>
        {billing.status === 'disabled' && <Text style={styles.notice}>Las suscripciones no están habilitadas en este build.</Text>}
        {billing.error && <Text style={styles.error}>{billing.error}</Text>}
        {billing.packages.map((item) => (
          <View key={item.identifier} style={styles.card}>
            <Text style={styles.packageTitle}>{item.product.title}</Text>
            <Text style={styles.price}>{item.product.priceString}</Text>
              <Pressable style={styles.button} onPress={() => void billing.purchase(item)} disabled={purchasesDisabled}>
              <Text style={styles.buttonText}>Elegir plan</Text>
            </Pressable>
          </View>
        ))}
        {(billing.status === 'loading' || billing.status === 'purchasing') && <ActivityIndicator color="#2468E8" />}
        <Pressable style={styles.restore} onPress={() => void billing.restore()} disabled={billing.status === 'disabled'}>
          <Text style={styles.restoreText}>Restaurar compras</Text>
        </Pressable>
        <Text style={styles.legal}>La renovación y cancelación se administran desde tu cuenta de Apple o Google.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F3E7' },
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  eyebrow: { color: '#9A6B13', fontWeight: '800', letterSpacing: 2 },
  title: { color: '#082B4C', fontSize: 38, fontWeight: '700' },
  copy: { color: '#536171', fontSize: 16, lineHeight: 24 },
  notice: { color: '#72510F', backgroundColor: '#FFF4D3', padding: 14, borderRadius: 14 },
  error: { color: '#A12C2C' },
  card: { padding: 20, borderRadius: 20, backgroundColor: '#FFFDF8', gap: 10 },
  packageTitle: { color: '#082B4C', fontSize: 20, fontWeight: '800' },
  price: { color: '#277443', fontSize: 18, fontWeight: '700' },
  button: { minHeight: 48, borderRadius: 14, backgroundColor: '#2468E8', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  restore: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  restoreText: { color: '#082B4C', fontWeight: '800' },
  legal: { color: '#6A7482', fontSize: 13, lineHeight: 19 },
});
