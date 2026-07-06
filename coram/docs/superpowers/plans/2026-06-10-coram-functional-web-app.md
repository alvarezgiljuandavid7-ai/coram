# CorAM Functional Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the imported CorAM prototype into a cleaner React/Vite web app with tested domain logic, local persistence, corrected visible encoding, and a foundation for later Supabase integration.

**Architecture:** Keep React/Vite and introduce domain modules before splitting UI markup. Add pure behavior under `src/domain`, shared storage under `src/shared/storage`, and a small app state hook under `src/app` so the simulator and admin dashboard keep syncing while state persists.

**Tech Stack:** React 19, Vite 6, TypeScript, Tailwind 4, Vitest, localStorage.

---

## File Structure

- Modify: `coram/app/package.json`
  - Rename project, add test scripts, add Vitest dev dependency.
- Create: `coram/app/src/domain/corarios/chords.ts`
  - Pure chord parsing and transposition.
- Create: `coram/app/src/domain/corarios/chords.test.ts`
  - Tests for chord transposition behavior.
- Create: `coram/app/src/domain/profile/profileActions.ts`
  - Pure favorite and course enrollment state updates.
- Create: `coram/app/src/domain/profile/profileActions.test.ts`
  - Tests for profile actions.
- Create: `coram/app/src/domain/monetization/access.ts`
  - Pure premium access and price lookup helpers.
- Create: `coram/app/src/domain/monetization/access.test.ts`
  - Tests for locked/unlocked premium rules.
- Create: `coram/app/src/domain/admin/metrics.ts`
  - Pure admin metric updates.
- Create: `coram/app/src/domain/admin/metrics.test.ts`
  - Tests for premium metric changes.
- Create: `coram/app/src/shared/storage/persistentState.ts`
  - Versioned localStorage adapter.
- Create: `coram/app/src/shared/storage/persistentState.test.ts`
  - Tests for persistence fallback and roundtrip.
- Create: `coram/app/src/app/useCoramAppState.ts`
  - Central hook that initializes state, persists state, and exposes typed setters.
- Modify: `coram/app/src/App.tsx`
  - Use `useCoramAppState`, correct visible mojibake in shell copy, keep current feature tabs.
- Modify: `coram/app/src/components/PhoneSimulator.tsx`
  - Replace local helper implementations with imported domain helpers where safe.
- Modify: `coram/app/src/components/AdminDashboard.tsx`
  - Replace metric mutation helper with imported pure helper.
- Modify: `coram/app/src/types.ts`
  - Correct mojibake in literal union labels.
- Modify: `coram/app/src/data.ts`
  - Correct mojibake in seeded visible labels.
- Modify: `coram/app/README.md`
  - Explain run/test commands, mocked systems, and future Supabase path.

---

### Task 1: Add Test Runner And Project Identity

**Files:**
- Modify: `coram/app/package.json`

- [ ] **Step 1: Update package metadata and scripts**

Replace `package.json` with:

```json
{
  "name": "coram",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rimraf dist server.js",
    "lint": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "rimraf": "^6.0.1",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` and `node_modules` are created or updated. If network access is blocked, rerun with approved network permissions.

- [ ] **Step 3: Verify baseline typecheck**

Run:

```bash
npm run lint
```

Expected: existing prototype may fail because imported code contains type issues. Record the exact failures before changing behavior.

- [ ] **Step 4: Commit**

```bash
git add coram/app/package.json coram/app/package-lock.json
git commit -m "chore: configure CorAM app tooling"
```

---

### Task 2: Extract Chord Transposition With Tests

**Files:**
- Create: `coram/app/src/domain/corarios/chords.test.ts`
- Create: `coram/app/src/domain/corarios/chords.ts`
- Modify: `coram/app/src/components/PhoneSimulator.tsx`

- [ ] **Step 1: Write failing chord tests**

Create `src/domain/corarios/chords.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { transposeChords } from './chords';

describe('transposeChords', () => {
  it('transposes simple major and minor chords inside lyrics', () => {
    const lyrics = '[Coro]\nG\nYo tengo un Dios\nD                     G\nMaravilloso';

    expect(transposeChords(lyrics, 2)).toBe(
      '[Coro]\nA\nYo tengo un Dios\nE                     A\nMaravilloso',
    );
  });

  it('keeps non-chord words unchanged', () => {
    const lyrics = 'Dios grande y maravilloso\nAmén al cantar';

    expect(transposeChords(lyrics, 1)).toBe('Dios grande y maravilloso\nAmén al cantar');
  });

  it('supports accidentals and chord suffixes', () => {
    const lyrics = 'Bbmaj7 F#m7 C#dim Asus4';

    expect(transposeChords(lyrics, 1)).toBe('Bmaj7 Gm7 Ddim A#sus4');
  });

  it('returns the original lyrics when offset is zero', () => {
    const lyrics = 'G D Em C';

    expect(transposeChords(lyrics, 0)).toBe(lyrics);
  });
});
```

- [ ] **Step 2: Run tests and verify red**

Run:

```bash
npm run test -- src/domain/corarios/chords.test.ts
```

Expected: FAIL because `./chords` does not exist.

- [ ] **Step 3: Implement chord transposition**

Create `src/domain/corarios/chords.ts`:

```ts
const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
};

const CHORD_PATTERN = /^([A-G](?:#|b)?)(.*)$/;
const STANDALONE_CHORD_PATTERN = /^[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|[0-9]|\/|#|b|\+|-)*$/;

function transposeRoot(root: string, offset: number): string {
  const normalized = FLAT_TO_SHARP[root] ?? root;
  const index = SHARP_NOTES.indexOf(normalized as (typeof SHARP_NOTES)[number]);

  if (index < 0) {
    return root;
  }

  const nextIndex = (index + offset + SHARP_NOTES.length * 12) % SHARP_NOTES.length;
  return SHARP_NOTES[nextIndex];
}

export function transposeChordToken(token: string, offset: number): string {
  if (!STANDALONE_CHORD_PATTERN.test(token)) {
    return token;
  }

  const match = token.match(CHORD_PATTERN);

  if (!match) {
    return token;
  }

  return `${transposeRoot(match[1], offset)}${match[2]}`;
}

export function transposeChords(lyrics: string, offset: number): string {
  if (offset === 0) {
    return lyrics;
  }

  return lyrics.replace(/\b[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|[0-9]|\/|#|b|\+|-)*\b/g, (token) =>
    transposeChordToken(token, offset),
  );
}
```

- [ ] **Step 4: Run tests and verify green**

Run:

```bash
npm run test -- src/domain/corarios/chords.test.ts
```

Expected: PASS.

- [ ] **Step 5: Replace local helper in simulator**

In `src/components/PhoneSimulator.tsx`, add:

```ts
import { transposeChords } from '../domain/corarios/chords';
```

Remove the local `const transposeChords = (lyrics: string, offset: number): string => { ... }` block.

- [ ] **Step 6: Run validation**

Run:

```bash
npm run test -- src/domain/corarios/chords.test.ts
npm run lint
```

Expected: chord tests pass. Typecheck should not introduce new errors from this task.

- [ ] **Step 7: Commit**

```bash
git add coram/app/src/domain/corarios/chords.ts coram/app/src/domain/corarios/chords.test.ts coram/app/src/components/PhoneSimulator.tsx
git commit -m "feat: extract CorAM chord transposition"
```

---

### Task 3: Extract Profile Actions With Tests

**Files:**
- Create: `coram/app/src/domain/profile/profileActions.test.ts`
- Create: `coram/app/src/domain/profile/profileActions.ts`
- Modify: `coram/app/src/components/PhoneSimulator.tsx`

- [ ] **Step 1: Write failing profile action tests**

Create `src/domain/profile/profileActions.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { UserProfile } from '../../types';
import { toggleCourseEnrollment, toggleFavoriteCorario } from './profileActions';

const baseProfile: UserProfile = {
  name: 'Diana Ortega',
  email: 'diana@example.com',
  authProvider: 'Email',
  avatarUrl: '',
  isPremium: false,
  favoriteCorarios: [],
  enrolledCourses: [],
};

describe('profileActions', () => {
  it('adds a favorite corario when missing', () => {
    const next = toggleFavoriteCorario(baseProfile, 'cor-1');

    expect(next.favoriteCorarios).toEqual(['cor-1']);
    expect(baseProfile.favoriteCorarios).toEqual([]);
  });

  it('removes a favorite corario when present', () => {
    const next = toggleFavoriteCorario({ ...baseProfile, favoriteCorarios: ['cor-1'] }, 'cor-1');

    expect(next.favoriteCorarios).toEqual([]);
  });

  it('enrolls a user in a course when missing', () => {
    const next = toggleCourseEnrollment(baseProfile, 'course-1');

    expect(next.enrolledCourses).toEqual(['course-1']);
  });

  it('does not duplicate an enrolled course', () => {
    const next = toggleCourseEnrollment({ ...baseProfile, enrolledCourses: ['course-1'] }, 'course-1');

    expect(next.enrolledCourses).toEqual(['course-1']);
  });
});
```

- [ ] **Step 2: Run tests and verify red**

Run:

```bash
npm run test -- src/domain/profile/profileActions.test.ts
```

Expected: FAIL because `./profileActions` does not exist.

- [ ] **Step 3: Implement profile actions**

Create `src/domain/profile/profileActions.ts`:

```ts
import type { UserProfile } from '../../types';

export function toggleFavoriteCorario(profile: UserProfile, corarioId: string): UserProfile {
  const favoriteCorarios = profile.favoriteCorarios.includes(corarioId)
    ? profile.favoriteCorarios.filter((id) => id !== corarioId)
    : [...profile.favoriteCorarios, corarioId];

  return { ...profile, favoriteCorarios };
}

export function toggleCourseEnrollment(profile: UserProfile, courseId: string): UserProfile {
  if (profile.enrolledCourses.includes(courseId)) {
    return profile;
  }

  return { ...profile, enrolledCourses: [...profile.enrolledCourses, courseId] };
}

export function setPremiumStatus(profile: UserProfile, isPremium: boolean): UserProfile {
  return { ...profile, isPremium };
}
```

- [ ] **Step 4: Run tests and verify green**

Run:

```bash
npm run test -- src/domain/profile/profileActions.test.ts
```

Expected: PASS.

- [ ] **Step 5: Replace local mutations in simulator**

In `src/components/PhoneSimulator.tsx`, add:

```ts
import { setPremiumStatus, toggleCourseEnrollment, toggleFavoriteCorario } from '../domain/profile/profileActions';
```

Update `toggleFavorite`:

```ts
const toggleFavorite = (corarioId: string) => {
  setProfile((prev) => toggleFavoriteCorario(prev, corarioId));
};
```

Update `toggleEnroll`:

```ts
const toggleEnroll = (courseId: string) => {
  setProfile((prev) => {
    if (prev.enrolledCourses.includes(courseId)) {
      showToast('Ya estás inscrito en este curso.');
      return prev;
    }

    showToast('Curso agregado a tu perfil.');
    return toggleCourseEnrollment(prev, courseId);
  });
};
```

Replace direct premium profile updates with:

```ts
setProfile((prev) => setPremiumStatus(prev, true));
```

or:

```ts
setProfile((prev) => setPremiumStatus(prev, !prev.isPremium));
```

- [ ] **Step 6: Run validation**

Run:

```bash
npm run test -- src/domain/profile/profileActions.test.ts
npm run lint
```

Expected: profile tests pass. Typecheck should not introduce new errors from this task.

- [ ] **Step 7: Commit**

```bash
git add coram/app/src/domain/profile/profileActions.ts coram/app/src/domain/profile/profileActions.test.ts coram/app/src/components/PhoneSimulator.tsx
git commit -m "feat: extract CorAM profile actions"
```

---

### Task 4: Extract Monetization Access Rules With Tests

**Files:**
- Create: `coram/app/src/domain/monetization/access.test.ts`
- Create: `coram/app/src/domain/monetization/access.ts`
- Modify: `coram/app/src/components/PhoneSimulator.tsx`

- [ ] **Step 1: Write failing access tests**

Create `src/domain/monetization/access.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { MonetizationToolSetting, UserProfile } from '../../types';
import { getSectionPrice, isSectionLocked } from './access';

const settings: MonetizationToolSetting[] = [
  { id: 'corarios', name: 'Corarios', isPremium: false, price: 'Gratuito' },
  { id: 'courses', name: 'Cursos', isPremium: true, price: '$19.99' },
];

const freeProfile: UserProfile = {
  name: 'Diana',
  email: 'diana@example.com',
  authProvider: 'Email',
  avatarUrl: '',
  isPremium: false,
  favoriteCorarios: [],
  enrolledCourses: [],
};

describe('access', () => {
  it('does not lock free sections for free users', () => {
    expect(isSectionLocked('corarios', settings, freeProfile)).toBe(false);
  });

  it('locks premium sections for free users', () => {
    expect(isSectionLocked('courses', settings, freeProfile)).toBe(true);
  });

  it('unlocks premium sections for premium users', () => {
    expect(isSectionLocked('courses', settings, { ...freeProfile, isPremium: true })).toBe(false);
  });

  it('returns configured section price', () => {
    expect(getSectionPrice('courses', settings)).toBe('$19.99');
  });

  it('uses fallback price for unknown sections', () => {
    expect(getSectionPrice('missing', settings)).toBe('$0.00');
  });
});
```

- [ ] **Step 2: Run tests and verify red**

Run:

```bash
npm run test -- src/domain/monetization/access.test.ts
```

Expected: FAIL because `./access` does not exist.

- [ ] **Step 3: Implement access helpers**

Create `src/domain/monetization/access.ts`:

```ts
import type { MonetizationToolSetting, UserProfile } from '../../types';

export function findSectionSetting(
  sectionId: string,
  settings: MonetizationToolSetting[],
): MonetizationToolSetting | undefined {
  return settings.find((setting) => setting.id === sectionId);
}

export function isSectionLocked(
  sectionId: string,
  settings: MonetizationToolSetting[],
  profile: UserProfile,
): boolean {
  const setting = findSectionSetting(sectionId, settings);
  return Boolean(setting?.isPremium && !profile.isPremium);
}

export function getSectionPrice(sectionId: string, settings: MonetizationToolSetting[]): string {
  return findSectionSetting(sectionId, settings)?.price ?? '$0.00';
}
```

- [ ] **Step 4: Run tests and verify green**

Run:

```bash
npm run test -- src/domain/monetization/access.test.ts
```

Expected: PASS.

- [ ] **Step 5: Replace local helpers in simulator**

In `src/components/PhoneSimulator.tsx`, add:

```ts
import { getSectionPrice, isSectionLocked } from '../domain/monetization/access';
```

Remove local `isSectionLocked` and `getSectionPrice` functions.

Replace calls:

```ts
isSectionLocked(sectionId)
getSectionPrice(sectionId)
```

with:

```ts
isSectionLocked(sectionId, monetizationSettings, profile)
getSectionPrice(sectionId, monetizationSettings)
```

- [ ] **Step 6: Run validation**

Run:

```bash
npm run test -- src/domain/monetization/access.test.ts
npm run lint
```

Expected: access tests pass. Typecheck should not introduce new errors from this task.

- [ ] **Step 7: Commit**

```bash
git add coram/app/src/domain/monetization/access.ts coram/app/src/domain/monetization/access.test.ts coram/app/src/components/PhoneSimulator.tsx
git commit -m "feat: extract CorAM monetization access rules"
```

---

### Task 5: Extract Admin Metrics With Tests

**Files:**
- Create: `coram/app/src/domain/admin/metrics.test.ts`
- Create: `coram/app/src/domain/admin/metrics.ts`
- Modify: `coram/app/src/components/AdminDashboard.tsx`

- [ ] **Step 1: Write failing metrics tests**

Create `src/domain/admin/metrics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { DashboardMetric } from '../../types';
import { applyPremiumSubscriberDelta } from './metrics';

const metrics: DashboardMetric = {
  usersCount: 10,
  activeToday: 5,
  premiumSubscribers: 2,
  conversionRate: 20,
  revenueThisMonth: 40,
};

describe('metrics', () => {
  it('increments premium subscriber count and revenue', () => {
    expect(applyPremiumSubscriberDelta(metrics, 1)).toEqual({
      usersCount: 10,
      activeToday: 5,
      premiumSubscribers: 3,
      conversionRate: 30,
      revenueThisMonth: 60,
    });
  });

  it('does not allow premium subscribers below zero', () => {
    expect(applyPremiumSubscriberDelta({ ...metrics, premiumSubscribers: 0, revenueThisMonth: 0 }, -1)).toEqual({
      usersCount: 10,
      activeToday: 5,
      premiumSubscribers: 0,
      conversionRate: 0,
      revenueThisMonth: 0,
    });
  });
});
```

- [ ] **Step 2: Run tests and verify red**

Run:

```bash
npm run test -- src/domain/admin/metrics.test.ts
```

Expected: FAIL because `./metrics` does not exist.

- [ ] **Step 3: Implement metrics helper**

Create `src/domain/admin/metrics.ts`:

```ts
import type { DashboardMetric } from '../../types';

const MONTHLY_PREMIUM_VALUE = 20;

export function applyPremiumSubscriberDelta(metrics: DashboardMetric, delta: 1 | -1): DashboardMetric {
  const premiumSubscribers = Math.max(0, metrics.premiumSubscribers + delta);
  const conversionRate = metrics.usersCount > 0 ? Math.round((premiumSubscribers / metrics.usersCount) * 100) : 0;

  return {
    ...metrics,
    premiumSubscribers,
    conversionRate,
    revenueThisMonth: premiumSubscribers * MONTHLY_PREMIUM_VALUE,
  };
}
```

- [ ] **Step 4: Run tests and verify green**

Run:

```bash
npm run test -- src/domain/admin/metrics.test.ts
```

Expected: PASS.

- [ ] **Step 5: Replace dashboard metric mutation**

In `src/components/AdminDashboard.tsx`, add:

```ts
import { applyPremiumSubscriberDelta } from '../domain/admin/metrics';
```

Inside `handleToggleUserPremium`, replace the metrics setter body with:

```ts
setMetrics((prev) => applyPremiumSubscriberDelta(prev, nextType === 'Premium' ? 1 : -1));
```

- [ ] **Step 6: Run validation**

Run:

```bash
npm run test -- src/domain/admin/metrics.test.ts
npm run lint
```

Expected: metrics tests pass. Typecheck should not introduce new errors from this task.

- [ ] **Step 7: Commit**

```bash
git add coram/app/src/domain/admin/metrics.ts coram/app/src/domain/admin/metrics.test.ts coram/app/src/components/AdminDashboard.tsx
git commit -m "feat: extract CorAM admin metrics"
```

---

### Task 6: Add Versioned Local Persistence With Tests

**Files:**
- Create: `coram/app/src/shared/storage/persistentState.test.ts`
- Create: `coram/app/src/shared/storage/persistentState.ts`

- [ ] **Step 1: Write failing persistence tests**

Create `src/shared/storage/persistentState.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { createPersistentStateStore } from './persistentState';

interface DemoState {
  name: string;
  count: number;
}

const seed: DemoState = { name: 'CorAM', count: 1 };

describe('persistentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns seed data when storage is empty', () => {
    const store = createPersistentStateStore<DemoState>('demo', 1, seed);

    expect(store.load()).toEqual(seed);
  });

  it('roundtrips state through localStorage', () => {
    const store = createPersistentStateStore<DemoState>('demo', 1, seed);

    store.save({ name: 'CorAM Premium', count: 2 });

    expect(store.load()).toEqual({ name: 'CorAM Premium', count: 2 });
  });

  it('falls back to seed data when versions do not match', () => {
    localStorage.setItem('demo', JSON.stringify({ version: 0, data: { name: 'Old', count: 99 } }));
    const store = createPersistentStateStore<DemoState>('demo', 1, seed);

    expect(store.load()).toEqual(seed);
  });

  it('falls back to seed data when JSON is invalid', () => {
    localStorage.setItem('demo', '{broken');
    const store = createPersistentStateStore<DemoState>('demo', 1, seed);

    expect(store.load()).toEqual(seed);
  });
});
```

- [ ] **Step 2: Run tests and verify red**

Run:

```bash
npm run test -- src/shared/storage/persistentState.test.ts
```

Expected: FAIL because `./persistentState` does not exist.

- [ ] **Step 3: Implement persistence adapter**

Create `src/shared/storage/persistentState.ts`:

```ts
interface StoredState<T> {
  version: number;
  data: T;
}

export interface PersistentStateStore<T> {
  load: () => T;
  save: (nextState: T) => void;
  clear: () => void;
}

export function createPersistentStateStore<T>(
  key: string,
  version: number,
  seedState: T,
): PersistentStateStore<T> {
  return {
    load() {
      try {
        const raw = localStorage.getItem(key);

        if (!raw) {
          return seedState;
        }

        const parsed = JSON.parse(raw) as Partial<StoredState<T>>;

        if (parsed.version !== version || parsed.data === undefined) {
          return seedState;
        }

        return parsed.data;
      } catch {
        return seedState;
      }
    },
    save(nextState) {
      const payload: StoredState<T> = { version, data: nextState };
      localStorage.setItem(key, JSON.stringify(payload));
    },
    clear() {
      localStorage.removeItem(key);
    },
  };
}
```

- [ ] **Step 4: Run tests and verify green**

Run:

```bash
npm run test -- src/shared/storage/persistentState.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add coram/app/src/shared/storage/persistentState.ts coram/app/src/shared/storage/persistentState.test.ts
git commit -m "feat: add CorAM local persistence adapter"
```

---

### Task 7: Centralize CorAM App State

**Files:**
- Create: `coram/app/src/app/useCoramAppState.ts`
- Modify: `coram/app/src/App.tsx`

- [ ] **Step 1: Create app state hook**

Create `src/app/useCoramAppState.ts`:

```ts
import { useEffect, useMemo, useState } from 'react';
import type { Corario, Course, DashboardMetric, MonetizationToolSetting, Resource, Sponsor, UserProfile } from '../types';
import {
  initialCorarios,
  initialCourses,
  initialResources,
  initialUserProfile,
  mockDashboardMetrics,
  sponsorsList,
} from '../data';
import { createPersistentStateStore } from '../shared/storage/persistentState';

export interface CoramPersistedState {
  corarios: Corario[];
  courses: Course[];
  resources: Resource[];
  sponsors: Sponsor[];
  profile: UserProfile;
  metrics: DashboardMetric;
  monetizationSettings: MonetizationToolSetting[];
}

const defaultMonetizationSettings: MonetizationToolSetting[] = [
  { id: 'corarios', name: 'Corarios y Cadenas', isPremium: false, price: 'Gratuito' },
  { id: 'himnarios', name: 'Himnarios Celestiales', isPremium: false, price: 'Gratuito' },
  { id: 'courses', name: 'Cursos y Academia', isPremium: true, price: '$19.99' },
  { id: 'resources', name: 'Recursos / PDF Descargables', isPremium: true, price: '$9.99' },
  { id: 'mentorships', name: 'Mentorías 1-a-1', isPremium: true, price: '$49.99' },
  { id: 'warmups', name: 'Calentamiento Vocal Diario', isPremium: false, price: 'Gratuito' },
  { id: 'tuner_piano', name: 'Afinador y Teclado Piano', isPremium: false, price: 'Gratuito' },
];

const seedState: CoramPersistedState = {
  corarios: initialCorarios,
  courses: initialCourses,
  resources: initialResources,
  sponsors: sponsorsList,
  profile: initialUserProfile,
  metrics: mockDashboardMetrics,
  monetizationSettings: defaultMonetizationSettings,
};

const CORAM_STATE_KEY = 'coram.app.state';
const CORAM_STATE_VERSION = 1;

export function useCoramAppState() {
  const store = useMemo(
    () => createPersistentStateStore<CoramPersistedState>(CORAM_STATE_KEY, CORAM_STATE_VERSION, seedState),
    [],
  );
  const [state, setState] = useState<CoramPersistedState>(() => store.load());

  useEffect(() => {
    store.save(state);
  }, [state, store]);

  return {
    ...state,
    setCorarios: (corarios: CoramPersistedState['corarios'] | ((prev: CoramPersistedState['corarios']) => CoramPersistedState['corarios'])) =>
      setState((prev) => ({ ...prev, corarios: typeof corarios === 'function' ? corarios(prev.corarios) : corarios })),
    setCourses: (courses: CoramPersistedState['courses'] | ((prev: CoramPersistedState['courses']) => CoramPersistedState['courses'])) =>
      setState((prev) => ({ ...prev, courses: typeof courses === 'function' ? courses(prev.courses) : courses })),
    setSponsors: (sponsors: CoramPersistedState['sponsors'] | ((prev: CoramPersistedState['sponsors']) => CoramPersistedState['sponsors'])) =>
      setState((prev) => ({ ...prev, sponsors: typeof sponsors === 'function' ? sponsors(prev.sponsors) : sponsors })),
    setProfile: (profile: CoramPersistedState['profile'] | ((prev: CoramPersistedState['profile']) => CoramPersistedState['profile'])) =>
      setState((prev) => ({ ...prev, profile: typeof profile === 'function' ? profile(prev.profile) : profile })),
    setMetrics: (metrics: CoramPersistedState['metrics'] | ((prev: CoramPersistedState['metrics']) => CoramPersistedState['metrics'])) =>
      setState((prev) => ({ ...prev, metrics: typeof metrics === 'function' ? metrics(prev.metrics) : metrics })),
    setMonetizationSettings: (
      monetizationSettings:
        | CoramPersistedState['monetizationSettings']
        | ((prev: CoramPersistedState['monetizationSettings']) => CoramPersistedState['monetizationSettings']),
    ) =>
      setState((prev) => ({
        ...prev,
        monetizationSettings:
          typeof monetizationSettings === 'function'
            ? monetizationSettings(prev.monetizationSettings)
            : monetizationSettings,
      })),
    resetCoramState: () => setState(seedState),
  };
}
```

- [ ] **Step 2: Replace App state setup**

In `src/App.tsx`, remove imports of `useState`, seed data, and domain types used only for local state.

Add:

```ts
import { useState } from 'react';
import { useCoramAppState } from './app/useCoramAppState';
```

Inside `App`, replace the current global state declarations with:

```ts
const {
  corarios,
  setCorarios,
  courses,
  setCourses,
  resources,
  sponsors,
  setSponsors,
  profile,
  setProfile,
  metrics,
  setMetrics,
  monetizationSettings,
  setMonetizationSettings,
} = useCoramAppState();
```

Keep `activeWorkspaceTab` as local UI state.

- [ ] **Step 3: Run persistence and app validation**

Run:

```bash
npm run test -- src/shared/storage/persistentState.test.ts
npm run lint
```

Expected: persistence tests pass. Typecheck should not introduce new errors from this task.

- [ ] **Step 4: Commit**

```bash
git add coram/app/src/app/useCoramAppState.ts coram/app/src/App.tsx
git commit -m "feat: persist CorAM app state locally"
```

---

### Task 8: Correct Visible Encoding And Domain Labels

**Files:**
- Modify: `coram/app/src/types.ts`
- Modify: `coram/app/src/data.ts`
- Modify: `coram/app/src/App.tsx`
- Modify: `coram/app/src/components/PhoneSimulator.tsx`
- Modify: `coram/app/src/components/AdminDashboard.tsx`

- [ ] **Step 1: Find mojibake strings**

Run:

```bash
rg "Ã|Â|â|ð" src
```

Expected: output lists imported encoding issues.

- [ ] **Step 2: Correct type labels**

In `src/types.ts`, replace:

```ts
category: 'AdoraciÃ³n' | 'Avivamiento' | 'EvangelÃ­sticos' | 'Pentecostales' | 'Coros antiguos' | 'Coros nuevos';
category: 'PDF Acordes' | 'GuÃ­as PrÃ¡cticas' | 'Pistas / Audio' | 'Partituras';
```

with:

```ts
category: 'Adoración' | 'Avivamiento' | 'Evangelísticos' | 'Pentecostales' | 'Coros antiguos' | 'Coros nuevos';
category: 'PDF Acordes' | 'Guías Prácticas' | 'Pistas / Audio' | 'Partituras';
```

- [ ] **Step 3: Correct seeded data and visible UI strings**

Replace visible mojibake strings with proper Spanish accents. Examples:

```text
MÃ³vil -> Móvil
CÃ³digo -> Código
MentorÃ­as -> Mentorías
SincronizaciÃ³n -> Sincronización
TransposiciÃ³n -> Transposición
DiseÃ±o -> Diseño
```

When a type union value changes, update all matching data values to the corrected literal.

- [ ] **Step 4: Run validation**

Run:

```bash
rg "Ã|Â|â|ð" src
npm run lint
```

Expected: no mojibake remains in `src` except intentionally documented source text, and typecheck passes or shows only pre-existing unrelated failures.

- [ ] **Step 5: Commit**

```bash
git add coram/app/src/types.ts coram/app/src/data.ts coram/app/src/App.tsx coram/app/src/components/PhoneSimulator.tsx coram/app/src/components/AdminDashboard.tsx
git commit -m "fix: correct CorAM imported Spanish text"
```

---

### Task 9: Update CorAM README

**Files:**
- Modify: `coram/app/README.md`
- Modify: `coram/README.md`

- [ ] **Step 1: Replace app README**

Replace `coram/app/README.md` with:

```md
# CorAM Web App

CorAM is a web application for ministry singers, musicians, and administrators. This phase runs as a React/Vite app with local persistence while the backend is still mocked.

## Run

```bash
npm install
npm run dev
```

Vite listens on port `3000`.

## Validate

```bash
npm run test
npm run lint
npm run build
```

## Current Capabilities

- Mobile app simulator.
- Admin dashboard.
- Corarios with search, favorites, and chord transposition.
- Courses and enrollments.
- Premium access simulation.
- Resources, mentorships, sponsors, ads, vocal tools, and Flutter export.
- Local persistence through `localStorage`.

## Mocked For Now

- Authentication.
- Payments.
- Supabase/database persistence.
- File storage.
- Legal policy pages.

These systems are intentionally left behind narrow integration boundaries so they can be implemented in later phases.
```

- [ ] **Step 2: Update root CorAM README**

Append to `coram/README.md`:

```md
## Development Direction

The approved first phase is a functional React/Vite web app. Astro is reserved for a future public marketing/content site, and Flutter native work should follow after the web product flows are stable.
```

- [ ] **Step 3: Run validation**

Run:

```bash
npm run test
npm run lint
```

Expected: tests pass. Typecheck should not introduce new errors from docs changes.

- [ ] **Step 4: Commit**

```bash
git add coram/app/README.md coram/README.md
git commit -m "docs: document CorAM web app direction"
```

---

### Task 10: Final Validation And Handoff

**Files:**
- Modify only if prior validation reveals a small issue directly caused by these tasks.

- [ ] **Step 1: Run all tests**

Run:

```bash
npm run test
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS and `dist/` generated.

- [ ] **Step 4: Start local app**

Run:

```bash
npm run dev
```

Expected: Vite starts on `http://localhost:3000/`.

- [ ] **Step 5: Manual smoke check**

In the browser:

- Open simulator.
- Complete splash, onboarding, and login.
- Favorite a corario.
- Enroll in a course.
- Toggle premium.
- Refresh the page.
- Confirm favorite, enrollment, and premium status persist.
- Open admin dashboard.
- Add a corario.
- Return to simulator and confirm the new corario appears.

- [ ] **Step 6: Commit final fixes**

```bash
git add coram/app
git commit -m "chore: validate CorAM functional web foundation"
```

---

## Self-Review

Spec coverage:

- React/Vite decision: Task 1.
- Domain extraction: Tasks 2 through 5.
- Local persistence: Tasks 6 and 7.
- Mojibake correction: Task 8.
- README and mocked backend boundaries: Task 9.
- Validation: Task 10.

Known execution note:

- Git commits require local `user.name` and `user.email`. If Git identity is still missing, complete implementation and validation, then commit after identity is configured by the repository owner.

