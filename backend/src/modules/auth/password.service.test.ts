import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from './password.service.js';

describe('password service', () => {
  it('hashes a password and verifies the original value', async () => {
    const password = 'correct-horse-battery-staple';

    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
  });

  it('does not verify a different password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');

    await expect(verifyPassword('incorrect-password', hash)).resolves.toBe(false);
  });
});
