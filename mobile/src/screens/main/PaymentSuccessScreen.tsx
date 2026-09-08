import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { COLORS, SIZES } from '../../constants/theme';

const PaymentSuccessScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  const amount = route.params?.amount || 0;
  const planName = route.params?.planName || 'Plan';
  const orderId = route.params?.orderId || `TXN${Math.floor(Math.random() * 1000000000)}`;
  const planType = route.params?.planType;
  
  const subtitleText = (planType === 'GOLD' || planType === 'SILVER') 
    ? `Your purchase of ₹${amount} for ${planName} was successful.`
    : `Your EMI of ₹${amount} for ${planName} has been received.`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>Payment Successful!</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitleText}</Text>

      <View style={[styles.detailsCard, { backgroundColor: colors.cardBackground, shadowColor: mode === 'dark' ? '#000' : COLORS.black }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Transaction ID</Text>
          <Text style={[styles.value, { color: colors.text }]}>{orderId}</Text>
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

      <Text style={{color: colors.textMuted, fontSize: 12, marginBottom: 20, textAlign: 'center'}}>A receipt will be sent to your registered email or phone.</Text>

      <TouchableOpacity 
        style={[styles.homeBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.homeBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cardBackground, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  checkIcon: { color: colors.cardBackground, fontSize: 50, fontWeight: 'bold' },
  title: { fontSize: SIZES.h2, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 10 },
  subtitle: { fontSize: SIZES.h4, color: colors.textMuted, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  detailsCard: { width: '100%', backgroundColor: colors.background, padding: 20, borderRadius: SIZES.radius, marginBottom: 30, shadowColor: colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { color: colors.textMuted },
  value: { fontWeight: 'bold', color: colors.text },
  homeBtn: { backgroundColor: COLORS.secondary, padding: 15, borderRadius: SIZES.radius, width: '100%', alignItems: 'center' },
  homeBtnText: { color: colors.cardBackground, fontWeight: 'bold', fontSize: SIZES.h4 }
});

export default PaymentSuccessScreen;
