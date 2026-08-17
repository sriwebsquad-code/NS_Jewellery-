import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { COLORS, SIZES } from '../../constants/theme';
import { ArrowLeft, Lock, Phone } from 'lucide-react-native';

const ForgotMpinScreen = () => {
  const navigation = useNavigation<any>();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  const [step, setStep] = useState(1); // 1: Phone, 2: OTP & Reset
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newMpin, setNewMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://10.115.217.171:5000/api/auth/mpin/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      
      if (data.success) {
        Alert.alert('OTP Sent', data.message);
        setStep(2);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetMpin = async () => {
    if (!otp || otp.length !== 4) return Alert.alert('Error', 'Please enter a valid 4-digit OTP');
    if (!newMpin || newMpin.length !== 4) return Alert.alert('Error', 'MPIN must be 4 digits');
    if (newMpin !== confirmMpin) return Alert.alert('Error', 'MPINs do not match');

    setLoading(true);
    try {
      const res = await fetch('http://10.115.217.171:5000/api/auth/mpin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newMpin })
      });
      const data = await res.json();
      
      if (data.success) {
        Alert.alert('Success', 'Your MPIN has been successfully reset!', [
          { text: 'OK', onPress: () => navigation.navigate('LoginMPIN') }
        ]);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to reset MPIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reset MPIN</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          {step === 1 ? (
            <>
              <Text style={[styles.description, { color: colors.textMuted }]}>
                Enter your registered mobile number to receive an OTP via SMS and Email.
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
                  <Phone color={colors.icon} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter Mobile Number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary }]} 
                onPress={handleRequestOtp}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.description, { color: colors.textMuted }]}>
                We've sent a 4-digit OTP to your registered Mobile Number and Email Address.
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Enter OTP</Text>
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="• • • •"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={4}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>New MPIN</Text>
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
                  <Lock color={colors.icon} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter 4-digit MPIN"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    value={newMpin}
                    onChangeText={setNewMpin}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Confirm MPIN</Text>
                <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}>
                  <Lock color={colors.icon} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Confirm 4-digit MPIN"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    value={confirmMpin}
                    onChangeText={setConfirmMpin}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary }]} 
                onPress={handleResetMpin}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>{loading ? 'Verifying...' : 'Reset MPIN'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
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
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  content: { padding: 20 },
  description: { fontSize: 15, marginBottom: 25, lineHeight: 22 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  submitButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  }
});

export default ForgotMpinScreen;
