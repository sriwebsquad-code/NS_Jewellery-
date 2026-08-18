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
import adminRoutes from './routes/admin.routes';
import { initRatesCron } from './services/cron.service';
import rateLimit from 'express-rate-limit';
import ratesRoutes from './routes/rates.routes';
import jewelleryRoutes from './routes/jewellery.routes';
import digitalRoutes from './routes/digital.routes';
import plansRoutes from './routes/plans.routes';
import notificationsRoutes from './routes/notifications.routes';
import kycRoutes from './routes/kyc.routes';
import path from 'path';

// Body parsing Middleware
app.use(express.json());

// Set up rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/OTP requests per hour
  message: { success: false, message: 'Too many authentication attempts, please try again later' }
});

// Apply rate limiters
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
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
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);

// Initialize Cron Jobs
initRatesCron();

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
