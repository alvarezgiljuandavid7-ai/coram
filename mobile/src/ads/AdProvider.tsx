import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';
import { useRevenueCat } from '../billing/RevenueCatProvider';
import { canRequestCoramAd, type AdPlacement } from './adPolicy';

type AdContextValue = {
  initialized: boolean;
  consent: boolean;
  canShow(placement: AdPlacement): boolean;
};

const AdContext = createContext<AdContextValue | null>(null);

export function AdProvider({ children }: PropsWithChildren) {
  const { plan } = useRevenueCat();
  const [initialized, setInitialized] = useState(false);
  const [consent, setConsent] = useState(false);
  const enabled = process.env.EXPO_PUBLIC_CORAM_ENABLE_ADMOB === 'true';

  useEffect(() => {
    if (!enabled || plan !== 'free') {
      setInitialized(false);
      return;
    }
    let active = true;
    void (async () => {
      const consentInfo = await AdsConsent.gatherConsent();
      if (!active) return;
      setConsent(consentInfo.canRequestAds);
      if (!consentInfo.canRequestAds) return;
      await mobileAds().setRequestConfiguration({ testDeviceIdentifiers: ['EMULATOR'] });
      await mobileAds().initialize();
      if (active) setInitialized(true);
    })().catch(() => {
      if (active) {
        setConsent(false);
        setInitialized(false);
      }
    });
    return () => { active = false; };
  }, [enabled, plan]);

  const value = useMemo<AdContextValue>(() => ({
    initialized,
    consent,
    canShow: (placement) => initialized && canRequestCoramAd({ plan, enabled, consent, placement }),
  }), [consent, enabled, initialized, plan]);
  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useCoramAds() {
  const value = useContext(AdContext);
  if (!value) throw new Error('useCoramAds debe usarse dentro de AdProvider.');
  return value;
}
