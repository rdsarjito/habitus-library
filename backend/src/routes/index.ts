import { Router } from 'express';
import authRoutes from './auth.routes';
import bookRoutes from './book.routes';
import memberRoutes from './member.routes';
import loanRoutes from './loan.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Routes
router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/members', memberRoutes);
router.use('/loans', loanRoutes);
router.use('/dashboard', dashboardRoutes);

// API info
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Sistem Manajemen Perpustakaan API v1',
    data: {
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        books: '/api/v1/books',
        members: '/api/v1/members',
        loans: '/api/v1/loans',
        dashboard: '/api/v1/dashboard',
      },
    },
  });
});

export default router;
