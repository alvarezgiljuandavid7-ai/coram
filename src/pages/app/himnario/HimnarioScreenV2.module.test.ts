import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('HimnarioScreenV2 mobile rendering', () => {
  it('does not use content-visibility virtualization that flickers on Android browsers', () => {
    const styles = readFileSync(join(process.cwd(), 'src/pages/app/himnario/HimnarioScreenV2.module.css'), 'utf8');

    expect(styles).not.toContain('content-visibility');
    expect(styles).not.toContain('contain-intrinsic-size');
  });
});
