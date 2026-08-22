import { Router } from 'express';

import { asyncHandler } from '../../middleware/async-handler.js';
import { validateBody } from '../../middleware/validate.js';
import { AuthController } from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), asyncHandler(AuthController.register));
authRouter.post('/login', validateBody(loginSchema), asyncHandler(AuthController.login));
