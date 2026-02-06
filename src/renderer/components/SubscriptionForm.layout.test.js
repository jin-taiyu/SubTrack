import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('SubscriptionForm layout', () => {
  const filePath = resolve(process.cwd(), 'src/renderer/components/SubscriptionForm.vue');
  const source = readFileSync(filePath, 'utf8');

  it('does not pin form page height to viewport minus header', () => {
    expect(source).not.toMatch(/\.form-page\s*\{[\s\S]*min-height:\s*calc\(100vh\s*-\s*56px\);/m);
  });

  it('does not define a nested scroll container for the form body', () => {
    expect(source).not.toMatch(/\.form-page\s*\{[\s\S]*overflow:\s*auto;/m);
    expect(source).not.toMatch(/\.form-container\s*\{[\s\S]*overflow:\s*auto;/m);
  });
});
