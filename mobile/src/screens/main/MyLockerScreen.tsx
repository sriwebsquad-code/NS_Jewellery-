import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Menu, TrendingUp, ChevronDown, CheckCircle2, Circle, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { ENV } from '../../config/env';

const MyLockerScreen = () => {
  const navigation = useNavigation<any>();
  const { token, user } = useAuthStore() as any;
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  
  const [activeTab, setActiveTab] = useState<'COINS' | 'PLANS'>('COINS');
  const [loading, setLoading] = useState(true);
  const [lockerData, setLockerData] = useState<any>(null);
  const [userPlans, setUserPlans] = useState<any[]>([]);
  
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const [lockerRes, plansRes] = await Promise.all([
        fetch(`${ENV.API_URL}/digital/locker?t=${timestamp}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
        }),
        fetch(`${ENV.API_URL}/plans/my-plans?t=${timestamp}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
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
    <SafeAreaView style={[styles.container, { backgroundColor: mode === 'dark' ? colors.backgroundSecondary : '#FDFCF8' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: mode === 'dark' ? colors.background : '#FDFCF8', borderBottomColor: mode === 'dark' ? colors.border : '#EAEAEA' }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color={mode === 'dark' ? colors.text : '#4A3424'} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: mode === 'dark' ? colors.text : '#4A3424' }]}>My Savings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: mode === 'dark' ? colors.cardBackground : '#F3E5D8', borderColor: mode === 'dark' ? colors.border : '#F3E5D8', borderRadius: 25, padding: 4 }]}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'COINS' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('COINS')}
          >
            <Text style={[styles.tabText, activeTab === 'COINS' && styles.activeTabText]}>Digi Coins</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'PLANS' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('PLANS')}
          >
            <Text style={[styles.tabText, activeTab === 'PLANS' && styles.activeTabText]}>Schemes</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ padding: 40 }}>
            <ActivityIndicator size="large" color="#6D4C41" />
          </View>
        ) : (
          <View style={styles.tabContent}>
            {activeTab === 'COINS' ? (
              <View style={{ gap: 15 }}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('TransactionsScreen', { type: 'DIGITAL_GOLD', title: 'Digital Gold' })}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#C89F7A', '#A87B4C', '#6A4C25']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.balanceCardGradient}
                  >
                    <View style={styles.balanceCardContent}>
                      <Image source={require('../../../assets/premium_gold_coin_rupee.jpg')} style={styles.balanceCoinImage} />
                      <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.balanceLabel}>Gold Balance</Text>
                        <Text style={styles.balanceValue}>{goldBalance.toFixed(3)} Grams</Text>
                      </View>
                      <ChevronRight size={24} color="#FFF" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => navigation.navigate('TransactionsScreen', { type: 'DIGITAL_SILVER', title: 'Digital Silver' })}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#B0B5B9', '#8C92AC', '#5C6370']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.balanceCardGradient}
                  >
                    <View style={styles.balanceCardContent}>
                      <Image source={require('../../../assets/premium_silver_coin_rupee.jpg')} style={styles.balanceCoinImage} />
                      <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.balanceLabel}>Silver Balance</Text>
                        <Text style={styles.balanceValue}>{silverBalance.toFixed(3)} Grams</Text>
                      </View>
                      <ChevronRight size={24} color="#FFF" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {userPlans.length > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 15 }}>
                    <TouchableOpacity 
                      onPress={() => setShowFilterModal(true)}
                      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: mode === 'dark' ? colors.cardBackground : '#FFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: mode === 'dark' ? colors.border : '#EAEAEA', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }}
                    >
                      <Text style={{ color: mode === 'dark' ? colors.text : '#333', marginRight: 6, fontWeight: '500' }}>{filterStatus}</Text>
                      <ChevronDown size={16} color={mode === 'dark' ? colors.text : '#333'} />
                    </TouchableOpacity>
                  </View>
                )}
                {(() => {
                  const filteredPlans = filterStatus === 'All' 
                    ? userPlans 
                    : userPlans.filter(p => p.status?.toUpperCase() === filterStatus.toUpperCase());
                  
                  if (filteredPlans.length === 0) {
                    return (
                      <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                          {filterStatus === 'All' ? 'You are not enrolled in any plans.' : `No ${filterStatus.toLowerCase()} plans found.`}
                        </Text>
                        {filterStatus === 'All' && (
                          <TouchableOpacity 
                            style={styles.exploreBtn}
                            onPress={() => navigation.navigate('MainTab', { screen: 'My Plans' })}
                          >
                            <Text style={styles.exploreBtnText}>Explore Plans</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  }

                  const renderPlanCard = (up: any) => {
                    const isValueBased = up.plan?.schemeType === 'VALUE_BASED';
                    return (
                      <View key={up.id} style={[styles.newSchemeCard, { backgroundColor: mode === 'dark' ? colors.cardBackground : '#FFF', borderColor: mode === 'dark' ? colors.border : '#EAEAEA' }]}>
                        <TouchableOpacity 
                          onPress={() => navigation.navigate('TransactionsScreen', { type: 'PLAN', planId: up.id, title: up.plan?.name || 'Scheme', accumulatedWeight: up.accumulatedWeight || up.totalWeight || 0, totalPaid: up.totalPaid || 0, metalType: up.metalType || (up.plan?.name?.toUpperCase().includes('GOLD') ? 'GOLD' : 'SILVER'), schemeType: up.plan?.schemeType, monthlyAmount: up.monthlyAmount, createdAt: up.createdAt, basePlanId: up.plan?.id, status: up.status })}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.newSchemeTitle, { color: mode === 'dark' ? colors.text : '#333' }]}>{up.plan?.name}</Text>
                          
                          <View style={styles.newSchemeSubHeader}>
                            <Text style={[styles.newSchemeSavedText, { color: mode === 'dark' ? colors.textMuted : '#555' }]}>
                              {isValueBased ? `₹${up.totalPaid} saved` : `₹${up.totalPaid} paid`}
                            </Text>
                            {!isValueBased && (
                              <Text style={styles.newSchemeWeightText}>
                                {((up.accumulatedWeight || up.totalWeight || 0).toFixed(3))} Grams {up.plan?.name?.toUpperCase().includes('SILVER') ? 'Silver' : 'Gold'}
                              </Text>
                            )}
                          </View>
                          
                          <View style={[styles.newSchemeInstallmentBox, { backgroundColor: mode === 'dark' ? '#333' : '#F9F9F9' }]}>
                            <Text style={[styles.newSchemeInstallmentLabel, { color: mode === 'dark' ? colors.textMuted : '#555' }]}>Next installment:</Text>
                            <Text style={[styles.newSchemeInstallmentValue, { color: mode === 'dark' ? colors.text : '#333' }]}>₹{up.monthlyAmount || (up.completedMonths > 0 ? Math.round(up.totalPaid / up.completedMonths) : 0)}</Text>
                          </View>
                        </TouchableOpacity>

                        {up.status === 'ACTIVE' && (
                          <View style={styles.newSchemeActionRow}>
                            <View style={styles.paymentDueBadge}>
                              <Text style={styles.paymentDueText}>PAYMENT DUE</Text>
                            </View>
                            <TouchableOpacity 
                              style={styles.newPayBtn}
                              onPress={() => navigation.navigate('MainTab', { screen: 'My Plans', params: { enrollmentId: up.id, defaultCategory: up.plan?.name?.toUpperCase().includes('GOLD') ? 'Gold Schemes' : 'Silver Schemes', defaultPlanId: up.plan?.id, defaultAmount: (up.monthlyAmount || (up.completedMonths > 0 ? Math.round(up.totalPaid / up.completedMonths) : 0)).toString() } })}
                            >
                              <Text style={styles.newPayBtnText}>Pay Monthly Installment</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  };

                  const goldPlans = filteredPlans.filter((up: any) => {
                    const metal = up.metalType || (up.plan?.name?.toUpperCase().includes('GOLD') ? 'GOLD' : 'SILVER');
                    return metal === 'GOLD';
                  });

                  const silverPlans = filteredPlans.filter((up: any) => {
                    const metal = up.metalType || (up.plan?.name?.toUpperCase().includes('GOLD') ? 'GOLD' : 'SILVER');
                    return metal === 'SILVER';
                  });

                  return (
                    <View>
                      {goldPlans.length > 0 && (
                        <View style={{ marginBottom: silverPlans.length > 0 ? 20 : 0 }}>
                          <Text style={[styles.sectionHeading, { color: mode === 'dark' ? colors.text : '#333', textTransform: 'uppercase' }]}>Gold Schemes</Text>
                          {goldPlans.map(renderPlanCard)}
                        </View>
                      )}
                      
                      {silverPlans.length > 0 && (
                        <View>
                          <Text style={[styles.sectionHeading, { color: mode === 'dark' ? colors.text : '#333', textTransform: 'uppercase' }]}>Silver Schemes</Text>
                          {silverPlans.map(renderPlanCard)}
                        </View>
                      )}
                    </View>
                  );
                })()}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                {['All', 'Active', 'Completed', 'Cancelled'].map((status, index, arr) => (
                  <TouchableOpacity 
                    key={status}
                    style={[styles.modalOption, index !== arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                    onPress={() => {
                      setFilterStatus(status);
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, { color: colors.text }]}>{status}</Text>
                    {filterStatus === status ? (
                       <CheckCircle2 color="#4285F4" size={24} />
                    ) : (
                       <Circle color={colors.textMuted} size={24} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
  },
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
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 12,
    marginLeft: 4,
  },
  balanceCardGradient: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
  balanceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceCoinImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
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
  },
  payInstallmentBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  payInstallmentBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  modalOptionText: {
    fontSize: 18,
    fontWeight: '500',
  },
  newSchemeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newSchemeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  newSchemeSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  newSchemeSavedText: {
    fontSize: 14,
    fontFamily: 'sans-serif',
  },
  newSchemeWeightText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  newSchemeInstallmentBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  newSchemeInstallmentLabel: {
    fontSize: 13,
  },
  newSchemeInstallmentValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  newSchemeActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDueBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  paymentDueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#B8860B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newPayBtn: {
    backgroundColor: '#D4B855',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
  },
  newPayBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default MyLockerScreen;
