import { Router } from 'express';

const router = Router();

// Routes will be added in subsequent phases:
// router.use('/auth', authRoutes);       // Phase 6
// router.use('/books', bookRoutes);       // Phase 4
// router.use('/members', memberRoutes);   // Phase 4
// router.use('/loans', loanRoutes);       // Phase 5
// router.use('/dashboard', dashRoutes);   // Phase 6

// Placeholder: API info
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
