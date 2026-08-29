import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// =====================
// Global Middleware
// =====================
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================
// Health Check
// =====================
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// =====================
// API Routes (v1)
// =====================
app.use('/api/v1', routes);

// =====================
// 404 Handler
// =====================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    errors: [{ code: 'NOT_FOUND', message: 'Route yang diminta tidak tersedia' }],
  });
});

// =====================
// Global Error Handler
// =====================
app.use(errorHandler);

export default app;
