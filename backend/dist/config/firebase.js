"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin with default app if not already initialized
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)({
    // In production, configure credential from environment variable
    });
}
const app = (0, app_1.getApp)();
exports.default = app;
//# sourceMappingURL=firebase.js.map