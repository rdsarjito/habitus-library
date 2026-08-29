import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import env from '../config/env';
import { LoginInput } from '../validators/auth.validator';
import { UnauthorizedError } from '../errors/app-error';

export class AuthService {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { username: input.username },
    });

    if (!user) {
      throw new UnauthorizedError('Username atau password salah');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Username atau password salah');
    }

    const payload = {
      userId: user.id,
      username: user.username,
      name: user.name,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as string & jwt.SignOptions['expiresIn'],
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, name: true, createdAt: true },
    });

    if (!user) {
      throw new UnauthorizedError('User tidak ditemukan');
    }

    return user;
  }
}

export default new AuthService();
