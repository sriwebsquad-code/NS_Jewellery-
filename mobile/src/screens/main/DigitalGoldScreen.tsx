import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Menu, Bell, ChevronRight, Coins, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { ENV } from '../../config/env';

const DigitalGoldScreen = () => {
  const navigation = useNavigation() as any;
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  const [activeTab, setActiveTab] = useState('gold22');
  const [amount, setAmount] = useState('');
  const [weight, setWeight] = useState('');
  const [lastEdited, setLastEdited] = useState<'amount'|'weight'>('amount');
  const [showImportantNotice, setShowImportantNotice] = useState(false);
  
  const [goldRate, setGoldRate] = useState<number | null>(null);
  const [rateEffectiveDate, setRateEffectiveDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const API_URL = ENV.BASE_URL;
      const response = await fetch(`${API_URL}/api/rates`);
      const data = await response.json();
      if (data.success && data.data && data.data.goldRate !== undefined && data.data.goldRate !== null) {
        setGoldRate(data.data.goldRate);
        setRateEffectiveDate(data.data.effectiveDate || data.data.createdAt || null);
      } else {
        setGoldRate(0);
        setRateEffectiveDate(null);
      }
    } catch (error) {
      console.log('Failed to fetch rates, using fallback:', error);
      setGoldRate(0);
      setRateEffectiveDate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const currentRate = goldRate;

  useEffect(() => {
    if (currentRate) {
      if (lastEdited === 'amount' && amount && !isNaN(parseFloat(amount))) {
        setWeight((parseFloat(amount) / currentRate).toFixed(3));
      } else if (lastEdited === 'weight' && weight && !isNaN(parseFloat(weight))) {
        setAmount((parseFloat(weight) * currentRate).toFixed(0));
      }
    }
  }, [currentRate, activeTab]);

  const handleAmountChange = (text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    setAmount(cleanText);
    setLastEdited('amount');
    if (cleanText && currentRate && !isNaN(parseFloat(cleanText))) {
      const w = (parseFloat(cleanText) / currentRate).toFixed(3);
      setWeight(w);
    } else {
      setWeight('');
    }
  };

  const handleWeightChange = (text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    setWeight(cleanText);
    setLastEdited('weight');
    if (cleanText && currentRate && !isNaN(parseFloat(cleanText))) {
      const a = (parseFloat(cleanText) * currentRate).toFixed(0);
      setAmount(a);
    } else {
      setAmount('');
    }
  };

  const user = useAuthStore((state) => state.user);

  const handleBuy = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    const amountNum = parseFloat(amount);
    
    if (user?.kycStatus !== 'VERIFIED') {
      Alert.alert(
        "KYC Required",
        "Please verify your Aadhar to make purchases.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Verify Now", onPress: () => navigation.navigate('AadharVerification') }
        ]
      );
      return;
    }

    if (amountNum > 200000) {
      if (user?.panStatus !== 'VERIFIED') {
        Alert.alert(
          "PAN Verification Required",
          "Purchases above ₹2 Lakhs require PAN verification.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Verify PAN Now", onPress: () => navigation.navigate('PanVerification') }
          ]
        );
        return;
      }
    }
    
    // Check if today's rate has already been published by the admin.
    // Use the same logic as the backend: effectiveDate must be today's date.
    let isRateForToday = false;
    if (rateEffectiveDate) {
      const rateDate = new Date(rateEffectiveDate);
      const today = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const rateIST = new Date(rateDate.getTime() + istOffset);
      const nowIST = new Date(today.getTime() + istOffset);
      
      isRateForToday =
        rateIST.getUTCFullYear() === nowIST.getUTCFullYear() &&
        rateIST.getUTCMonth() === nowIST.getUTCMonth() &&
        rateIST.getUTCDate() === nowIST.getUTCDate();
    }

    if (!isRateForToday) {
      setShowImportantNotice(true);
      return;
    }

    navigation.navigate('Payment', { amount: parseFloat(amount), planName: 'Digital Gold', planType: 'GOLD' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: mode === 'dark' ? colors.backgroundSecondary : '#FDFCF8' }]}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: mode === 'dark' ? colors.background : '#FDFCF8', borderBottomColor: mode === 'dark' ? colors.border : '#EAEAEA' }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color={mode === 'dark' ? colors.text : '#4A3424'} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerLogo, { color: mode === 'dark' ? colors.text : '#4A3424' }]} numberOfLines={1}>NS Mahaveer DigiGold</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Premium Dark Banner */}
        <LinearGradient
          colors={['#A87B4C', '#6A4C25', '#4A3424']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          
          <View style={styles.bannerTopRow}>
            <Text style={styles.bannerTitle}>Digital Gold</Text>
            <TouchableOpacity style={styles.lockerBtn} onPress={() => navigation.navigate('MyLockerScreen')}>
              <Text style={styles.lockerText}>My Savings</Text>
              <ChevronRight color={'#4A3424'} size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.metalsRow}>
            <Image source={require('../../../assets/premium_gold_coin_rupee.jpg')} style={styles.heroCoinImage} />
            <View style={{ marginLeft: 20 }}>
              <Text style={[styles.metalLabelActive, { fontSize: 16, color: '#FDFCF8' }]}>22K Gold</Text>
              <Text style={[styles.metalPrice, { color: '#FFF' }]}>{goldRate ? `₹${goldRate}/g` : '₹ ---'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Premium Input Card */}
        <View style={[styles.inputCard, { backgroundColor: mode === 'dark' ? colors.cardBackground : '#FDFCF8', shadowColor: '#000', borderColor: mode === 'dark' ? colors.border : '#EAEAEA', borderWidth: 1 }]}>
          <Text style={[styles.calculatorTitle, { color: mode === 'dark' ? colors.text : '#333' }]}>Investment Calculator</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: mode === 'dark' ? colors.textMuted : '#888' }]}>ENTER AMOUNT:</Text>
              <View style={styles.inputField}>
                <Text style={[styles.currencySymbol, { color: mode === 'dark' ? colors.text : '#333' }]}>₹</Text>
                <TextInput 
                  style={[styles.textInput, { color: mode === 'dark' ? colors.text : '#333' }]}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  placeholderTextColor={mode === 'dark' ? colors.textMuted : '#CCC'}
                />
              </View>
              <View style={[styles.dashedLine, { borderBottomColor: mode === 'dark' ? colors.border : '#EAEAEA' }]} />
            </View>

            <View style={[styles.orBadge, { backgroundColor: mode === 'dark' ? '#333' : '#FDFCF8', borderColor: '#EAEAEA', borderWidth: 1 }]}>
              <Text style={[styles.orText, { color: mode === 'dark' ? colors.textMuted : '#888' }]}>OR</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: mode === 'dark' ? colors.textMuted : '#888', textAlign: 'right' }]}>ENTER WEIGHT:</Text>
              <View style={styles.inputField}>
                <TextInput 
                  style={[styles.textInput, {textAlign: 'right', color: mode === 'dark' ? colors.text : '#333' }]}
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={handleWeightChange}
                  placeholder="0"
                  placeholderTextColor={mode === 'dark' ? colors.textMuted : '#CCC'}
                />
                <Text style={[styles.currencySymbol, { color: mode === 'dark' ? colors.text : '#333' }]}>g</Text>
              </View>
              <View style={[styles.dashedLine, { borderBottomColor: mode === 'dark' ? colors.border : '#EAEAEA' }]} />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.howItWorks}
            onPress={() => Alert.alert(
              "How to Buy Digital Gold",
              "1. Enter the amount in Rupees you wish to invest, or the weight in grams you wish to buy.\n\n" +
              "2. The equivalent gold weight or amount will be automatically calculated based on the live market rate.\n\n" +
              "3. Click 'Buy Now' to proceed to the secure payment gateway.\n\n" +
              "4. Once purchased, the digital gold will be instantly credited to your secure Digital Locker.\n\n" +
              "5. You can redeem your accumulated digital gold for physical jewellery at our NS MAHAVEER JEWELLERY showroom at any time!"
            )}
          >
            <Text style={styles.howItWorksText}>How it works?</Text>
          </TouchableOpacity>

          {/* Checkout Summary */}
          {amount && parseFloat(amount) > 0 ? (
            <View style={[styles.summaryBox, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F9F9F9' }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Purchased Weight</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>{weight} g</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Gold Value</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>₹{parseFloat(amount).toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 5 }]}>
                <Text style={[styles.summaryLabel, { fontWeight: 'bold', color: colors.text }]}>Total Payable</Text>
                <Text style={[styles.summaryValue, { fontWeight: 'bold', fontSize: 18, color: colors.text }]}>
                  ₹{parseFloat(amount).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.buyBtn, styles.cancelBtn, { borderColor: '#D4AF37', backgroundColor: 'transparent', borderWidth: 1 }]} 
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.buyBtnText, { color: '#D4AF37' }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[{ flex: 1, marginLeft: 15 }, (!amount || parseFloat(amount) <= 0) && { opacity: 0.5 }]} 
              onPress={handleBuy}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <LinearGradient
                colors={['#D4AF37', '#A87B4C']}
                style={[styles.buyBtn, { width: '100%' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.buyBtnText, { color: '#FFF' }]}>Buy Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Important Notice Modal */}
      <Modal
        visible={showImportantNotice}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImportantNotice(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#D4AF37' }]}>
            <Text style={styles.modalTitle}>Important Notice</Text>
            <Text style={styles.modalBody}>
              THE AMOUNT WILL BE CONVERTED TO WEIGHT AS PER RATE OF GOLD ON THE PAYMENT DATE IF PAID BETWEEN 12.00AM TO THE NEXT MORNING WHEN THE RATE IS UPDATED. IT WILL CALCULATE ON THE NEXT MORNING RATE. NOT ON PREVIOUS DATE RATE.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowImportantNotice(false)} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setShowImportantNotice(false);
                navigation.navigate('Payment', { amount: parseFloat(amount), planName: 'Digital Gold', planType: 'GOLD' });
              }} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>PROCEED</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    fontFamily: 'serif',
  },
  modalBody: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.cardBackground,
  },
  headerLogo: {
    flex: 1,
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '900',
    fontFamily: 'serif',
    color: COLORS.secondary,
    marginHorizontal: 10,
  },
  banner: {
    padding: 24,
    paddingBottom: 40,
    marginHorizontal: 15,
    borderRadius: 24,
    marginTop: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardBgPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    resizeMode: 'cover',
  },
  heroCoinImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  bannerTitle: {
    color: colors.cardBackground,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  lockerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  lockerText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  metalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metalOption: {
    alignItems: 'center',
    flex: 1,
  },
  metalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  metalIconActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)', // Primary color very transparent
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  metalLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginBottom: 5,
    fontWeight: '500',
  },
  metalLabelActive: {
    color: colors.cardBackground,
    fontWeight: 'bold',
  },
  metalPrice: {
    color: colors.cardBackground,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  inputCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 24,
    padding: 25,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.secondary,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.secondary,
    padding: 0,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'solid', 
    marginTop: 8,
  },
  orBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 20,
  },
  orText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  howItWorks: {
    alignSelf: 'center',
    marginVertical: 30,
  },
  howItWorksText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  buyBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    flex: 1,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    shadowOpacity: 0,
    elevation: 0,
    marginLeft: 0,
    marginRight: 10,
  },
  buyBtnDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  buyBtnText: {
    color: '#F4E7CE',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  summaryBox: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});

export default DigitalGoldScreen;

