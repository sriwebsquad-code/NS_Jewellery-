import 'dotenv/config';

import app from './app';
import { db } from './config/firebase';
import { initRatesCron } from './services/cron.service';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check Firestore connection (simple test query)
    await db.listCollections();
    console.log('✅ Firebase connected successfully');

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
