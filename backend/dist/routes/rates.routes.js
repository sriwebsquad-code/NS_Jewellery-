"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rates_controller_1 = require("../controllers/rates.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const audit_middleware_1 = require("../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.get('/', rates_controller_1.getRates);
router.get('/history', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, rates_controller_1.getRateHistory);
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, audit_middleware_1.auditLog, rates_controller_1.updateRates);
exports.default = router;
//# sourceMappingURL=rates.routes.js.map