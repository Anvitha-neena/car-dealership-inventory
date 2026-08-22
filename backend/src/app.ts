import cors from 'cors';
import express from 'express';

import { errorHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { vehicleRouter } from './modules/vehicles/vehicle.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehicleRouter);

app.use(errorHandler);
