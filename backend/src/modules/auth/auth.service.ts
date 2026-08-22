import { AppError } from '../../errors/app-error.js';
import { User, UserRole } from '../users/user.model.js';
import { hashPassword, verifyPassword } from './password.service.js';
import { createToken } from './token.service.js';
import { LoginInput, RegisterInput } from './auth.schemas.js';

type AuthResult = {
  token: string;
  user: { id: string; name: string; email: string; role: string };
};

type UserResponseSource = {
  _id: { toString(): string };
  name: string;
  email: string;
  role: UserRole;
};

function userResponse(user: UserResponseSource) {
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
}

function tokenFor(user: UserResponseSource, jwtSecret: string): string {
  return createToken({ userId: user._id.toString(), role: user.role }, jwtSecret);
}

export class AuthService {
  static async register(input: RegisterInput, jwtSecret: string): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    const existingUser = await User.exists({ email });

    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const user = await User.create({
      name: input.name,
      email,
      passwordHash: await hashPassword(input.password)
    });

    return { token: tokenFor(user, jwtSecret), user: userResponse(user) };
  }

  static async login(input: LoginInput, jwtSecret: string): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new AppError('Email or password is incorrect.', 401);
    }

    return { token: tokenFor(user, jwtSecret), user: userResponse(user) };
  }
}
