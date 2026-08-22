import { Request, Response } from 'express';

import { readEnvironment } from '../../config/env.js';
import { AuthService } from './auth.service.js';

export class AuthController {
  static async register(request: Request, response: Response): Promise<void> {
    const result = await AuthService.register(request.body, readEnvironment(process.env).jwtSecret);
    response.status(201).json(result);
  }

  static async login(request: Request, response: Response): Promise<void> {
    const result = await AuthService.login(request.body, readEnvironment(process.env).jwtSecret);
    response.status(200).json(result);
  }
}
