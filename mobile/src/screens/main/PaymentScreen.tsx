import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../constants/theme';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { ArrowLeft } from 'lucide-react-native';

const PaymentScreen = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'NET_BANKING'>('UPI');
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuthStore();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);
  
  const API_URL = 'https://ns-jewellery.onrender.com';
  
  const amount = route.params?.amount || 0;
  const planId = route.params?.planId;
  const planName = route.params?.planName || 'Plan EMI';
  const planType = route.params?.planType || 'AMOUNT';

  const [liveRate, setLiveRate] = useState<number | null>(null);

  React.useEffect(() => {
    if (planType === 'GOLD' || planType === 'SILVER') {
      const fetchRate = async () => {
        try {
          const res = await fetch(`${API_URL}/api/rates`);
          const data = await res.json();
          if (data.success && data.data) {
            setLiveRate(planType === 'GOLD' ? data.data.goldRate : data.data.silverRate);
          }
        } catch (error) {
          console.log('Error fetching live rate in payment', error);
        }
      };
      fetchRate();
    }
  }, [planType]);

  const handlePay = async () => {
    if (!planId) return;
    setLoading(true);
    
    try {
      // 1. Create a Payment Order via the Backend
      const response = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          itemType: planType
        })
      });
      
      const data = await response.json();
      if (data.success && data.paymentSessionId) {
        setPaymentSessionId(data.paymentSessionId);
        setCurrentOrderId(data.orderId);
      } else {
        Alert.alert('Payment Failed', data.message || 'Could not initiate payment');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.event === 'PAYMENT_SUCCESS') {
        // 2. Verify payment on the backend
        setPaymentSessionId(null); // Close Webview
        setLoading(true);
        
        const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderId: currentOrderId })
        });
        
        const verifyData = await verifyRes.json();
        
        if (verifyData.success) {
          // 3. Mark installment as paid (since the generic payment worked)
          await fetch(`${API_URL}/api/plans/payInstallment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userPlanId: planId, amount })
          });
          
          navigation.replace('PaymentSuccess');
        } else {
          Alert.alert('Payment Verification Failed', 'We could not verify your payment. Please contact support.');
        }
        
      } else if (data.event === 'PAYMENT_FAILED') {
        setPaymentSessionId(null);
        Alert.alert('Payment Failed', data.error?.message || 'Transaction was cancelled or failed.');
      }
    } catch (e) {
      console.log('Error parsing WebView message', e);
    } finally {
      setLoading(false);
    }
  };

  const isMetal = planType === 'GOLD' || planType === 'SILVER';

  if (paymentSessionId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity onPress={() => setPaymentSessionId(null)} style={styles.backBtn}>
            <ArrowLeft color={colors.text} size={24} />
            <Text style={[styles.backText, { color: colors.text }]}>Cancel Payment</Text>
          </TouchableOpacity>
        </View>
        <WebView 
          source={{ uri: `${API_URL}/api/payment/checkout/${paymentSessionId}` }}
          onMessage={handleWebViewMessage}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={(request) => {
            const { url } = request;
            // Handle UPI and App Intents
            if (
              url.startsWith('upi://') || 
              url.startsWith('intent://') || 
              url.startsWith('paytmmp://') || 
              url.startsWith('gpay://') || 
              url.startsWith('phonepe://')
            ) {
              Linking.openURL(url).catch(err => {
                Alert.alert("App Not Found", "No suitable payment app was found on your device to handle this link.");
              });
              return false; // Prevent WebView from trying to load it
            }
            return true; // Let WebView load normal HTTP/HTTPS links
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
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
              {liveRate ? (
                <>
                  <Text style={[styles.metalInfoText, { fontWeight: 'bold', fontSize: 14, marginBottom: 4 }]}>
                    Estimated Weight: {(amount / liveRate).toFixed(4)}g
                  </Text>
                  <Text style={[styles.metalInfoText, { fontSize: 11, opacity: 0.8 }]}>
                    Based on live {planType === 'GOLD' ? 'Gold' : 'Silver'} rate of ₹{liveRate}/g
                  </Text>
                </>
              ) : (
                <Text style={styles.metalInfoText}>
                  {planType === 'GOLD' ? 'Gold' : 'Silver'} weight will be added based on today's live rate upon successful payment.
                </Text>
              )}
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Select Payment Method</Text>

        <TouchableOpacity 
          style={[styles.paymentMethod, { backgroundColor: colors.cardBackground }]}
          onPress={() => setSelectedMethod('UPI')}
        >
          <Text style={[styles.methodText, { color: colors.text }]}>UPI (GPay, PhonePe, Paytm)</Text>
          <View style={[selectedMethod === 'UPI' ? styles.radioSelected : styles.radioUnselected, { borderColor: selectedMethod === 'UPI' ? colors.primary : colors.border }]}>
             {selectedMethod === 'UPI' && <View style={[styles.radioSelectedInner, { backgroundColor: colors.primary }]} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentMethod, { backgroundColor: colors.cardBackground }]}
          onPress={() => setSelectedMethod('NET_BANKING')}
        >
          <Text style={[styles.methodText, { color: colors.text }]}>Net Banking</Text>
          <View style={[selectedMethod === 'NET_BANKING' ? styles.radioSelected : styles.radioUnselected, { borderColor: selectedMethod === 'NET_BANKING' ? colors.primary : colors.border }]}>
             {selectedMethod === 'NET_BANKING' && <View style={[styles.radioSelectedInner, { backgroundColor: colors.primary }]} />}
          </View>
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

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: colors.cardBackground },
  headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.secondary, fontFamily: 'serif' },
  content: { padding: 20, flex: 1 },
  summaryCard: { backgroundColor: colors.cardBackground, padding: 20, borderRadius: 16, marginBottom: 30, shadowColor: colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: colors.textMuted, fontSize: 15 },
  value: { color: COLORS.secondary, fontWeight: '600', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  metalInfoBox: { marginTop: 15, padding: 12, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 8 },
  metalInfoText: { color: '#B8860B', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textMuted, marginBottom: 15, marginLeft: 5 },
  paymentMethod: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.cardBackground, padding: 18, borderRadius: 12, marginBottom: 10 },
  methodText: { fontSize: 16, color: COLORS.secondary, fontWeight: '500' },
  radioSelected: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  radioSelectedInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  radioUnselected: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#DDD' },
  payBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  payBtnDisabled: { opacity: 0.7 },
  payBtnText: { color: colors.cardBackground, fontSize: 18, fontWeight: 'bold' },
  webviewHeader: { padding: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  headerBackBtn: { marginRight: 15, padding: 5 }
});

export default PaymentScreen;
