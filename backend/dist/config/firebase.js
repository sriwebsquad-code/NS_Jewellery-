"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
// Initialize Firebase Admin with default app if not already initialized
if ((0, app_1.getApps)().length === 0) {
    const serviceAccount = require('../../firebase-service-account.json');
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(serviceAccount),
        storageBucket: 'nsjewellery-53b2d.firebasestorage.app'
    });
}
const app = (0, app_1.getApp)();
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app).bucket();
exports.default = app;
//# sourceMappingURL=firebase.js.map