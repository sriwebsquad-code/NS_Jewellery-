import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/theme';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuthStore();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  
  const amount = route.params?.amount || 0;
  const planId = route.params?.planId;
  const planName = route.params?.planName || 'Plan EMI';
  const planType = route.params?.planType || 'AMOUNT';

  const handlePay = async () => {
    if (!planId) return;
    setLoading(true);
    
    try {
      const API_URL = 'http://10.75.1.170:5000';
      const response = await fetch(`${API_URL}/api/plans/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId,
          amount,
          paymentId: 'txn_' + Date.now() // Mock payment ID
        })
      });
      
      const data = await response.json();
      if (data.success) {
        navigation.replace('PaymentSuccess');
      } else {
        Alert.alert('Payment Failed', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isMetal = planType === 'GOLD' || planType === 'SILVER';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground, shadowColor: mode === 'dark' ? '#000' : COLORS.black }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{planName}</Text>
            <Text style={[styles.value, { color: colors.text }]}>₹{amount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Processing Fee (0%)</Text>
            <Text style={[styles.value, { color: colors.text }]}>₹0</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.row}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Payable</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>₹{amount.toLocaleString('en-IN')}</Text>
          </View>
          
          {isMetal && (
            <View style={[styles.metalInfoBox, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
              <Text style={styles.metalInfoText}>
                {planType === 'GOLD' ? 'Gold' : 'Silver'} weight will be added based on today's live rate upon successful payment.
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Select Payment Method</Text>

        <TouchableOpacity style={[styles.paymentMethod, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.methodText, { color: colors.text }]}>UPI (GPay, PhonePe, Paytm)</Text>
          <View style={[styles.radioSelected, { borderColor: colors.primary }]}>
             <View style={[styles.radioSelectedInner, { backgroundColor: colors.primary }]} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.paymentMethod, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.methodText, { color: colors.text }]}>Credit / Debit Card</Text>
          <View style={[styles.radioUnselected, { borderColor: colors.border }]} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.paymentMethod, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.methodText, { color: colors.text }]}>Net Banking</Text>
          <View style={[styles.radioUnselected, { borderColor: colors.border }]} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.payBtn, loading && styles.payBtnDisabled, { backgroundColor: colors.primary }]} 
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.payBtnText}>Pay ₹{amount.toLocaleString('en-IN')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  header: { padding: 20, paddingTop: 60, backgroundColor: COLORS.white },
  headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.secondary, fontFamily: 'serif' },
  content: { padding: 20, flex: 1 },
  summaryCard: { backgroundColor: COLORS.white, padding: 20, borderRadius: 16, marginBottom: 30, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: COLORS.darkGray, fontSize: 15 },
  value: { color: COLORS.secondary, fontWeight: '600', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  metalInfoBox: { marginTop: 15, padding: 12, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 8 },
  metalInfoText: { color: '#B8860B', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.darkGray, marginBottom: 15, marginLeft: 5 },
  paymentMethod: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 18, borderRadius: 12, marginBottom: 10 },
  methodText: { fontSize: 16, color: COLORS.secondary, fontWeight: '500' },
  radioSelected: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  radioSelectedInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  radioUnselected: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#DDD' },
  payBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  payBtnDisabled: { opacity: 0.7 },
  payBtnText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});

export default PaymentScreen;
