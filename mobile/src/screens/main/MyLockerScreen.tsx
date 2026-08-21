import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Menu, ArrowRight, TrendingUp, ChevronDown, CheckCircle2, Circle } from 'lucide-react-native';
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
  
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Locker</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
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
              <View style={styles.gridContainer}>
                <TouchableOpacity 
                  style={[styles.gridBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('TransactionsScreen', { type: 'DIGITAL_GOLD', title: 'Digital Gold' })}
                >
                  <Text style={[styles.gridTitle, { color: colors.text }]}>Gold</Text>
                  <Text style={[styles.gridValue, { color: '#8D6E63' }]}>{goldBalance.toFixed(3)}g</Text>
                  <Text style={[styles.gridSubtext, { color: colors.textMuted }]}>if click Give transaction history</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.gridBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('TransactionsScreen', { type: 'DIGITAL_SILVER', title: 'Digital Silver' })}
                >
                  <Text style={[styles.gridTitle, { color: colors.text }]}>Silver</Text>
                  <Text style={[styles.gridValue, { color: '#8D6E63' }]}>{silverBalance.toFixed(3)}g</Text>
                  <Text style={[styles.gridSubtext, { color: colors.textMuted }]}>if click Give transaction history</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {userPlans.length > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 15 }}>
                    <TouchableOpacity 
                      onPress={() => setShowFilterModal(true)}
                      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBackground, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text style={{ color: colors.text, marginRight: 6, fontWeight: '500' }}>{filterStatus}</Text>
                      <ChevronDown size={16} color={colors.text} />
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

                  return filteredPlans.map((up) => {
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
                            <Text style={[styles.assetValue, { color: '#8D6E63' }]}>Rs.{up.totalPaid}</Text>
                          ) : (
                            <Text style={[styles.assetValue, { color: '#8D6E63' }]}>{((up.totalWeight || 0).toFixed(3))}g</Text>
                          )}
                          <ArrowRight size={16} color={colors.textMuted} />
                        </View>
                      </TouchableOpacity>
                    );
                  });
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
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridBox: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gridValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gridSubtext: {
    fontSize: 10,
    textAlign: 'center',
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
  }
});

export default MyLockerScreen;
