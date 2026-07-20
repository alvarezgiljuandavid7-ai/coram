import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import type { PlanId } from '@coram/shared-domain';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { useMobileAuth } from '../auth/AuthProvider';
import { activePlanFromCustomerInfo, getRevenueCatConfiguration } from './billingState';

type BillingStatus = 'disabled' | 'loading' | 'ready' | 'purchasing' | 'error';
type RevenueCatContextValue = {
  status: BillingStatus;
  plan: PlanId;
  packages: readonly PurchasesPackage[];
  error: string | null;
  purchase(item: PurchasesPackage): Promise<void>;
  restore(): Promise<void>;
};

const RevenueCatContext = createContext<RevenueCatContextValue | null>(null);

export function RevenueCatProvider({ children }: PropsWithChildren) {
  const { status: authStatus, session } = useMobileAuth();
  const [status, setStatus] = useState<BillingStatus>('disabled');
  const [plan, setPlan] = useState<PlanId>('free');
  const [packages, setPackages] = useState<readonly PurchasesPackage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const configured = useRef(false);
  const identifiedUser = useRef<string | null>(null);
  const configuration = getRevenueCatConfiguration({
    enabled: process.env.EXPO_PUBLIC_CORAM_ENABLE_REVENUECAT === 'true',
    platform: Platform.OS,
    iosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    androidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  });

  function applyCustomerInfo(customerInfo: CustomerInfo) {
    setPlan(activePlanFromCustomerInfo(customerInfo.entitlements));
  }

  useEffect(() => {
    const userId = session?.user.id;
    if (!configuration || authStatus !== 'signedIn' || !userId) {
      setStatus('disabled');
      setPackages([]);
      setPlan('free');
      if (configured.current && identifiedUser.current) {
        identifiedUser.current = null;
        void Purchases.logOut().catch(() => undefined);
      }
      return;
    }
    let active = true;
    setStatus('loading');
    setError(null);
    void (async () => {
      if (!configured.current) {
        Purchases.configure({ apiKey: configuration.apiKey, appUserID: userId });
        configured.current = true;
      } else if (identifiedUser.current !== userId) {
        await Purchases.logIn(userId);
      }
      identifiedUser.current = userId;
      const [offerings, customerInfo] = await Promise.all([
        Purchases.getOfferings(),
        Purchases.getCustomerInfo(),
      ]);
      if (!active) return;
      const offering = offerings.current?.identifier === 'default'
        ? offerings.current
        : offerings.all.default ?? offerings.current;
      setPackages(offering?.availablePackages ?? []);
      applyCustomerInfo(customerInfo);
      setStatus('ready');
    })().catch((reason) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : 'No fue posible cargar los planes.');
      setStatus('error');
    });
    const listener = (customerInfo: CustomerInfo) => applyCustomerInfo(customerInfo);
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      active = false;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [authStatus, configuration?.apiKey, session?.user.id]);

  const value = useMemo<RevenueCatContextValue>(() => ({
    status,
    plan,
    packages,
    error,
    async purchase(item) {
      setStatus('purchasing');
      setError(null);
      try {
        const result = await Purchases.purchasePackage(item);
        applyCustomerInfo(result.customerInfo);
        setStatus('ready');
      } catch (reason) {
        const purchaseError = reason as { userCancelled?: boolean; message?: string };
        if (!purchaseError.userCancelled) setError(purchaseError.message ?? 'La compra no pudo completarse.');
        setStatus('ready');
      }
    },
    async restore() {
      setStatus('loading');
      setError(null);
      try {
        applyCustomerInfo(await Purchases.restorePurchases());
        setStatus('ready');
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'No fue posible restaurar las compras.');
        setStatus('error');
      }
    },
  }), [error, packages, plan, status]);

  return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>;
}

export function useRevenueCat() {
  const value = useContext(RevenueCatContext);
  if (!value) throw new Error('useRevenueCat debe usarse dentro de RevenueCatProvider.');
  return value;
}
