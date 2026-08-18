"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const audit_middleware_1 = require("../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.get('/dashboard/stats', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, admin_controller_1.getDashboardStats);
router.get('/transactions', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, admin_controller_1.getTransactions);
router.post('/transactions/:id/verify', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, audit_middleware_1.auditLog, admin_controller_1.verifyTransaction);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map