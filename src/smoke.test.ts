import { describe, it, expect } from 'vitest';

// Minimal smoke test to validate test runner

describe('environment', () => {
  it('works', () => {
    expect(1 + 1).toBe(2);
  });
});
