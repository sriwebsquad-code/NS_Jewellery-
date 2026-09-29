import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, RefreshControl, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Menu, BellRing, Clock, ChevronRight, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../constants/Colors';
import { ENV } from '../../config/env';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { token, updateActivity, user } = useAuthStore();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);
  const insets = useSafeAreaInsets();

  const [rates, setRates] = useState<any>({ goldRate: 7250, silverRate: 85, updatedAt: new Date() });
  const [lockerData, setLockerData] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSavingsVisible, setIsSavingsVisible] = useState(false);

  const goldCarouselRef = useRef<ScrollView>(null);
  const silverCarouselRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (updateActivity) updateActivity();
    fetchDashboardData();
    fetchUnreadNotifications();
  }, []);

  // Re-fetch unread count every time this screen comes into focus
  // (e.g. user returns from the Notifications screen after reading notifications)
  useFocusEffect(
    useCallback(() => {
      fetchUnreadNotifications();
    }, [token])
  );

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % 3; // 3 items in each carousel
      goldCarouselRef.current?.scrollTo({ x: index * width, animated: true });
      silverCarouselRef.current?.scrollTo({ x: index * width, animated: true });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const API_URL = ENV.BASE_URL;
      
      // Always fetch the public rates so guests can see live rates
      fetch(`${API_URL}/api/rates`)
        .then(res => res.json())
        .then(rateData => {
          if (rateData.success && rateData.data) {
             setRates(rateData.data);
          }
        })
        .catch(err => console.log('Error fetching public rates:', err));

      // Fetch user-specific locker data if token exists
      if (token) {
        const res = await fetch(`${API_URL}/api/digital/locker`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setLockerData(data.data.locker);
          setInstallments(data.data.installments || []);
          if (data.data.currentRates && data.data.currentRates.goldRate) {
             setRates(data.data.currentRates);
          }
        }
      }
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch(`${ENV.API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        // Assume unread if status is not 'READ', or simply show red dot if there's any notification
        const unread = data.data.filter((n: any) => n.status !== 'READ').length || (data.data.length > 0 ? 1 : 0);
        setUnreadCount(unread);
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    fetchUnreadNotifications();
  };

  const updatedDate = new Date(rates.effectiveDate || rates.createdAt || new Date()).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  });

  return (
    <LinearGradient 
      colors={mode === 'dark' ? [colors.background, colors.background] : ['#FDFCF8', '#F9ECCA', '#E8C56C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.mainContainer}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuIcon}>
          <Menu color={mode === 'dark' ? '#FFF' : '#333'} size={28} />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Text 
            numberOfLines={1} 
            adjustsFontSizeToFit 
            style={{ fontFamily: 'serif', fontSize: 20, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', width: '100%' }}
          >
            NS Mahaveer Jewellery
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.menuIcon}>
          <BellRing color={'#D4AF37'} size={24} />
          {/* Unread badge indicator */}
          {unreadCount > 0 && (
            <View style={{ position: 'absolute', right: 4, top: 4, width: 10, height: 10, backgroundColor: 'red', borderRadius: 5, borderWidth: 1, borderColor: '#FDFCF8' }} />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 15, marginTop: 0 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'serif', color: mode === 'dark' ? colors.text : '#333' }}>
          Hello, {user?.name || 'Guest'} 👋
        </Text>
        <Text style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
          Your dreams are our priority ♡
        </Text>
      </View>
      <View style={[styles.ratesRow, { marginTop: 0, paddingBottom: 0, marginBottom: 15 }]}>
        {/* Gold Rate Card */}
        <LinearGradient
          colors={['#FDF2D0', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rateCardGradient}
        >
          <Text style={[styles.rateTitle, { color: '#6A4C25' }]}>Gold Rate</Text>
          <View style={styles.rateContent}>
            <Image source={require('../../../assets/premium_gold_coin_3d.jpg')} style={styles.premiumCoinStyle} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.rateValue, { color: '#4A3424' }]}>₹{rates.goldRate}</Text>
              <Text style={[styles.rateSubtitle, { color: '#6A4C25' }]}>22KT Per Gram</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Silver Rate Card */}
        <LinearGradient
          colors={['#F0F0F0', '#B0B5B9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rateCardGradient}
        >
          <Text style={[styles.rateTitle, { color: '#4A5056' }]}>Silver Rate</Text>
          <View style={styles.rateContent}>
            <Image source={require('../../../assets/premium_silver_coin_3d.jpg')} style={styles.premiumCoinStyle} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.rateValue, { color: '#2C3E50' }]}>₹{rates.silverRate}</Text>
              <Text style={[styles.rateSubtitle, { color: '#4A5056' }]}>Per Gram</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
      
      <View style={{ alignSelf: 'center', backgroundColor: '#F3E5D8', paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 0 }}>
        <Clock color="#A88151" size={12} style={{ marginRight: 6 }} />
        <Text style={{ color: '#A88151', fontSize: 10, fontWeight: '500' }}>Rate updated on {updatedDate}</Text>
      </View>

      {/* My Savings Card */}
      {token && (
        <TouchableOpacity
          style={styles.savingsCardContainer}
          onPress={() => navigation.navigate('MyLockerScreen')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#4A3424', '#2C1E14']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.savingsGradient}
          >
            <View style={styles.savingsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View>
                  <Text style={styles.savingsTitle}>My Savings</Text>
                  <Text style={styles.savingsSubtitle}>Secure your gold & silver digitally</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity 
                  onPress={() => setIsSavingsVisible(!isSavingsVisible)} 
                  style={{ padding: 8, marginRight: 8, zIndex: 10 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {isSavingsVisible ? (
                    <EyeOff color="#FFF" size={20} opacity={0.7} />
                  ) : (
                    <Eye color="#FFF" size={20} opacity={0.7} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('MyLockerScreen')} style={{ padding: 4 }}>
                  <ChevronRight color="#D4AF37" size={20} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.savingsBalances}>
              {/* Gold Balance */}
              <View style={styles.savingsBalanceItem}>
                <Image source={require('../../../assets/premium_gold_coin_3d.jpg')} style={styles.savingsCoin} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.savingsBalanceLabel}>Gold Balance</Text>
                  <Text style={styles.savingsBalanceValue}>
                    {isSavingsVisible ? (lockerData?.goldBalance != null ? Number(lockerData.goldBalance).toFixed(3) + ' Grams' : '0.000 Grams') : '••••'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.savingsDivider} />
              
              {/* Silver Balance */}
              <View style={styles.savingsBalanceItem}>
                <Image source={require('../../../assets/premium_silver_coin_3d.jpg')} style={styles.savingsCoin} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.savingsBalanceLabel}>Silver Balance</Text>
                  <Text style={styles.savingsBalanceValue}>
                    {isSavingsVisible ? (lockerData?.silverBalance != null ? Number(lockerData.silverBalance).toFixed(3) + ' Grams' : '0.000 Grams') : '••••'}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Vertical Schemes/Wallets Stack */}
            <View style={styles.schemesContainer}>
              
              <View style={{ width: '100%', paddingHorizontal: 25, marginBottom: 5, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.sectionHeading, { color: mode === 'dark' ? colors.text : '#333', marginLeft: 0, marginBottom: 0 }]}>Exclusive Offerings</Text>
                <View style={{ width: 20, height: 2, backgroundColor: '#D4AF37', marginLeft: 10 }} />
              </View>
              <Text style={{ color: '#888', fontSize: 13, paddingHorizontal: 25, marginBottom: 20, alignSelf: 'flex-start' }}>Benefit from our 4 unique schemes designed for your savings.</Text>

              <View style={{ width: '100%', paddingHorizontal: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={[styles.sectionHeading, { color: mode === 'dark' ? colors.text : '#333', marginLeft: 0, marginBottom: 0 }]}>Gold Plans</Text>
                <TouchableOpacity onPress={() => navigation.navigate('My Plans', { defaultCategory: 'Gold Schemes' })}>
                  <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>View All →</Text>
                </TouchableOpacity>
              </View>

              {/* Gold Carousel */}
              <ScrollView
                ref={goldCarouselRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ width }}
              >
                {/* Card 1: 11 Month Gold Scheme */}
                <View style={styles.carouselItem}>
                  <View style={[styles.planCard, { backgroundColor: '#FDF2D0' }]}>
                    <Image source={require('../../../assets/gold_card_bg.jpg')} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.9, resizeMode: 'cover' }} />
                    <View style={{ position: 'absolute', right: -15, bottom: -15, width: 140, height: 140, borderRadius: 70, overflow: 'hidden', borderWidth: 3, borderColor: '#D4AF37' }}>
                      <Image source={require('../../../assets/gold_cash_icon.jpg')} style={{ width: '100%', height: '100%', resizeMode: 'cover', transform: [{ scale: 1.6 }] }} />
                    </View>
                    <Text style={[styles.planCardLogo, { color: '#88622E' }]}>NS MAHAVEER JEWELLERY</Text>
                    <Text style={[styles.planCardLogoBold, { color: '#4A3424' }]}>Gold</Text>
                    <Text style={[styles.planCardSubtitle, { color: '#6A4C25' }]}>
                      <Text style={{ fontWeight: '900', fontSize: 16 }}>11 Month Value</Text>
                      <Text style={{ fontSize: 11, fontWeight: '600' }}> Based Gold Scheme</Text>
                    </Text>
                    <TouchableOpacity style={[styles.planExploreBtn, { backgroundColor: '#D4AF37' }]} onPress={() => navigation.navigate('My Plans', { defaultCategory: 'Gold Schemes' })}>
                      <Text style={[styles.planExploreBtnText, { color: '#4A3424' }]}>EXPLORE PLAN →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Card 2: Gold 11 Scheme */}
                <View style={styles.carouselItem}>
                  <View style={[styles.planCard, { backgroundColor: '#FDF2D0' }]}>
                    <Image source={require('../../../assets/gold_card_bg.jpg')} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.9, resizeMode: 'cover' }} />
                    <View style={{ position: 'absolute', right: -15, bottom: -15, width: 140, height: 140, borderRadius: 70, overflow: 'hidden', borderWidth: 3, borderColor: '#D4AF37' }}>
                      <Image source={require('../../../assets/gold_scale_icon.jpg')} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                    </View>
                    <Text style={[styles.planCardLogo, { color: '#88622E' }]}>NS MAHAVEER JEWELLERY</Text>
                    <Text style={[styles.planCardLogoBold, { color: '#4A3424' }]}>Gold</Text>
                    <Text style={[styles.planCardSubtitle, { color: '#6A4C25' }]}>
                      <Text style={{ fontWeight: '900', fontSize: 16 }}>11 Month Weight</Text>
                      <Text style={{ fontSize: 11, fontWeight: '600' }}> Based Gold Scheme</Text>
                    </Text>
                    <TouchableOpacity style={[styles.planExploreBtn, { backgroundColor: '#D4AF37' }]} onPress={() => navigation.navigate('My Plans', { defaultCategory: 'Gold Schemes' })}>
                      <Text style={[styles.planExploreBtnText, { color: '#4A3424' }]}>KNOW MORE →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Card 3: Gold Wallet */}
                <View style={styles.carouselItem}>
                  <View style={[styles.planCard, { backgroundColor: '#3B2518' }]}>
                    <Image source={require('../../../assets/gold_wallet_bg.jpg')} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 16 }} />
                    <Image source={require('../../../assets/custom_gold_coin.jpg')} style={{ position: 'absolute', right: -10, bottom: 10, width: 120, height: 120, borderRadius: 60 }} />
                    <Text style={styles.planCardLogo}>Digital</Text>
                    <Text style={styles.planCardLogoBold}>Gold Wallet</Text>
                    <Text style={styles.planCardSubtitle}>Balance: {lockerData?.goldBalance?.toFixed(3) || '0.000'} g</Text>
                    <TouchableOpacity style={styles.planExploreBtn} onPress={() => navigation.navigate('Digi Gold')}>
                      <Text style={styles.planExploreBtnText}>BUY GOLD →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View style={{ width: '100%', paddingHorizontal: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 10 }}>
                <Text style={[styles.sectionHeading, { color: mode === 'dark' ? colors.text : '#333', marginLeft: 0, marginBottom: 0 }]}>Silver Plans</Text>
                <TouchableOpacity onPress={() => navigation.navigate('My Plans', { defaultCategory: 'Silver Schemes' })}>
                  <Text style={{ color: '#D4AF37', fontWeight: 'bold' }}>View All →</Text>
                </TouchableOpacity>
              </View>

              {/* Silver Carousel */}
              <ScrollView
                ref={silverCarouselRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ width }}
              >
                {/* Card 4: 11 Month Silver Scheme */}
                <View style={styles.carouselItem}>
                  <View style={[styles.planCard, { backgroundColor: '#E5ECF2' }]}>
                    <Image source={require('../../../assets/silver_card_bg.jpg')} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.9, resizeMode: 'cover' }} />
                    <View style={{ position: 'absolute', right: -15, bottom: -15, width: 140, height: 140, borderRadius: 70, overflow: 'hidden', borderWidth: 3, borderColor: '#B0BEC5' }}>
                      <Image source={require('../../../assets/silver_cash_icon.jpg')} style={{ width: '100%', height: '100%', resizeMode: 'cover', transform: [{ scale: 1.6 }] }} />
                    </View>
                    <Text style={[styles.planCardLogo, { color: '#4A5056' }]}>NS MAHAVEER JEWELLERY</Text>
                    <Text style={[styles.planCardLogoBold, { color: '#2C3E50' }]}>Silver</Text>
                    <Text style={[styles.planCardSubtitle, { color: '#34495E' }]}>
                      <Text style={{ fontWeight: '900', fontSize: 16 }}>11 Month Value</Text>
                      <Text style={{ fontSize: 11, fontWeight: '600' }}> Based Silver Scheme</Text>
                    </Text>
                    <TouchableOpacity style={[styles.planExploreBtn, { backgroundColor: '#FDFCF8' }]} onPress={() => navigation.navigate('My Plans', { defaultCategory: 'Silver Schemes' })}>
                      <Text style={[styles.planExploreBtnText, { color: '#2C3E50' }]}>EXPLORE PLAN →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Card 5: Silver 11 Scheme */}
                <View style={styles.carouselItem}>
                  <View style={[styles.planCard, { backgroundColor: '#E5ECF2' }]}>
                    <Image source={require('../../../assets/silver_card_bg.jpg')} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.9, resizeMode: 'cover' }} />
                    <View style={{ position: 'absolute', right: -15, bottom: -15, width: 140, height: 140, borderRadius: 70, overflow: 'hidden', borderWidth: 3, borderColor: '#B0BEC5' }}>
                      <Image source={require('../../../assets/silver_scale_icon.jpg')} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                    </View>
                    <Text style={[styles.planCardLogo, { color: '#4A5056' }]}>NS MAHAVEER JEWELLERY</Text>
                    <Text style={[styles.planCardLogoBold, { color: '#2C3E50' }]}>Silver</Text>
                    <Text style={[styles.planCardSubtitle, { color: '#34495E' }]}>
                      <Text style={{ fontWeight: '900', fontSize: 16 }}>11 Month Weight</Text>
                      <Text style={{ fontSize: 11, fontWeight: '600' }}> Based Silver Scheme</Text>
                    </Text>
                    <TouchableOpacity style={[styles.planExploreBtn, { backgroundColor: '#FDFCF8' }]} onPress={() => navigation.navigate('My Plans', { defaultCategory: 'Silver Schemes' })}>
                      <Text style={[styles.planExploreBtnText, { color: '#2C3E50' }]}>KNOW MORE →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Card 6: Silver Wallet */}
                <View style={styles.carouselItem}>
                  <View style={[styles.planCard, { backgroundColor: '#E7ECEF' }]}>
                    <Image source={require('../../../assets/silver_wallet_bg.jpg')} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 16 }} />
                    <Image source={require('../../../assets/custom_silver_coin.jpg')} style={{ position: 'absolute', right: -20, bottom: -20, width: 150, height: 150, borderRadius: 75, opacity: 0.8 }} />
                    <Text style={[styles.planCardLogo, { color: '#2C3E50' }]}>Digital</Text>
                    <Text style={[styles.planCardLogoBold, { color: '#2C3E50' }]}>Silver Wallet</Text>
                    <Text style={[styles.planCardSubtitle, { color: '#4A5056' }]}>Balance: {lockerData?.silverBalance?.toFixed(3) || '0.000'} g</Text>
                    <TouchableOpacity style={[styles.planExploreBtn, { backgroundColor: '#FDFCF8' }]} onPress={() => navigation.navigate('Digi Silver')}>
                      <Text style={[styles.planExploreBtnText, { color: '#2C3E50' }]}>BUY SILVER →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

            </View>



          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topYellowBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: colors.gold,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  menuIcon: {
    padding: 5,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#D4AF37',
  },
  ratesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 8,
  },
  rateCard: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  rateTitle: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#333',
    textAlign: 'right',
    marginBottom: 4,
  },
  rateContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  coinIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#D4AF37',
  },
  rateSubtitle: {
    fontSize: 9,
    fontFamily: 'serif',
    color: '#666',
    marginTop: 2,
  },
  updateText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 13,
    marginTop: 10,
    fontWeight: '500',
  },
  tradingHoursBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  tradingHoursText: {
    fontSize: 13,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  schemesContainer: {
    marginTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#333',
    alignSelf: 'flex-start',
    marginLeft: 25,
    marginBottom: 15,
  },
  carouselItem: {
    width: width,
    alignItems: 'center',
    paddingVertical: 10,
  },
  planCard: {
    width: width * 0.85,
    borderRadius: 20,
    padding: 18,
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  planCardLogo: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    letterSpacing: 2,
    marginBottom: 2,
  },
  planCardLogoBold: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  planCardSubtitle: {
    color: '#E0E0E0',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'sans-serif',
    marginBottom: 18,
    maxWidth: '80%',
  },
  planExploreBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  planExploreBtnText: {
    color: '#4A3424',
    fontWeight: 'bold',
    fontSize: 10,
  },
  rateCardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  premiumCoinStyle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  savingsCardContainer: {
    alignSelf: 'center',
    width: width - 30,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  savingsGradient: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  savingsBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    resizeMode: 'cover',
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  savingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#FFF',
  },
  savingsSubtitle: {
    fontSize: 9,
    color: '#E0E0E0',
    marginTop: 2,
  },
  savingsBalances: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savingsBalanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  savingsCoin: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  savingsBalanceLabel: {
    fontSize: 9,
    color: '#E0E0E0',
    marginBottom: 2,
  },
  savingsBalanceValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  savingsDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 15,
  },
});

export default HomeScreen;

