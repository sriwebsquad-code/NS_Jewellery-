import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Save, TrendingUp, Users, Database, FileText, Bell } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const AdminDashboard = () => {
  const navigation = useNavigation<any>();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [rates, setRates] = useState({ gold22: '', gold24: '', silver: '' });

  const fetchRates = async () => {
    try {
      const res = await fetch('http://10.115.217.171:5000/api/rates');
      const data = await res.json();
      if (data.success && data.data) {
        setRates({
          gold24: data.data.goldRate.toString(),
          gold22: Math.round(data.data.goldRate * 0.916).toString(),
          silver: data.data.silverRate.toString()
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleUpdateRates = async () => {
    if (!rates.gold24 || !rates.silver) return;
    setLoading(true);
    try {
      const res = await fetch('http://10.115.217.171:5000/api/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          goldRate: parseFloat(rates.gold24),
          silverRate: parseFloat(rates.silver)
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert("Success", "Live Rates updated successfully!");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to update rates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={COLORS.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Rate Updater */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <TrendingUp color={COLORS.primary} size={20} />
            <Text style={styles.cardTitle}>Update Live Rates</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>24K Gold Rate (₹/g)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={rates.gold24}
              onChangeText={(t) => setRates({...rates, gold24: t, gold22: t ? Math.round(parseFloat(t)*0.916).toString() : ''})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>22K Gold Rate (₹/g) - Auto Calculated</Text>
            <TextInput
              style={[styles.textInput, {backgroundColor: 'rgba(255,255,255,0.02)', color: '#AAA'}]}
              value={rates.gold22}
              editable={false}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>999 Silver Rate (₹/g)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={rates.silver}
              onChangeText={(t) => setRates({...rates, silver: t})}
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateRates} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Save color="#000" size={18} />}
            {!loading && <Text style={styles.saveBtnText}>Save Rates</Text>}
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem}>
            <Database color="#D4AF37" size={32} />
            <Text style={styles.gridLabel}>Gold Purchases</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Users color="#87CEFA" size={32} />
            <Text style={styles.gridLabel}>Customers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <FileText color="#98FB98" size={32} />
            <Text style={styles.gridLabel}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Bell color="#E8A3F1" size={32} />
            <Text style={styles.gridLabel}>Push Notifications</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F11' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '900', fontFamily: 'serif', color: COLORS.white },
  content: { padding: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, marginLeft: 10, fontFamily: 'serif' },
  inputGroup: { marginBottom: 15 },
  inputLabel: { color: '#AAB7B8', fontSize: 12, marginBottom: 5 },
  textInput: { backgroundColor: 'rgba(255,255,255,0.1)', color: COLORS.white, borderRadius: 8, padding: 12, fontSize: 16, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#D4AF37', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 8, marginTop: 10 },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { backgroundColor: 'rgba(255,255,255,0.05)', width: '48%', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  gridLabel: { color: COLORS.white, marginTop: 10, fontWeight: '600', textAlign: 'center' }
});

export default AdminDashboard;
