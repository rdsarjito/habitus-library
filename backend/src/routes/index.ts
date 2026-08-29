import { Router } from 'express';
import bookRoutes from './book.routes';
import memberRoutes from './member.routes';

const router = Router();

// Resource routes
router.use('/books', bookRoutes);
router.use('/members', memberRoutes);
// router.use('/loans', loanRoutes);       // Phase 5
// router.use('/auth', authRoutes);         // Phase 6
// router.use('/dashboard', dashRoutes);    // Phase 6

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
