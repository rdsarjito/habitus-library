import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

export interface AuthPayload {
  userId: string;
  username: string;
  name: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * JWT Authentication middleware.
 * Extracts and verifies Bearer token from Authorization header.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Token autentikasi diperlukan',
      errors: [{ code: 'UNAUTHORIZED', message: 'Header Authorization dengan Bearer token tidak ditemukan' }],
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah expired',
      errors: [{ code: 'UNAUTHORIZED', message: 'Token autentikasi tidak valid atau sudah kadaluarsa' }],
    });
  }
}
