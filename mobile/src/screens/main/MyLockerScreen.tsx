import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Menu, ArrowRight, TrendingUp } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const MyLockerScreen = () => {
  const navigation = useNavigation<any>();
  const { token, user } = useAuthStore() as any;
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  
  const [activeTab, setActiveTab] = useState<'COINS' | 'PLANS'>('COINS');
  const [loading, setLoading] = useState(true);
  const [lockerData, setLockerData] = useState<any>(null);
  const [userPlans, setUserPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lockerRes, plansRes] = await Promise.all([
        fetch('https://ns-jewellery.onrender.com/api/digital/locker-dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://ns-jewellery.onrender.com/api/plans/my-plans', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const lockerData = await lockerRes.json();
      const plansData = await plansRes.json();

      if (lockerData.success) {
        setLockerData(lockerData.data);
      }
      if (plansData.success) {
        setUserPlans(plansData.data);
      }
    } catch (error) {
      console.error('Error fetching locker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const goldBalance = lockerData?.locker?.goldBalance || 0;
  const silverBalance = lockerData?.locker?.silverBalance || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Digital Locker</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Wealth Card */}
        <View style={styles.wealthCard}>
          <Text style={styles.wealthTitle}>Total Wealth Accumulated</Text>
          <View style={styles.wealthContent}>
            <View style={styles.wealthItem}>
              <View style={styles.coinIcon}>
                <Image source={require('../../assets/gold_coin.png')} style={{width: 30, height: 30}} />
              </View>
              <Text style={styles.metalLabel}>24K Gold</Text>
              <Text style={styles.metalWeight}>{goldBalance.toFixed(3)}g</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.wealthItem}>
              <View style={styles.coinIcon}>
                <Image source={require('../../assets/silver_coin.png')} style={{width: 30, height: 30}} />
              </View>
              <Text style={styles.metalLabel}>999 Silver</Text>
              <Text style={styles.metalWeight}>{silverBalance.toFixed(3)}g</Text>
            </View>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'COINS' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('COINS')}
          >
            <Text style={[styles.tabText, activeTab === 'COINS' && styles.activeTabText]}>Digital Coins</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'PLANS' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('PLANS')}
          >
            <Text style={[styles.tabText, activeTab === 'PLANS' && styles.activeTabText]}>Jewellery Plans</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ padding: 40 }}>
            <ActivityIndicator size="large" color="#6D4C41" />
          </View>
        ) : (
          <View style={styles.tabContent}>
            {activeTab === 'COINS' ? (
              <View>
                <TouchableOpacity 
                  style={[styles.assetCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('TransactionsScreen', { type: 'DIGITAL_GOLD', title: 'Digital Gold' })}
                >
                  <View style={styles.assetLeft}>
                    <View style={styles.assetIconWrapper}>
                      <TrendingUp size={20} color="#F5B041" />
                    </View>
                    <View>
                      <Text style={[styles.assetName, { color: colors.text }]}>Digital Gold</Text>
                      <Text style={[styles.assetDate, { color: colors.textMuted }]}>View History</Text>
                    </View>
                  </View>
                  <View style={styles.assetRight}>
                    <Text style={[styles.assetValue, { color: '#8D6E63' }]}>+{goldBalance.toFixed(3)}g</Text>
                    <ArrowRight size={16} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.assetCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('TransactionsScreen', { type: 'DIGITAL_SILVER', title: 'Digital Silver' })}
                >
                  <View style={styles.assetLeft}>
                    <View style={styles.assetIconWrapper}>
                      <TrendingUp size={20} color="#BDC3C7" />
                    </View>
                    <View>
                      <Text style={[styles.assetName, { color: colors.text }]}>Digital Silver</Text>
                      <Text style={[styles.assetDate, { color: colors.textMuted }]}>View History</Text>
                    </View>
                  </View>
                  <View style={styles.assetRight}>
                    <Text style={[styles.assetValue, { color: '#8D6E63' }]}>+{silverBalance.toFixed(3)}g</Text>
                    <ArrowRight size={16} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {userPlans.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>You are not enrolled in any plans.</Text>
                    <TouchableOpacity 
                      style={styles.exploreBtn}
                      onPress={() => navigation.navigate('MainTab', { screen: 'My Plans' })}
                    >
                      <Text style={styles.exploreBtnText}>Explore Plans</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  userPlans.map((up) => {
                    const isValueBased = up.plan?.schemeType === 'VALUE_BASED';
                    return (
                      <TouchableOpacity 
                        key={up.id} 
                        style={[styles.assetCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('TransactionsScreen', { type: 'PLAN', planId: up.id, title: up.plan?.name || 'Scheme' })}
                      >
                        <View style={styles.assetLeft}>
                          <View style={styles.assetIconWrapper}>
                            <TrendingUp size={20} color={isValueBased ? "#48C9B0" : "#F5B041"} />
                          </View>
                          <View>
                            <Text style={[styles.assetName, { color: colors.text }]}>{up.plan?.name}</Text>
                            <Text style={[styles.assetDate, { color: colors.textMuted }]}>View Installments</Text>
                          </View>
                        </View>
                        <View style={styles.assetRight}>
                          {isValueBased ? (
                            <Text style={[styles.assetValue, { color: '#8D6E63' }]}>₹{up.totalPaid}</Text>
                          ) : (
                            <Text style={[styles.assetValue, { color: '#8D6E63' }]}>{((up.totalWeight || 0).toFixed(3))}g</Text>
                          )}
                          <ArrowRight size={16} color={colors.textMuted} />
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  content: { padding: 20 },
  wealthCard: {
    backgroundColor: '#6D4C41',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  wealthTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  wealthContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  wealthItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  coinIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metalLabel: {
    color: '#E0E0E0',
    fontSize: 12,
    marginBottom: 4,
  },
  metalWeight: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: '#6D4C41',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6D4C41',
  },
  activeTabText: {
    color: '#FFF',
  },
  tabContent: {
    flex: 1,
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9EBEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  assetName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  assetDate: {
    fontSize: 12,
  },
  assetRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  exploreBtn: {
    backgroundColor: '#6D4C41',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});

export default MyLockerScreen;
