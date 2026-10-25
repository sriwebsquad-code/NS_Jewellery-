import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { Menu, Calendar, Coins, TrendingUp, Sparkles, Lock } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

const AdvanceBookingsScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Menu color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Advance Bookings</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Calendar color={colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Placeholder for bookings */}
        <View style={{ padding: 20, alignItems: 'center', marginTop: 100 }}>
           <Text style={{ fontSize: 16, color: colors.textMuted, textAlign: 'center' }}>
             Your advance bookings will appear here.
           </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
});

export default AdvanceBookingsScreen;
