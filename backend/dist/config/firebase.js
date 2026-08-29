"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
// Initialize Firebase Admin with default app if not already initialized
if ((0, app_1.getApps)().length === 0) {
    let serviceAccount;
    // 1. Try to load from Environment Variable first (Render/Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        }
        catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT from environment");
        }
    }
    // 2. Fallback to local file for development
    if (!serviceAccount) {
        serviceAccount = require('../../firebase-service-account.json');
    }
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`
    });
}
const app = (0, app_1.getApp)();
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app).bucket();
exports.default = app;
//# sourceMappingURL=firebase.js.map