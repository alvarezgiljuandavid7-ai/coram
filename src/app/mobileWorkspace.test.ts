import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  workspaces?: string[];
  scripts?: Record<string, string>;
};

describe('CorAM native workspace', () => {
  it('registers the Expo app and shared packages without replacing web commands', () => {
    expect(packageJson.workspaces).toEqual(['mobile', 'packages/*']);
    expect(packageJson.scripts?.dev).toBe('vite --port=3000 --host=0.0.0.0');
    expect(packageJson.scripts?.build).toBe('vite build');
    expect(packageJson.scripts?.['mobile:start']).toBe(
      'npm run start --workspace=@coram/mobile',
    );
    expect(packageJson.scripts?.['mobile:typecheck']).toBe(
      'npm run typecheck --workspace=@coram/mobile',
    );
    expect(packageJson.scripts?.['mobile:config']).toBe(
      'npm run config:check --workspace=@coram/mobile',
    );
    expect(packageJson.scripts?.['mobile:export:android']).toBe(
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
