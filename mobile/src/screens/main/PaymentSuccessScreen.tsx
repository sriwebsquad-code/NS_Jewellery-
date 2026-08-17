import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { COLORS, SIZES } from '../../constants/theme';

const PaymentSuccessScreen = () => {
  const navigation = useNavigation<any>();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>Payment Successful!</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Your EMI of ₹5,000 for 11-Month Swarna Plan has been received.</Text>

      <View style={[styles.detailsCard, { backgroundColor: colors.cardBackground, shadowColor: mode === 'dark' ? '#000' : COLORS.black }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Transaction ID</Text>
          <Text style={[styles.value, { color: colors.text }]}>TXN9876543210</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Date & Time</Text>
          <Text style={[styles.value, { color: colors.text }]}>{new Date().toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Payment Method</Text>
          <Text style={[styles.value, { color: colors.text }]}>UPI</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.downloadBtn, { borderColor: colors.primary }]}>
        <Text style={[styles.downloadText, { color: colors.primary }]}>📥 Download Invoice PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.homeBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.homeBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  checkIcon: { color: COLORS.white, fontSize: 50, fontWeight: 'bold' },
  title: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 10 },
  subtitle: { fontSize: SIZES.h4, color: COLORS.darkGray, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  detailsCard: { width: '100%', backgroundColor: COLORS.gray, padding: 20, borderRadius: SIZES.radius, marginBottom: 30, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { color: COLORS.darkGray },
  value: { fontWeight: 'bold', color: COLORS.black },
  downloadBtn: { padding: 15, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.primary, width: '100%', alignItems: 'center', marginBottom: 15 },
  downloadText: { color: COLORS.primary, fontWeight: 'bold', fontSize: SIZES.h4 },
  homeBtn: { backgroundColor: COLORS.secondary, padding: 15, borderRadius: SIZES.radius, width: '100%', alignItems: 'center' },
  homeBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: SIZES.h4 }
});

export default PaymentSuccessScreen;
