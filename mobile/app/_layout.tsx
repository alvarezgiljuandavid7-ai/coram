import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/auth/AuthProvider';
import { mobileQueryClient } from '../src/query/queryClient';
import { RevenueCatProvider } from '../src/billing/RevenueCatProvider';
import { AdProvider } from '../src/ads/AdProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={mobileQueryClient}>
        <AuthProvider>
          <RevenueCatProvider>
            <AdProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }} />
            </AdProvider>
          </RevenueCatProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
