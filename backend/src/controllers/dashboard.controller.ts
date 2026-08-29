import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await dashboardService.getStats();
    sendSuccess(res, {
      message: 'Statistik dashboard berhasil diambil',
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}
