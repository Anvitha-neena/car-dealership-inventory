import { describe, expect, it } from 'vitest';

import { readEnvironment } from './env.js';

describe('readEnvironment', () => {
  it('returns the required application configuration', () => {
    const environment = readEnvironment({
      MONGODB_URI: 'mongodb://127.0.0.1:27017/dealership',
      JWT_SECRET: 'a-long-secret',
      PORT: '4000'
    });

    expect(environment).toEqual({
      mongoUri: 'mongodb://127.0.0.1:27017/dealership',
      jwtSecret: 'a-long-secret',
      port: 4000
    });
  });

  it('rejects missing required configuration', () => {
    expect(() => readEnvironment({ JWT_SECRET: 'a-long-secret' })).toThrow(
      'MONGODB_URI'
    );
  });
});
