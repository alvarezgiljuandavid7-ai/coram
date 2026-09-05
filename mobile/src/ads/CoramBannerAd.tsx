import { Platform, StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getAdUnitId, type AdPlacement } from './adPolicy';
import { useCoramAds } from './AdProvider';

export function CoramBannerAd({ placement }: { placement: AdPlacement }) {
  const { canShow } = useCoramAds();
  const production = process.env.EXPO_PUBLIC_CORAM_ADS_ENV === 'production';
  const configuredId = Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID;
  const selected = getAdUnitId({ production, configuredId });
  if (!canShow(placement) || !selected) return null;
  return (
    <View style={styles.container} accessibilityLabel="Publicidad">
      <Text style={styles.label}>PUBLICIDAD</Text>
      <BannerAd
        unitId={selected === 'TEST_BANNER' ? TestIds.BANNER : selected}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 5, paddingVertical: 8 },
  label: { color: '#75808e', fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
});
