import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../constants/Colors';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
// import { api } from '../../services/api'; // Assuming you have an API service configured

const PanVerificationScreen = () => {
  const [panNumber, setPanNumber] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation<any>();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);
  const setPanStatus = useAuthStore((state) => state.setPanStatus);

  const handleVerifyPAN = async () => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber.toUpperCase())) {
      Alert.alert('Invalid PAN', 'Please enter a valid PAN format (e.g., ABCDE1234F)');
      return;
    }

    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('https://ns-jewellery.onrender.com/api/kyc/pan/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ panNumber })
      });
      const data = await res.json();
      
      if (data.success) {
        setPanStatus('VERIFIED');
        Alert.alert('Verification Successful', 'Your PAN is verified. You can now make purchases.', [
          { text: 'Continue', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to verify PAN');
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to verify PAN');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>KYC Verification</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={60} color={colors.primary} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>
            Verify your PAN
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            To buy digital gold or join savings plans, regulations require us to verify your identity.
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.text }]}>PAN Number</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="ABCDE1234F"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              maxLength={10}
              value={panNumber}
              onChangeText={setPanNumber}
            />
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary, opacity: panNumber.length === 10 ? 1 : 0.6 }]}
              onPress={handleVerifyPAN}
              disabled={loading || panNumber.length !== 10}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify PAN</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  inputWrapper: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PanVerificationScreen;
