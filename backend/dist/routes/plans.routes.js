"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const plans_controller_1 = require("../controllers/plans.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get('/', plans_controller_1.getPlans);
router.use(auth_middleware_1.authenticate);
router.post('/join', plans_controller_1.joinPlan);
router.post('/pay', plans_controller_1.payInstallment);
router.get('/my-plans', plans_controller_1.getUserPlans);
router.get('/my-plan/:userPlanId/transactions', plans_controller_1.getMyPlanTransactions);
router.post('/create', auth_middleware_1.authorizeAdmin, plans_controller_1.createPlan);
router.get('/:planId/users', auth_middleware_1.authorizeAdmin, plans_controller_1.getPlanUsers);
router.get('/user-plan/:userPlanId/transactions', auth_middleware_1.authorizeAdmin, plans_controller_1.getUserPlanTransactions);
router.post('/user-plan/:userPlanId/redeem', auth_middleware_1.authorizeAdmin, plans_controller_1.redeemUserPlan);
exports.default = router;
//# sourceMappingURL=plans.routes.js.map