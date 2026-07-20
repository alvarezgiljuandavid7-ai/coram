import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  workspaces?: string[];
  scripts?: Record<string, string>;
};

describe('CorAM native workspace', () => {
  it('registers Expo without replacing web or Capacitor commands', () => {
    expect(packageJson.workspaces).toEqual(['mobile', 'packages/*']);
    expect(packageJson.scripts?.dev).toBe('vite --port=3000 --host=0.0.0.0');
    expect(packageJson.scripts?.build).toBe('vite build');
    expect(packageJson.scripts?.['mobile:sync']).toBe('npm run build && cap sync');
    expect(packageJson.scripts?.['mobile:android']).toBe(
      'npm run mobile:sync && cap open android',
    );
    expect(packageJson.scripts?.['mobile:ios']).toBe(
      'npm run mobile:sync && cap open ios',
    );
    expect(packageJson.scripts?.['expo:start']).toBe(
      'npm run start --workspace=@coram/mobile',
    );
    expect(packageJson.scripts?.['expo:android']).toBe(
      'npm run android --workspace=@coram/mobile',
    );
    expect(packageJson.scripts?.['expo:ios']).toBe(
      'npm run ios --workspace=@coram/mobile',
    );
    expect(packageJson.scripts?.['expo:typecheck']).toBe(
      'npm run typecheck --workspace=@coram/mobile',
    );
    expect(packageJson.scripts?.['expo:config']).toBe(
      'npm run config:check --workspace=@coram/mobile',
    );
    expect(packageJson.scripts?.['expo:export:android']).toBe(
      'npm run export:android --workspace=@coram/mobile',
    );
  });

  it('keeps generated native output out of git', () => {
    const gitignore = readFileSync('.gitignore', 'utf8');
    expect(gitignore).toContain('.tmp/');
    expect(gitignore).toContain('mobile/.expo/');
    expect(gitignore).toContain('mobile/dist/');
  });
});
