import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('load test safety', () => {
  it('never schedules more than 250 virtual users', () => {
    const script = readFileSync(resolve(process.cwd(), 'load-tests/k6/read-libraries.js'), 'utf8');
    const targets = [...script.matchAll(/target:\s*(\d+)/g)].map((match) => Number(match[1]));

    expect(Math.max(...targets)).toBeLessThanOrEqual(250);
    expect(script).toContain('ALLOW_NON_PROD_LOAD_TEST');
    expect(script).toContain('Refusing a production-looking URL');
  });
});
