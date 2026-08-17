import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../constants/Colors';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
// import { api } from '../../services/api'; // Assuming you have an API service configured

const AadharVerificationScreen = () => {
  const [aadharNumber, setAadharNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  
  const navigation = useNavigation<any>();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const setKycStatus = useAuthStore((state) => state.setKycStatus);

  const handleSendOTP = async () => {
    if (aadharNumber.length !== 12) {
      Alert.alert('Error', 'Please enter a valid 12-digit Aadhar number');
      return;
    }

    setLoading(true);
    try {
      // Mock API call to send OTP
      // const res = await api.post('/kyc/aadhar/send-otp', { aadharNumber });
      // if (res.data.success) {
      //   setReferenceId(res.data.data.referenceId);
      //   setStep('OTP');
      // }
      
      // Simulating API delay
      setTimeout(() => {
        setReferenceId(`mock-ref-${Date.now()}`);
        setStep('OTP');
        setLoading(false);
      }, 1500);

    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      // Mock API call to verify OTP
      // const res = await api.post('/kyc/aadhar/verify', { aadharNumber, otp, referenceId });
      // if (res.data.success) {
      //   setKycStatus('VERIFIED');
      //   Alert.alert('Success', 'Aadhar verified successfully!', [
      //     { text: 'OK', onPress: () => navigation.goBack() }
      //   ]);
      // }
      
      // Simulating API delay
      setTimeout(() => {
        setKycStatus('VERIFIED');
        setLoading(false);
        Alert.alert('Verification Successful', 'Your KYC is complete. You can now make purchases.', [
          { text: 'Continue', onPress: () => navigation.goBack() }
        ]);
      }, 1500);

    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Verification failed');
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
            {step === 'INPUT' ? 'Verify your Aadhar' : 'Enter OTP'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {step === 'INPUT' 
              ? 'To buy digital gold or join savings plans, regulations require us to verify your identity.' 
              : `We've sent a 6-digit OTP to the mobile number linked to Aadhar ending in ${aadharNumber.slice(-4)}`}
          </Text>

          {step === 'INPUT' ? (
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: colors.text }]}>Aadhar Number</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="0000 0000 0000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={12}
                value={aadharNumber}
                onChangeText={setAadharNumber}
              />
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary, opacity: aadharNumber.length === 12 ? 1 : 0.6 }]}
                onPress={handleSendOTP}
                disabled={loading || aadharNumber.length !== 12}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: colors.text }]}>OTP</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, textAlign: 'center', letterSpacing: 10 }]}
                placeholder="• • • • • •"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary, opacity: otp.length === 6 ? 1 : 0.6 }]}
                onPress={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Aadhar</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('INPUT')} style={{ marginTop: 15, alignItems: 'center' }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Change Aadhar Number</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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

export default AadharVerificationScreen;
