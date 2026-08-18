import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Menu, Bell, ChevronRight, Coins, Sparkles } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const DigitalGoldScreen = () => {
  const navigation = useNavigation() as any;
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState<'gold22'|'gold24'>('gold22');
  const [amount, setAmount] = useState('');
  const [weight, setWeight] = useState('');
  const [lastEdited, setLastEdited] = useState<'amount'|'weight'>('amount');
  
  const [goldRate, setGoldRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const API_URL = 'https://ns-jewellery.onrender.com'; // local backend
      const response = await fetch(`${API_URL}/api/rates`);
      const data = await response.json();
      if (data.success && data.data && data.data.goldRate) {
        setGoldRate(data.data.goldRate);
      } else {
        setGoldRate(7250);
      }
    } catch (error) {
      console.log('Failed to fetch rates, using fallback:', error);
      setGoldRate(7250);
    } finally {
      setIsLoading(false);
    }
  };

  const currentRate = activeTab === 'gold22' ? (goldRate ? Math.round(goldRate * 0.916) : null) : goldRate;

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
    } else {
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
    }
    
    const currentUTC = new Date();
    const currentIST = new Date(currentUTC.getTime() + (5.5 * 60 * 60 * 1000));
    const hours = currentIST.getUTCHours();
    
    if (hours < 11 || hours >= 18) {
      Alert.alert(
        "Market Closed",
        "Digital Gold purchases are only allowed between 11:00 AM and 6:00 PM IST based on live market hours."
      );
      return;
    }

    navigation.navigate('Payment', { amount: parseFloat(amount) });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerLogo, { color: colors.text }]}>NS JEWELLERY</Text>
        <TouchableOpacity>
          <Bell color={colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Premium Dark Banner */}
        <View style={styles.banner}>
          <Image source={require('../../../assets/gold_coin.png')} style={{ position: 'absolute', right: -20, bottom: -20, width: 140, height: 140, opacity: 0.15, resizeMode: 'contain' }} />
          
          <View style={styles.bannerTopRow}>
            <Text style={styles.bannerTitle}>Digital Gold</Text>
            <TouchableOpacity style={styles.lockerBtn} onPress={() => navigation.navigate('AdvanceBookingsScreen')}>
              <Text style={styles.lockerText}>My Locker</Text>
              <ChevronRight color={COLORS.primary} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.metalsRow}>
            <TouchableOpacity 
              style={styles.metalOption} 
              onPress={() => setActiveTab('gold22')}
            >
              <View style={[styles.metalIconContainer, activeTab === 'gold22' && styles.metalIconActive]}>
                <Image source={require('../../../assets/gold_coin.png')} style={{ width: 44, height: 44, resizeMode: 'contain' }} />
              </View>
              <Text style={[styles.metalLabel, activeTab === 'gold22' && styles.metalLabelActive]}>22K Gold</Text>
              <Text style={styles.metalPrice}>{goldRate ? `₹${(goldRate*0.916).toFixed(0)}/g` : '₹ ---'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Input Card */}
        <View style={[styles.inputCard, { backgroundColor: colors.cardBackground, shadowColor: mode === 'dark' ? '#000' : COLORS.black }]}>
          <Text style={[styles.calculatorTitle, { color: colors.text }]}>Investment Calculator</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Enter Amount:</Text>
              <View style={styles.inputField}>
                <Text style={[styles.currencySymbol, { color: colors.text }]}>₹</Text>
                <TextInput 
                  style={[styles.textInput, { color: colors.text }]}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={[styles.dashedLine, { borderBottomColor: colors.border }]} />
            </View>

            <View style={[styles.orBadge, { backgroundColor: mode === 'dark' ? '#333' : '#F0F0F0' }]}>
              <Text style={[styles.orText, { color: colors.textMuted }]}>OR</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Enter Weight:</Text>
              <View style={styles.inputField}>
                <TextInput 
                  style={[styles.textInput, {textAlign: 'right', color: colors.text }]}
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={handleWeightChange}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={[styles.currencySymbol, { color: colors.text }]}>g</Text>
              </View>
              <View style={[styles.dashedLine, { borderBottomColor: colors.border }]} />
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
              "5. You can redeem your accumulated digital gold for physical jewellery at our NS Jewellery showroom at any time!"
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
              style={[styles.buyBtn, styles.cancelBtn]} 
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.buyBtnText, { color: COLORS.secondary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.buyBtn, (!amount || parseFloat(amount) <= 0) && styles.buyBtnDisabled]} 
              onPress={handleBuy}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
  },
  headerLogo: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'serif',
    color: COLORS.secondary,
  },
  banner: {
    backgroundColor: COLORS.secondary,
    padding: 24,
    paddingBottom: 40,
    marginHorizontal: 15,
    borderRadius: 24,
    marginTop: 20,
    overflow: 'hidden',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  bannerTitle: {
    color: COLORS.white,
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
    color: COLORS.white,
    fontWeight: 'bold',
  },
  metalPrice: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  inputCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 24,
    padding: 25,
    shadowColor: COLORS.black,
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
    color: COLORS.darkGray,
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
    borderColor: COLORS.lightGray,
    borderStyle: 'solid', 
    marginTop: 8,
  },
  orBadge: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 20,
  },
  orText: {
    color: COLORS.darkGray,
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
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    shadowOpacity: 0,
    elevation: 0,
    marginLeft: 0,
    marginRight: 10,
  },
  buyBtnDisabled: {
    backgroundColor: COLORS.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  buyBtnText: {
    color: COLORS.white,
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
    color: COLORS.darkGray,
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
