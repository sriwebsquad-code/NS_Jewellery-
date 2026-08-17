import 'dotenv/config';

import app from './app';
import prisma from './config/db';
import { initRatesCron } from './services/cron.service';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      
      // Initialize cron jobs
      initRatesCron();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
