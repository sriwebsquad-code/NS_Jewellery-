import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../../constants/theme';
import { Menu, Calendar, Coins, TrendingUp, Sparkles, Lock } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

const AdvanceBookingsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const [lockerData, setLockerData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DAILY' | 'PLAN'>('DAILY');

  useEffect(() => {
    fetchLockerData();
  }, []);

  const fetchLockerData = async () => {
    try {
      // Mock data to avoid hanging issues and demonstrate the UI
      setTimeout(() => {
        setLockerData({ goldBalance: 12.5, silverBalance: 250.0 });
        setTransactions([
          { metalType: 'GOLD', amount: 5000, weight: 0.68, createdAt: new Date().toISOString() },
          { metalType: 'SILVER', amount: 2000, weight: 23.5, createdAt: new Date(Date.now() - 86400000).toISOString() }
        ]);
        setInstallments([
          { amount: 1000, status: 'PAID', paidAt: new Date().toISOString(), userPlan: { plan: { name: 'Gold Plus Scheme' } } }
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch locker data:', error);
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Menu color={COLORS.black} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Digital Locker</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Lock color={COLORS.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Premium Balances Card */}
        <View style={styles.balancesCard}>
          <Sparkles color={COLORS.primary} size={50} style={{ position: 'absolute', top: -15, right: -15, opacity: 0.15 }} />
          <Text style={styles.balancesTitle}>Total Wealth Accumulated</Text>
          <View style={styles.balancesRow}>
            <View style={styles.balanceItem}>
              <View style={styles.balanceIconContainer}>
                <Coins color={COLORS.primary} size={24} />
              </View>
              <Text style={styles.balanceLabel}>24K Gold</Text>
              <Text style={styles.balanceValueGold}>
                {isLoading ? '---' : (lockerData?.goldBalance || 0).toFixed(3)}g
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <View style={[styles.balanceIconContainer, { backgroundColor: 'rgba(192,192,192,0.1)' }]}>
                <Coins color="#E5E4E2" size={24} />
              </View>
              <Text style={styles.balanceLabel}>999 Silver</Text>
              <Text style={styles.balanceValueSilver}>
                {isLoading ? '---' : (lockerData?.silverBalance || 0).toFixed(3)}g
              </Text>
            </View>
          </View>
        </View>

        {/* Premium Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'DAILY' && styles.activeTab]}
            onPress={() => setActiveTab('DAILY')}
          >
            <Text style={[styles.tabText, activeTab === 'DAILY' && styles.activeTabText]}>Digital Coins</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'PLAN' && styles.activeTab]}
            onPress={() => setActiveTab('PLAN')}
          >
            <Text style={[styles.tabText, activeTab === 'PLAN' && styles.activeTabText]}>Jewellery Plans</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : activeTab === 'DAILY' ? (
          // DAILY BUYS
          transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Coins color={COLORS.primary} size={40} />
              </View>
              <Text style={styles.emptyTitle}>No Digital Assets</Text>
              <Text style={styles.emptyText}>Start your wealth journey today.</Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Digital Coin')}
              >
                <Text style={styles.exploreButtonText}>Buy Digital Gold</Text>
              </TouchableOpacity>
            </View>
          ) : (
            transactions.map((txn, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.txnIcon}>
                  <TrendingUp color={COLORS.primary} size={20} />
                </View>
                <View style={styles.txnDetails}>
                  <Text style={styles.txnTitle}>
                    Digital {txn.metalType === 'GOLD' ? 'Gold' : 'Silver'}
                  </Text>
                  <Text style={styles.txnDate}>
                    {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.txnAmounts}>
                  <Text style={[styles.txnWeight, { color: txn.metalType === 'GOLD' ? COLORS.primary : COLORS.darkGray }]}>
                    +{txn.weight.toFixed(3)}g
                  </Text>
                  <Text style={styles.txnPrice}>₹{txn.amount.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            ))
          )
        ) : (
          // PLAN INSTALLMENTS
          installments.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Calendar color={COLORS.primary} size={40} />
              </View>
              <Text style={styles.emptyTitle}>No Active Plans</Text>
              <Text style={styles.emptyText}>Secure your future with our 11-month plan.</Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => navigation.navigate('My Plans')}
              >
                <Text style={styles.exploreButtonText}>Explore Schemes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            installments.map((inst, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.txnIcon}>
                  <Calendar color={COLORS.primary} size={20} />
                </View>
                <View style={styles.txnDetails}>
                  <Text style={styles.txnTitle}>
                    {inst.userPlan?.plan?.name || 'Jewellery Plan'}
                  </Text>
                  <Text style={styles.txnDate}>
                    Paid: {inst.paidAt ? new Date(inst.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'}
                  </Text>
                </View>
                <View style={styles.txnAmounts}>
                  <View style={[styles.statusBadge, { backgroundColor: inst.status === 'PAID' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)' }]}>
                    <Text style={[styles.txnStatus, { color: inst.status === 'PAID' ? '#27ae60' : '#e74c3c' }]}>{inst.status}</Text>
                  </View>
                  <Text style={styles.txnPrice}>₹{inst.amount.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            ))
          )
        )}
        
        <View style={{ height: 40 }} />
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
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'serif',
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  balancesCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 24,
    padding: 24,
    margin: 20,
    marginTop: 25,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
  },
  balancesTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
    opacity: 0.8,
  },
  balancesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 5,
    fontWeight: '500',
  },
  balanceValueGold: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  balanceValueSilver: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
  },
  balanceDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 6,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  emptyText: {
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 14,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: COLORS.primary,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  txnIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  txnDetails: {
    flex: 1,
  },
  txnTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  txnDate: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  txnAmounts: {
    alignItems: 'flex-end',
  },
  txnWeight: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  txnStatus: {
    fontSize: 10,
    fontWeight: '900',
  },
  txnPrice: {
    fontSize: 13,
    color: COLORS.darkGray,
    fontWeight: '600',
  }
});

export default AdvanceBookingsScreen;
