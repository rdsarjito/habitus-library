import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { LoginInput } from '../validators/auth.validator';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as LoginInput;
    const result = await authService.login(input);
    sendSuccess(res, {
      message: 'Login berhasil',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    sendSuccess(res, {
      message: 'Profil pengguna berhasil diambil',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
