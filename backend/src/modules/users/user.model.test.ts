import { describe, expect, it } from 'vitest';

import { User } from './user.model.js';

describe('User model', () => {
  it('normalizes email and assigns the customer role by default', async () => {
    const user = new User({
      name: 'Ava Driver',
      email: '  AVA@EXAMPLE.COM ',
      passwordHash: 'a-secure-password-hash'
    });

    await user.validate();

    expect(user.email).toBe('ava@example.com');
    expect(user.role).toBe('customer');
  });

  it('rejects a user without a password hash', async () => {
    const user = new User({
      name: 'Ava Driver',
      email: 'ava@example.com'
    });

    await expect(user.validate()).rejects.toThrow('passwordHash');
  });
});
