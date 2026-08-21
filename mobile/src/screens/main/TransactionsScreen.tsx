import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Clock, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const TransactionsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { type, planId, title } = route.params || {};
  const { token } = useAuthStore() as any;
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (type === 'DIGITAL_GOLD' || type === 'DIGITAL_SILVER') {
        const metal = type === 'DIGITAL_GOLD' ? 'GOLD' : 'SILVER';
        endpoint = `https://ns-jewellery.onrender.com/api/digital/transactions`; // Note: Ideally we filter in backend or use the new getUserMetalTransactions if authenticated, but here we can just fetch all and filter
        const response = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          const filtered = data.data.filter((t: any) => t.metalType === metal);
          setTransactions(filtered);
        }
      } else if (type === 'PLAN' && planId) {
        endpoint = `https://ns-jewellery.onrender.com/api/plans/my-plan/${planId}/transactions`;
        const response = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setTransactions(data.data);
        } else {
            console.error('API Error:', data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title || 'Transactions'}</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6D4C41" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock color={colors.textMuted} size={48} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions found.</Text>
            </View>
          ) : (
            transactions.map((t, idx) => {
              const isCredit = t.type === 'BUY' || (t.amount && t.amount > 0 && !t.type); // plans don't have type 'BUY', just 'amount'
              return (
                <View key={t.id || idx} style={[styles.txCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <View style={styles.txLeft}>
                    <View style={[styles.txIconWrapper, { backgroundColor: isCredit ? 'rgba(72, 201, 176, 0.1)' : 'rgba(231, 76, 60, 0.1)' }]}>
                      {isCredit ? (
                        <TrendingUp size={20} color="#48C9B0" />
                      ) : (
                        <TrendingDown size={20} color="#E74C3C" />
                      )}
                    </View>
                    <View>
                      <Text style={[styles.txTitle, { color: colors.text }]}>
                        {t.type === 'REDEEM' ? 'Redemption' : (t.type === 'SELL' ? 'Sold' : (t.type === 'BUY' ? 'Purchased' : 'Installment Paid'))}
                      </Text>
                      <Text style={[styles.txDate, { color: colors.textMuted }]}>
                        {formatDate(t.createdAt)} • {t.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.txRight}>
                    {type === 'PLAN' ? (
                      <Text style={[styles.txAmount, { color: isCredit ? '#48C9B0' : '#E74C3C' }]}>
                        {isCredit ? '+' : '-'}₹{t.amount}
                      </Text>
                    ) : (
                      <View style={{ alignItems: 'flex-end' }}>
                         <Text style={[styles.txAmount, { color: isCredit ? '#48C9B0' : '#E74C3C' }]}>
                          {isCredit ? '+' : '-'}{t.weight?.toFixed(3)}g
                        </Text>
                        <Text style={[styles.txDate, { color: colors.textMuted }]}>₹{t.amount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
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
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  txTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
  }
});

export default TransactionsScreen;
