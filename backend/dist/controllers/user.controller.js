"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.updateProfile = exports.getProfile = void 0;
const db_1 = __importDefault(require("../config/db"));
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const user = await db_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                name: true,
                email: true,
                address: true,
                city: true,
                state: true,
                pincode: true,
                role: true,
                createdAt: true,
            }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch profile', error: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { name, email, address, city, state, pincode } = req.body;
        const updatedUser = await db_1.default.user.update({
            where: { id: userId },
            data: { name, email, address, city, state, pincode },
            select: {
                id: true,
                phone: true,
                name: true,
                email: true,
                address: true,
                city: true,
                state: true,
                pincode: true,
                role: true,
            }
        });
        res.status(200).json({ success: true, message: 'Profile updated successfully', data: updatedUser });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
    }
};
exports.updateProfile = updateProfile;
const getAllUsers = async (req, res) => {
    try {
        const users = await db_1.default.user.findMany({
            select: {
                id: true,
                phone: true,
                name: true,
                email: true,
                address: true,
                city: true,
                state: true,
                pincode: true,
                role: true,
                kycStatus: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=user.controller.js.map