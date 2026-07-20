import { Redirect, Stack } from 'expo-router';
import { useMobileAuth } from '../../src/auth/AuthProvider';

export default function GroupLayout() {
  const { status } = useMobileAuth();
  if (status === 'loading') return null;
  if (status === 'signedOut') return <Redirect href="/(auth)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
