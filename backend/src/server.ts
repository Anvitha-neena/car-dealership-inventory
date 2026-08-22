import 'dotenv/config';

import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { readEnvironment } from './config/env.js';

async function start(): Promise<void> {
  const environment = readEnvironment(process.env);

  await connectDatabase(environment.mongoUri);

  app.listen(environment.port, () => {
    console.log(`API listening on http://localhost:${environment.port}`);
  });
}

start().catch((error: unknown) => {
  console.error('Unable to start API.', error);
  process.exitCode = 1;
});
