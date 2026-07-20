import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/auth/AuthProvider';
import { mobileQueryClient } from '../src/query/queryClient';
import { RevenueCatProvider } from '../src/billing/RevenueCatProvider';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={mobileQueryClient}>
        <AuthProvider>
          <RevenueCatProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </RevenueCatProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
