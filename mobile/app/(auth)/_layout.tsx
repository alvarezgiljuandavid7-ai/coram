import { Redirect, Stack } from 'expo-router';
import { useMobileAuth } from '../../src/auth/AuthProvider';

export default function GroupLayout() {
  const { status } = useMobileAuth();
  if (status === 'loading') return null;
  if (status === 'signedIn') return <Redirect href="/(app)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
