import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, ShoppingBag, Gift } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const WalletScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const metalType = route.params?.metalType || 'GOLD'; // 'GOLD' or 'SILVER'
  
  const { token } = useAuthStore();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(false);
  const [lockerData, setLockerData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const isGold = metalType === 'GOLD';
  const themeColor = isGold ? '#D4AF37' : '#C0C0C0';
  const bgColor = isGold ? 'rgba(212, 175, 55, 0.05)' : 'rgba(192, 192, 192, 0.05)';

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const API_URL = 'http://10.115.217.171:5000';
      const res = await fetch(`${API_URL}/api/digital/locker`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLockerData(data.data.locker);
        setTransactions(data.data.transactions.filter((t: any) => t.metalType === metalType));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const balance = isGold ? lockerData?.goldBalance : lockerData?.silverBalance;
  const invested = isGold ? lockerData?.totalInvestedGold : lockerData?.totalInvestedSilver;
  const currentValue = isGold ? lockerData?.currentGoldValue : lockerData?.currentSilverValue;
  const profitLoss = isGold ? lockerData?.goldProfitLoss : lockerData?.silverProfitLoss;
  const isProfit = profitLoss >= 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColor }]}>{metalType} WALLET</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchWallet} tintColor={themeColor} />}>
        {/* Main Balance Card */}
        <View style={[styles.mainCard, { borderColor: themeColor, backgroundColor: mode === 'dark' ? bgColor : colors.cardBackground }]}>
          <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Total {metalType} Owned</Text>
          <Text style={[styles.balanceValue, { color: colors.text }]}>{balance?.toFixed(3) || '0.000'} <Text style={[styles.unit, { color: colors.text }]}>g</Text></Text>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Investment</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>₹{(invested || 0).toLocaleString('en-IN', {maximumFractionDigits:0})}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Current Value</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>₹{(currentValue || 0).toLocaleString('en-IN', {maximumFractionDigits:0})}</Text>
            </View>
          </View>

          <View style={[styles.profitBox, { backgroundColor: isProfit ? 'rgba(50,205,50,0.1)' : 'rgba(255,69,0,0.1)' }]}>
            <Text style={styles.profitLabel}>{isProfit ? 'Overall Profit' : 'Overall Loss'}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {isProfit ? <ArrowUpRight color="#32CD32" size={20} /> : <ArrowDownRight color="#FF4500" size={20} />}
              <Text style={[styles.profitValue, { color: isProfit ? '#32CD32' : '#FF4500' }]}>
                {isProfit ? '+' : ''}₹{Math.abs(profitLoss || 0).toLocaleString('en-IN', {maximumFractionDigits:0})}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: themeColor }]} onPress={() => navigation.navigate(isGold ? 'Digi Gold' : 'Digi Silver')}>
            <ShoppingBag color={isGold ? '#000' : '#FFF'} size={20} />
            <Text style={[styles.actionBtnText, { color: isGold ? '#000' : '#FFF' }]}>Buy More</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: themeColor }]} onPress={() => {}}>
            <Gift color={themeColor} size={20} />
            <Text style={[styles.actionBtnText, { color: themeColor }]}>Redeem to Jewellery</Text>
          </TouchableOpacity>
        </View>

        {/* Purchase History */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Purchase History</Text>
        <View style={styles.historyContainer}>
          {transactions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No purchases yet.</Text>
          ) : (
            transactions.map((tx, idx) => (
              <View key={idx} style={[styles.txCard, { backgroundColor: colors.cardBackground, shadowColor: mode === 'dark' ? '#000' : COLORS.black }]}>
                <View style={styles.txLeft}>
                  <Text style={[styles.txType, { color: colors.text }]}>{tx.type}</Text>
                  <Text style={[styles.txDate, { color: colors.textMuted }]}>{new Date(tx.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</Text>
                  <Text style={[styles.txId, { color: colors.textMuted }]}>ID: {tx.transactionId?.substring(0,8)}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: colors.text }]}>₹{tx.amount.toLocaleString('en-IN')}</Text>
                  <Text style={[styles.txWeight, { color: themeColor }]}>+{tx.weight.toFixed(3)}g</Text>
                  <Text style={[styles.txStatus, { color: tx.status === 'SUCCESS' ? '#32CD32' : colors.textMuted }]}>{tx.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>
        <View style={{height: 50}}/>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F11' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '900', fontFamily: 'serif' },
  mainCard: { margin: 20, borderRadius: 20, padding: 25, borderWidth: 1 },
  balanceLabel: { color: '#AAB7B8', fontSize: 16, marginBottom: 10, textAlign: 'center' },
  balanceValue: { color: '#FFF', fontSize: 42, fontWeight: 'bold', textAlign: 'center', fontFamily: 'serif' },
  unit: { fontSize: 24, color: '#AAB7B8', fontWeight: 'normal' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { alignItems: 'center', flex: 1 },
  statLabel: { color: '#AAB7B8', fontSize: 13, marginBottom: 5 },
  statValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  profitBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 12 },
  profitLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  profitValue: { fontSize: 16, fontWeight: 'bold', marginLeft: 5 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 12, marginHorizontal: 5 },
  actionBtnText: { fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 15, fontFamily: 'serif' },
  historyContainer: { paddingHorizontal: 20 },
  emptyText: { color: '#AAB7B8', textAlign: 'center', marginTop: 20 },
  txCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12, marginBottom: 10 },
  txLeft: { flex: 1 },
  txType: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  txDate: { color: '#AAB7B8', fontSize: 12, marginBottom: 2 },
  txId: { color: '#777', fontSize: 10 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  txWeight: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  txStatus: { color: '#32CD32', fontSize: 10, fontWeight: 'bold' }
});

export default WalletScreen;
