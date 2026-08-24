"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRates = exports.getRatesHistory = exports.getRates = void 0;
const firebase_1 = require("../config/firebase");
const getRates = async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('metalRates').orderBy('createdAt', 'desc').limit(1).get();
        if (snapshot.empty) {
            return res.status(200).json({
                success: true,
                data: { goldRate: 0, silverRate: 0, lastUpdated: new Date().toISOString() }
            });
        }
        res.status(200).json({ success: true, data: snapshot.docs[0].data() });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch rates', error: error.message });
    }
};
exports.getRates = getRates;
const getRatesHistory = async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('metalRates').orderBy('effectiveDate', 'desc').limit(30).get();
        const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json({ success: true, data: history });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch rate history', error: error.message });
    }
};
exports.getRatesHistory = getRatesHistory;
const updateRates = async (req, res) => {
    try {
        const { goldRate, silverRate, effectiveDate } = req.body;
        if (!goldRate || !silverRate) {
            return res.status(400).json({ success: false, message: 'Rates are required' });
        }
        const docRef = firebase_1.db.collection('metalRates').doc();
        const rate = {
            id: docRef.id,
            goldRate: parseFloat(goldRate),
            silverRate: parseFloat(silverRate),
            effectiveDate: effectiveDate ? new Date(effectiveDate).toISOString() : new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        await docRef.set(rate);
        res.status(200).json({ success: true, message: 'Rates updated successfully', data: rate });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update rates', error: error.message });
    }
};
exports.updateRates = updateRates;
//# sourceMappingURL=rates.controller.js.map