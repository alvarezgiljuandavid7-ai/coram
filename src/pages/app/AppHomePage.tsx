import { PhoneSimulator } from '../../components/PhoneSimulator';
import { useCoramApp } from '../../app/CoramAppContext';

export function AppHomePage() {
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
      immersive
    />
  );
}
