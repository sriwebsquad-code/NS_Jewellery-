import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, RefreshControl, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Menu, Crown, Coins, BellRing, Clock } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
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

  const goldCarouselRef = useRef<ScrollView>(null);
  const silverCarouselRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      const API_URL = 'https://ns-jewellery.onrender.com';
      const res = await fetch(`${API_URL}/api/digital/locker`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLockerData(data.data.locker);
        setRates(data.data.currentRates || { goldRate: 7250, silverRate: 85, createdAt: new Date() });
        setInstallments(data.data.installments || []);
      }
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const updatedDate = new Date(rates.effectiveDate || rates.createdAt || new Date()).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  });

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Top Yellow Background (Banner) */}
      <View style={[styles.topYellowBg, { backgroundColor: mode === 'dark' ? '#3A3633' : colors.gold, overflow: 'hidden' }]}>
        <Image source={{ uri: 'https://img.icons8.com/color/150/gold-coin.png' }} style={{ position: 'absolute', top: 40, left: -20, opacity: 0.3, width: 120, height: 120, transform: [{ rotate: '15deg' }] }} />
        <Image source={{ uri: 'https://img.icons8.com/color/150/silver-coin.png' }} style={{ position: 'absolute', top: 100, right: -20, opacity: 0.3, width: 100, height: 100, transform: [{ rotate: '-15deg' }] }} />
      </View>

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuIcon}>
          <Menu color={mode === 'dark' ? colors.gold : '#6B4E3D'} size={32} />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/rn_logo.png')} 
            style={{ width: 35, height: 35, resizeMode: 'contain', marginRight: 8 }} 
          />
          <Text style={[styles.logoText, { color: mode === 'dark' ? colors.gold : '#6B4E3D', fontWeight: 'bold' }]}>NS MAHAVEER JEWELLERY</Text>
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.menuIcon}>
          <BellRing color={mode === 'dark' ? colors.gold : '#6B4E3D'} size={28} />
          {/* Unread badge indicator */}
          <View style={{ position: 'absolute', right: 4, top: 4, width: 10, height: 10, backgroundColor: 'red', borderRadius: 5, borderWidth: 1, borderColor: colors.background }} />
        </TouchableOpacity>
      </View>
      <View style={[styles.ratesRow, { marginTop: 10, paddingBottom: 10 }]}>
        {/* Gold Rate Card */}
        <View style={[styles.rateCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: mode === 'dark' ? 1 : 0 }]}>
          <Text style={[styles.rateTitle, { color: '#C89F7A' }]}>Gold Rate</Text>
          <View style={styles.rateContent}>
            <Image source={require('../../../assets/gold_coin.png')} style={{ width: 44, height: 44, resizeMode: 'contain' }} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.rateValue, { color: '#C89F7A' }]}>₹{rates.goldRate}</Text>
              <Text style={[styles.rateSubtitle, { color: colors.textMuted }]}>22KT Per gram</Text>
            </View>
          </View>
        </View>

        {/* Silver Rate Card */}
        <View style={[styles.rateCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: mode === 'dark' ? 1 : 0 }]}>
          <Text style={[styles.rateTitle, { color: '#8C92AC' }]}>Silver Rate</Text>
          <View style={styles.rateContent}>
            <Image source={require('../../../assets/silver_coin.png')} style={{ width: 44, height: 44, resizeMode: 'contain' }} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.rateValue, { color: '#8C92AC' }]}>₹{rates.silverRate}</Text>
              <Text style={[styles.rateSubtitle, { color: colors.textMuted }]}>Per gram</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={[styles.updateText, { color: mode === 'dark' ? colors.gold : '#6B4E3D', marginBottom: 15 }]}>Rate updated on {updatedDate}</Text>
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
              
              <View style={{ width: '100%', paddingHorizontal: 25, marginBottom: 15 }}>
                <Text style={[styles.sectionHeading, { color: colors.text, marginLeft: 0, marginBottom: 5 }]}>Exclusive Offerings</Text>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>Benefit from our 4 unique schemes designed for your savings.</Text>
              </View>

              <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 5 }]}>Gold Plans</Text>

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
                  <View style={[styles.maroonCard, { backgroundColor: '#C89F7A', overflow: 'hidden' }]}>
                    <Image source={require('../../../assets/gold_coin.png')} style={{ position: 'absolute', right: -10, bottom: -10, width: 140, height: 140, opacity: 0.25, resizeMode: 'contain' }} />
                    <View style={styles.cardTopRight}>
                      <Image source={require('../../../assets/rn_logo.png')} style={{ width: 24, height: 24, borderRadius: 12, resizeMode: 'cover', marginRight: 6 }} />
                      <Text style={[styles.cardLogoText, { color: '#6B4E3D' }]}>NS MAHAVEER JEWELLERY</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardMainTitle, { color: '#6B4E3D' }]}>11 Month</Text>
                      <Text style={[styles.cardMainTitle, { color: '#6B4E3D' }]}>Gold Scheme</Text>
                      <Text style={[styles.cardHighlight, { color: '#6B4E3D' }]} numberOfLines={2}>Save cash, buy gold at end</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: colors.background }]} onPress={() => navigation.navigate('My Plans', { defaultCategory: 'Gold Schemes' })}>
                    <Text style={[styles.exploreBtnText, { color: colors.text }]}>EXPLORE PLAN</Text>
                  </TouchableOpacity>
                </View>

                {/* Card 2: Gold 11 Scheme */}
                <View style={styles.carouselItem}>
                  <View style={[styles.maroonCard, { backgroundColor: '#C89F7A', overflow: 'hidden' }]}>
                    <Image source={require('../../../assets/gold_coin.png')} style={{ position: 'absolute', right: -10, bottom: -10, width: 140, height: 140, opacity: 0.25, resizeMode: 'contain' }} />
                    <View style={styles.cardTopRight}>
                      <Image source={require('../../../assets/rn_logo.png')} style={{ width: 24, height: 24, borderRadius: 12, resizeMode: 'cover', marginRight: 6 }} />
                      <Text style={[styles.cardLogoText, { color: '#6B4E3D' }]}>NS MAHAVEER JEWELLERY</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardMainTitle, { color: '#6B4E3D' }]}>Gold 11</Text>
                      <Text style={[styles.cardMainTitle, { color: '#6B4E3D' }]}>Scheme</Text>
                      <Text style={[styles.cardHighlight, { color: '#6B4E3D' }]} numberOfLines={2}>Instant monthly gold weight</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: colors.background }]} onPress={() => navigation.navigate('My Plans', { defaultCategory: 'Gold Schemes' })}>
                    <Text style={[styles.exploreBtnText, { color: colors.text }]}>EXPLORE PLAN</Text>
                  </TouchableOpacity>
                </View>

                {/* Card 3: Gold Wallet */}
                <View style={styles.carouselItem}>
                  <View style={[styles.maroonCard, { backgroundColor: '#C89F7A', overflow: 'hidden' }]}>
                    <Image source={require('../../../assets/gold_coin.png')} style={{ position: 'absolute', right: -10, bottom: -10, width: 140, height: 140, opacity: 0.25, resizeMode: 'contain' }} />
                    <View style={styles.cardTopRight}>
                      <Image source={require('../../../assets/rn_logo.png')} style={{ width: 24, height: 24, borderRadius: 12, resizeMode: 'cover', marginRight: 6 }} />
                      <Text style={[styles.cardLogoText, { color: '#6B4E3D' }]}>NS MAHAVEER JEWELLERY</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardMainTitle, { color: '#6B4E3D' }]}>Digital</Text>
                      <Text style={[styles.cardMainTitle, { color: '#6B4E3D' }]}>Gold Wallet</Text>
                      <Text style={[styles.cardHighlight, { color: '#6B4E3D' }]} numberOfLines={2}>Balance: {lockerData?.goldBalance.toFixed(3) || '0.000'} g</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: colors.background }]} onPress={() => navigation.navigate('Digi Gold')}>
                    <Text style={[styles.exploreBtnText, { color: colors.text }]}>BUY GOLD</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <Text style={[styles.sectionHeading, { marginTop: 20, color: colors.text }]}>Silver Plans</Text>

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
                  <View style={[styles.maroonCard, { backgroundColor: '#E0E0E0', overflow: 'hidden' }]}>
                    <Image source={require('../../../assets/silver_coin.png')} style={{ position: 'absolute', right: -10, bottom: -10, width: 140, height: 140, opacity: 0.25, resizeMode: 'contain' }} />
                    <View style={styles.cardTopRight}>
                      <Image source={require('../../../assets/rn_logo.png')} style={{ width: 24, height: 24, borderRadius: 12, resizeMode: 'cover', marginRight: 6 }} />
                      <Text style={[styles.cardLogoText, { color: '#2C3E50' }]}>NS MAHAVEER JEWELLERY</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardMainTitle, { color: '#2C3E50' }]}>11 Month</Text>
                      <Text style={[styles.cardMainTitle, { color: '#2C3E50' }]}>Silver Scheme</Text>
                      <Text style={[styles.cardHighlight, { color: '#2C3E50' }]} numberOfLines={2}>Save cash, buy silver at end</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: colors.background }]} onPress={() => navigation.navigate('My Plans', { defaultCategory: 'Silver Schemes' })}>
                    <Text style={[styles.exploreBtnText, { color: colors.text }]}>EXPLORE PLAN</Text>
                  </TouchableOpacity>
                </View>

                {/* Card 5: Silver 11 Scheme */}
                <View style={styles.carouselItem}>
                  <View style={[styles.maroonCard, { backgroundColor: '#E0E0E0', overflow: 'hidden' }]}>
                    <Image source={require('../../../assets/silver_coin.png')} style={{ position: 'absolute', right: -10, bottom: -10, width: 140, height: 140, opacity: 0.25, resizeMode: 'contain' }} />
                    <View style={styles.cardTopRight}>
                      <Image source={require('../../../assets/rn_logo.png')} style={{ width: 24, height: 24, borderRadius: 12, resizeMode: 'cover', marginRight: 6 }} />
                      <Text style={[styles.cardLogoText, { color: '#2C3E50' }]}>NS MAHAVEER JEWELLERY</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardMainTitle, { color: '#2C3E50' }]}>Silver 11</Text>
                      <Text style={[styles.cardMainTitle, { color: '#2C3E50' }]}>Scheme</Text>
                      <Text style={[styles.cardHighlight, { color: '#2C3E50' }]} numberOfLines={2}>Instant monthly silver weight</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: colors.background }]} onPress={() => navigation.navigate('My Plans', { defaultCategory: 'Silver Schemes' })}>
                    <Text style={[styles.exploreBtnText, { color: colors.text }]}>EXPLORE PLAN</Text>
                  </TouchableOpacity>
                </View>

                {/* Card 6: Silver Wallet */}
                <View style={styles.carouselItem}>
                  <View style={[styles.maroonCard, { backgroundColor: '#E0E0E0', overflow: 'hidden' }]}>
                    <Image source={require('../../../assets/silver_coin.png')} style={{ position: 'absolute', right: -10, bottom: -10, width: 140, height: 140, opacity: 0.25, resizeMode: 'contain' }} />
                    <View style={styles.cardTopRight}>
                      <Image source={require('../../../assets/rn_logo.png')} style={{ width: 24, height: 24, borderRadius: 12, resizeMode: 'cover', marginRight: 6 }} />
                      <Text style={[styles.cardLogoText, { color: '#2C3E50' }]}>NS MAHAVEER JEWELLERY</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardMainTitle, { color: '#2C3E50' }]}>Digital</Text>
                      <Text style={[styles.cardMainTitle, { color: '#2C3E50' }]}>Silver Wallet</Text>
                      <Text style={[styles.cardHighlight, { color: '#2C3E50' }]} numberOfLines={2}>Balance: {lockerData?.silverBalance.toFixed(3) || '0.000'} g</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: colors.background }]} onPress={() => navigation.navigate('Digi Silver')}>
                    <Text style={[styles.exploreBtnText, { color: colors.text }]}>BUY SILVER</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

            </View>



          </>
        )}
      </ScrollView>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#6B4E3D',
  },
  ratesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 35,
  },
  rateCard: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#333',
    textAlign: 'right',
    marginBottom: 20,
  },
  rateContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  coinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#6B4E3D',
  },
  rateSubtitle: {
    fontSize: 12,
    fontFamily: 'serif',
    color: '#666',
    marginTop: 4,
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
  maroonCard: {
    backgroundColor: '#6B4E3D',
    width: width * 0.9,
    borderRadius: 20,
    padding: 25,
    minHeight: 180,
    shadowColor: '#6B4E3D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  cardLogoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontFamily: 'serif',
    fontSize: 16,
  },
  cardContent: {
    marginTop: 10,
  },
  cardMainTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    flexWrap: 'wrap',
  },
  cardHighlight: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
  },
  exploreBtn: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: -25, // Overlap the card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  exploreBtnText: {
    color: '#6B4E3D',
    fontWeight: '900',
    fontSize: 14,
  }
});

export default HomeScreen;

