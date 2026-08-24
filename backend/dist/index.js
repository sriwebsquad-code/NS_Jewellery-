"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const firebase_1 = require("./config/firebase");
const cron_service_1 = require("./services/cron.service");
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        // Check Firestore connection (simple test query)
        await firebase_1.db.listCollections();
        console.log('✅ Firebase connected successfully');
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            // Initialize cron jobs
            (0, cron_service_1.initRatesCron)();
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map