import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('CalendarView homepage layout', () => {
  const filePath = resolve(process.cwd(), 'src/renderer/components/CalendarView.vue');
  const source = readFileSync(filePath, 'utf8');

  it('does not create a nested vertical scroll container in calendar content', () => {
    expect(source).not.toMatch(/\.calendar-container\s*\{[\s\S]*overflow:\s*auto;/m);
  });

  it('does not pin homepage height to a hardcoded viewport-minus-header value', () => {
    expect(source).not.toMatch(/\.calendar-view\s*\{[\s\S]*height:\s*calc\(100vh\s*-\s*52px\);/m);
  });
});
