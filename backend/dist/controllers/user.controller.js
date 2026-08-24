"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.updateProfile = exports.getProfile = void 0;
const firebase_1 = require("../config/firebase");
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (userId === 'demo-user-id') {
            return res.status(200).json({
                success: true,
                data: { id: userId, name: 'Parthiban (Demo)', email: 'demo@nsjewellery.com', phone: '+91 9876543210' }
            });
        }
        const doc = await firebase_1.db.collection('users').doc(userId).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const userData = doc.data();
        // Don't send mpin back
        delete userData.mpin;
        res.status(200).json({ success: true, data: { id: doc.id, ...userData } });
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
        if (userId === 'demo-user-id') {
            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully (Demo Mode)',
                data: { id: userId, ...req.body }
            });
        }
        const { name, email, address, city, state, pincode, dob, gender } = req.body;
        const dataToUpdate = {};
        if (name)
            dataToUpdate.name = name;
        if (email)
            dataToUpdate.email = email;
        if (address)
            dataToUpdate.address = address;
        if (city)
            dataToUpdate.city = city;
        if (state)
            dataToUpdate.state = state;
        if (pincode)
            dataToUpdate.pincode = pincode;
        if (dob)
            dataToUpdate.dob = dob;
        if (gender)
            dataToUpdate.gender = gender;
        await firebase_1.db.collection('users').doc(userId).update(dataToUpdate);
        const updatedDoc = await firebase_1.db.collection('users').doc(userId).get();
        const userData = updatedDoc.data();
        delete userData.mpin;
        res.status(200).json({ success: true, message: 'Profile updated successfully', data: { id: updatedDoc.id, ...userData } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
    }
};
exports.updateProfile = updateProfile;
const getAllUsers = async (req, res) => {
    try {
        const usersSnapshot = await firebase_1.db.collection('users').orderBy('createdAt', 'desc').get();
        const userPlansSnapshot = await firebase_1.db.collection('userPlans').get();
        const plansSnapshot = await firebase_1.db.collection('plans').get();
        // Map plans by ID
        const plansMap = {};
        plansSnapshot.docs.forEach(doc => {
            plansMap[doc.id] = { id: doc.id, ...doc.data() };
        });
        // Map active userPlans by userId
        const activeSchemesMap = {};
        userPlansSnapshot.docs.forEach(doc => {
            const up = doc.data();
            if (up.status === 'ACTIVE') {
                if (!activeSchemesMap[up.userId]) {
                    activeSchemesMap[up.userId] = [];
                }
                activeSchemesMap[up.userId].push({
                    id: doc.id,
                    ...up,
                    planDetails: plansMap[up.planId] || null
                });
            }
        });
        const users = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            delete data.mpin; // Don't send passwords
            return {
                id: doc.id,
                ...data,
                activeSchemes: activeSchemesMap[doc.id] || []
            };
        });
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=user.controller.js.map