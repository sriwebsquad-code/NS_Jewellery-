"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: '*', // In production, replace with specific domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const rates_routes_1 = __importDefault(require("./routes/rates.routes"));
const jewellery_routes_1 = __importDefault(require("./routes/jewellery.routes"));
const digital_routes_1 = __importDefault(require("./routes/digital.routes"));
const plans_routes_1 = __importDefault(require("./routes/plans.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const kyc_routes_1 = __importDefault(require("./routes/kyc.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const path_1 = __importDefault(require("path"));
// Body parsing Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Static files (for images)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../uploads')));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/rates', rates_routes_1.default);
app.use('/api/jewellery', jewellery_routes_1.default);
app.use('/api/digital', digital_routes_1.default);
app.use('/api/plans', plans_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
app.use('/api/kyc', kyc_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Jewellery Savings API is running' });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map