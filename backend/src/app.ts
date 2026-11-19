import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app: Application = express();

// Enable trust proxy for Render / Cloudflare reverse proxy
app.set('trust proxy', 1);


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
import { initRatesCron, initRemindersCron } from './services/cron.service';
import rateLimit from 'express-rate-limit';
import ratesRoutes from './routes/rates.routes';
import jewelleryRoutes from './routes/jewellery.routes';
import digitalRoutes from './routes/digital.routes';
import plansRoutes from './routes/plans.routes';
import notificationsRoutes from './routes/notifications.routes';
import kycRoutes from './routes/kyc.routes';
import paymentRoutes from './routes/payment.routes';
import settingsRoutes from './routes/settings.routes';
import path from 'path';

// Body parsing Middleware
app.use(express.json());

// Set up rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 login/OTP requests per hour (increased for testing)
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
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
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Initialize Cron Jobs
initRatesCron();
initRemindersCron();

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Jewellery Savings API is running' });
});

// Public Account Deletion Information Page (Google Play Compliance)
app.get('/delete-account', (req: Request, res: Response) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deletion - NS Mahaveer Jewellery</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 0 20px; background-color: #fdfbf7; }
    .card { background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #f0e6d2; }
    h1 { color: #8a6416; margin-top: 0; }
    h2 { color: #555; margin-top: 24px; font-size: 1.25rem; }
    .step-box { background: #fdf8ee; padding: 16px 20px; border-left: 4px solid #d4af37; border-radius: 4px; margin: 16px 0; }
    ul, ol { padding-left: 24px; }
    li { margin-bottom: 8px; }
    .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; }
    a { color: #b8860b; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>NS Mahaveer Jewellery</h1>
    <p><span class="badge">Google Play Data Safety</span></p>
    <p>At <strong>NS Mahaveer Jewellery</strong>, we value your privacy and give you full control over your personal data. You can request the deletion of your account and associated personal data at any time.</p>
    
    <h2>How to Request Account Deletion</h2>
    
    <div class="step-box">
      <h3>Method 1: Directly inside the Mobile App (Instant)</h3>
      <ol>
        <li>Open the <strong>NS Mahaveer Jewellery</strong> app on your Android device.</li>
        <li>Open the side menu (tap the drawer icon at the top left).</li>
        <li>Select <strong>My Account</strong>.</li>
        <li>Scroll down to the bottom and tap <strong>Delete Account</strong>.</li>
        <li>Confirm your decision in the popup. Your account and active sessions will be deleted immediately.</li>
      </ol>
    </div>

    <div class="step-box">
      <h3>Method 2: Email Request</h3>
      <p>If you have uninstalled the app or cannot access your phone, you can send an account deletion request via email:</p>
      <ul>
        <li>Send an email to: <a href="mailto:nsmahaveerjewellery@gmail.com">nsmahaveerjewellery@gmail.com</a></li>
        <li>Subject: <strong>Account & Data Deletion Request</strong></li>
        <li>Include your <strong>Registered Mobile Number</strong> and Full Name.</li>
        <li>Our customer support team will verify your ownership and process the deletion within <strong>48 to 72 hours</strong>.</li>
      </ul>
    </div>

    <h2>Types of Data Deleted vs. Retained</h2>
    <ul>
      <li><strong>Data that is permanently deleted:</strong> Your account profile, full name, phone number, email address, physical delivery address, MPIN credentials, and device notification tokens.</li>
      <li><strong>Data that may be retained:</strong> Past completed payment transaction records, tax invoices, and statutory audit logs may be retained for up to 5 years as strictly mandated by Indian taxation, accounting, and anti-money laundering regulations. No marketing or account activity will be conducted on retained records.</li>
    </ul>

    <h2>Contact Information</h2>
    <p>
      <strong>NS Mahaveer Jewellery</strong><br>
      40-41, Lawrence Road, Muthaiya Nagar, Thirupapuliyur, Cuddalore - 607002, Tamil Nadu, India<br>
      Phone: +91 84009 16916 | Email: nsmahaveerjewellery@gmail.com
    </p>
  </div>
</body>
</html>`);
});

// Public Privacy Policy Page (Google Play Compliance)
app.get('/privacy-policy', (req: Request, res: Response) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - NS Mahaveer Jewellery</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 0 20px; background-color: #fdfbf7; }
    .card { background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #f0e6d2; }
    h1 { color: #8a6416; margin-top: 0; }
    h2 { color: #555; margin-top: 24px; font-size: 1.25rem; }
    ul { padding-left: 24px; }
    li { margin-bottom: 8px; }
    a { color: #b8860b; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Privacy Policy</h1>
    <p><strong>NS Mahaveer Jewellery</strong> | Last Updated: November 2026</p>
    <p>At NS Mahaveer Jewellery, your privacy and trust are paramount. This policy outlines how we collect, use, and safeguard your data.</p>
    
    <h2>1. Information We Collect</h2>
    <p>We collect information you voluntarily provide when creating an account or subscribing to savings schemes, including your name, mobile phone number, delivery address, and transaction records.</p>
    
    <h2>2. Purpose of Collection</h2>
    <p>Your data is used strictly to authenticate your account, provide daily gold/silver rates, manage monthly jewellery schemes, process secure payments, and issue digital receipts.</p>
    
    <h2>3. Data Protection & Encryption</h2>
    <p>All sensitive information transmitted between your mobile device and our backend servers is encrypted using industry-standard TLS/HTTPS protocols.</p>

    <h2>4. Account Deletion & Rights</h2>
    <p>You have the right to request deletion of your account and personal data at any time via the in-app "Delete Account" button or by visiting <a href="/delete-account">our Account Deletion Page</a>.</p>

    <h2>5. Contact Us</h2>
    <p>
      NS Mahaveer Jewellery<br>
      40-41, Lawrence Road, Muthaiya Nagar, Thirupapuliyur, Cuddalore - 607002, Tamil Nadu, India<br>
      Email: nsmahaveerjewellery@gmail.com | Phone: +91 84009 16916
    </p>
  </div>
</body>
</html>`);
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
