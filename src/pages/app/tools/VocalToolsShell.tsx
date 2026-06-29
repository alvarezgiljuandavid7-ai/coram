import { PhoneSimulator } from '../../../components/PhoneSimulator';
import { useCoramApp } from '../../../app/CoramAppContext';

interface VocalToolsShellProps {
  initialScreen: 'vocal-tuner' | 'vocal-warmup';
}

export function VocalToolsShell({ initialScreen }: VocalToolsShellProps) {
  const { state, auth, monetizationSettings, mentorships } = useCoramApp();
  const { corarios, courses, resources, sponsors, profile, setProfile } = state;

  return (
    <PhoneSimulator
      corarios={corarios}
      courses={courses}
      resources={resources}
      sponsors={sponsors}
      profile={profile}
      setProfile={setProfile}
      mentorships={mentorships}
      monetizationSettings={monetizationSettings}
      onSignOut={auth.signOut}
      initialScreen={initialScreen}
      immersive
      toolOnly
    />
  );
}
