import { Redirect } from 'expo-router';
import { useMobileAuth } from '../src/auth/AuthProvider';

export default function IndexRoute() {
  const { status } = useMobileAuth();
  if (status === 'loading') return null;
  return <Redirect href={status === 'signedIn' ? '/(app)' : '/(auth)'} />;
}
