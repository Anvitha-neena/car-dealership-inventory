import 'dotenv/config';

import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { readEnvironment } from '../config/env.js';
import { hashPassword } from '../modules/auth/password.service.js';
import { User } from '../modules/users/user.model.js';

function requiredScriptValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be set to seed an administrator.`);
  return value;
}

async function seedAdmin(): Promise<void> {
  const environment = readEnvironment(process.env);
  const name = requiredScriptValue('ADMIN_NAME');
  const email = requiredScriptValue('ADMIN_EMAIL').toLowerCase();
  const password = requiredScriptValue('ADMIN_PASSWORD');

  await connectDatabase(environment.mongoUri);
  await User.findOneAndUpdate(
    { email },
    { name, email, passwordHash: await hashPassword(password), role: 'admin' },
    { upsert: true, new: true, runValidators: true }
  );

  console.log(`Administrator ${email} is ready.`);
  await disconnectDatabase();
}

seedAdmin().catch(async (error: unknown) => {
  console.error('Unable to seed administrator.', error);
  await disconnectDatabase();
  process.exitCode = 1;
});
