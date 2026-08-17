import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app: Application = express();

// Security Middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: '*', // In production, replace with specific domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import ratesRoutes from './routes/rates.routes';
import jewelleryRoutes from './routes/jewellery.routes';
import digitalRoutes from './routes/digital.routes';
import plansRoutes from './routes/plans.routes';
import notificationsRoutes from './routes/notifications.routes';
import path from 'path';

// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for images)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/jewellery', jewelleryRoutes);
app.use('/api/digital', digitalRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Jewellery Savings API is running' });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
