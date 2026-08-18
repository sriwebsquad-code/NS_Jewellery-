"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const plans_controller_1 = require("../controllers/plans.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Public / Dev routes
router.get('/seed', plans_controller_1.seedPlans);
router.get('/', plans_controller_1.getPlans);
// Protected routes
router.use(auth_middleware_1.authenticate);
router.post('/purchase', plans_controller_1.purchasePlan);
router.post('/pay', plans_controller_1.payInstallment);
exports.default = router;
//# sourceMappingURL=plans.routes.js.map