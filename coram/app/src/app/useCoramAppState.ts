import { useEffect, useMemo, useState } from 'react';
import { fetchCorarios } from '../domain/corarios/corariosRepository';
import { fetchCourses } from '../domain/courses/coursesRepository';
import { fetchResources } from '../domain/resources/resourcesRepository';
import { fetchSponsors } from '../domain/sponsors/sponsorsRepository';
import { createPersistentStateStore } from '../shared/storage/persistentState';
import { createInitialCoramState } from './initialCoramState';
import type { Corario, Course, DashboardMetric, MonetizationToolSetting, Resource, Sponsor, UserProfile } from '../types';

export interface CoramPersistedState {
  corarios: Corario[];
  courses: Course[];
  resources: Resource[];
  sponsors: Sponsor[];
  profile: UserProfile;
  metrics: DashboardMetric;
  monetizationSettings: MonetizationToolSetting[];
}

const USE_DEMO_CONTENT = import.meta.env.DEV || import.meta.env.VITE_CORAM_ENABLE_DEMO === 'true';
const seedState = createInitialCoramState({ useDemoContent: USE_DEMO_CONTENT });
const CORAM_STATE_KEY = USE_DEMO_CONTENT ? 'coram.app.state.demo' : 'coram.app.state.production';
const CORAM_STATE_VERSION = 2;

type StateSetter<T> = T | ((prev: T) => T);

function resolveSetter<T>(next: StateSetter<T>, previous: T): T {
  return typeof next === 'function' ? (next as (prev: T) => T)(previous) : next;
}

export function useCoramAppState() {
  const store = useMemo(
    () => createPersistentStateStore<CoramPersistedState>(CORAM_STATE_KEY, CORAM_STATE_VERSION, seedState),
    [],
  );
  const [state, setState] = useState<CoramPersistedState>(() => store.load());

  useEffect(() => {
    store.save(state);
  }, [state, store]);

  useEffect(() => {
    let isMounted = true;

    fetchCorarios()
      .then((corarios) => {
        if (isMounted) {
          setState((prev) => ({ ...prev, corarios }));
        }
      })
      .catch((error) => {
        console.error('Unable to load Supabase corarios', error);
      });

    fetchCourses()
      .then((courses) => {
        if (isMounted) {
          setState((prev) => ({ ...prev, courses }));
        }
      })
      .catch((error) => {
        console.error('Unable to load Supabase courses', error);
      });

    fetchResources()
      .then((resources) => {
        if (isMounted) {
          setState((prev) => ({ ...prev, resources }));
        }
      })
      .catch((error) => {
        console.error('Unable to load Supabase resources', error);
      });

    fetchSponsors()
      .then((sponsors) => {
        if (isMounted) {
          setState((prev) => ({ ...prev, sponsors }));
        }
      })
      .catch((error) => {
        console.error('Unable to load Supabase sponsors', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...state,
    setCorarios: (corarios: StateSetter<Corario[]>) =>
      setState((prev) => ({ ...prev, corarios: resolveSetter(corarios, prev.corarios) })),
    setCourses: (courses: StateSetter<Course[]>) =>
      setState((prev) => ({ ...prev, courses: resolveSetter(courses, prev.courses) })),
    setSponsors: (sponsors: StateSetter<Sponsor[]>) =>
      setState((prev) => ({ ...prev, sponsors: resolveSetter(sponsors, prev.sponsors) })),
    setProfile: (profile: StateSetter<UserProfile>) =>
      setState((prev) => ({ ...prev, profile: resolveSetter(profile, prev.profile) })),
    setMetrics: (metrics: StateSetter<DashboardMetric>) =>
      setState((prev) => ({ ...prev, metrics: resolveSetter(metrics, prev.metrics) })),
    setMonetizationSettings: (monetizationSettings: StateSetter<MonetizationToolSetting[]>) =>
      setState((prev) => ({
        ...prev,
        monetizationSettings: resolveSetter(monetizationSettings, prev.monetizationSettings),
      })),
    resetCoramState: () => setState(createInitialCoramState({ useDemoContent: USE_DEMO_CONTENT })),
  };
}
