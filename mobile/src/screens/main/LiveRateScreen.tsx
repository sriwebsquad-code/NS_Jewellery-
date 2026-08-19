import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const LiveRateScreen = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<any>({ goldRate24k: 7250, goldRate22k: 6650, silverRate: 85, lastUpdated: new Date() });

  const fetchRates = async () => {
    setLoading(true);
    try {
      const API_URL = 'https://ns-jewellery.onrender.com';
      const res = await fetch(`${API_URL}/api/rates`);
      const data = await res.json();
      if (data.success && data.data) {
        setRates({
          goldRate24k: data.data.goldRate,
          goldRate22k: data.data.goldRate * 0.916, // Approx 22K from 24K
          silverRate: data.data.silverRate,
          lastUpdated: data.data.updatedAt ? new Date(data.data.updatedAt) : new Date()
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Live Rates</Text>
        <TouchableOpacity onPress={fetchRates} style={styles.refreshBtn}>
          <RefreshCw color={colors.text} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRates} tintColor={colors.primary} />}
      >
        <View style={[styles.updateCard, { backgroundColor: colors.cardBackground, shadowColor: mode === 'dark' ? '#000' : COLORS.black }]}>
          <Text style={[styles.updateLabel, { color: colors.textMuted }]}>Last Updated</Text>
          <Text style={[styles.updateTime, { color: colors.text }]}>{rates.lastUpdated.toLocaleString('en-IN')}</Text>
        </View>

        {/* 24K Gold Card */}
        <View style={[styles.rateCard, { backgroundColor: colors.cardBackground, borderColor: 'rgba(212, 175, 55, 0.4)' }]}>
          <View style={styles.rateHeader}>
            <Text style={[styles.metalTitle, { color: '#FFD700' }]}>24K Gold</Text>
            <View style={styles.changeTag}>
              <TrendingUp color="#32CD32" size={14} />
              <Text style={styles.changeText}>+0.5%</Text>
            </View>
          </View>
          <Text style={[styles.rateValue, { color: colors.text }]}>₹{rates.goldRate24k.toLocaleString('en-IN', { maximumFractionDigits: 2 })} <Text style={[styles.perGram, { color: colors.textMuted }]}>/ gram</Text></Text>
        </View>

        {/* 22K Gold Card */}
        <View style={[styles.rateCard, { backgroundColor: colors.cardBackground, borderColor: 'rgba(212, 175, 55, 0.4)' }]}>
          <View style={styles.rateHeader}>
            <Text style={[styles.metalTitle, { color: '#FFD700' }]}>22K Gold</Text>
            <View style={styles.changeTag}>
              <TrendingUp color="#32CD32" size={14} />
              <Text style={styles.changeText}>+0.4%</Text>
            </View>
          </View>
          <Text style={[styles.rateValue, { color: colors.text }]}>₹{rates.goldRate22k.toLocaleString('en-IN', { maximumFractionDigits: 2 })} <Text style={[styles.perGram, { color: colors.textMuted }]}>/ gram</Text></Text>
        </View>

        {/* Silver Card */}
        <View style={[styles.rateCard, { backgroundColor: colors.cardBackground, borderColor: 'rgba(192, 192, 192, 0.4)' }]}>
          <View style={styles.rateHeader}>
            <Text style={[styles.metalTitle, { color: '#E0E0E0' }]}>999 Silver</Text>
            <View style={styles.changeTag}>
              <TrendingUp color="#32CD32" size={14} />
              <Text style={styles.changeText}>+1.2%</Text>
            </View>
          </View>
          <Text style={[styles.rateValue, { color: colors.text }]}>₹{rates.silverRate.toLocaleString('en-IN', { maximumFractionDigits: 2 })} <Text style={[styles.perGram, { color: colors.textMuted }]}>/ gram</Text></Text>
        </View>

      </ScrollView>
    </View>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F11' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#0F0F11', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  backBtn: { padding: 5 },
  refreshBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.cardBackground, fontFamily: 'serif' },
  content: { padding: 20 },
  updateCard: { alignItems: 'center', marginBottom: 30 },
  updateLabel: { color: '#AAB7B8', fontSize: 14, marginBottom: 5 },
  updateTime: { color: colors.cardBackground, fontSize: 16, fontWeight: '600' },
  rateCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginBottom: 20,
    borderWidth: 1
  },
  rateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  metalTitle: { fontSize: 22, fontWeight: 'bold', fontFamily: 'serif' },
  changeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(50,205,50,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  changeText: { color: '#32CD32', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  rateValue: { fontSize: 32, fontWeight: 'bold', color: colors.cardBackground },
  perGram: { fontSize: 16, color: '#AAB7B8', fontWeight: 'normal' }
});

export default LiveRateScreen;
