import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const OTPScreen = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phone, confirmation } = route.params;
  const setLogin = useAuthStore((state) => state.setLogin);
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    try {
      let payload: any = { phone, otp };
      
      // If it's the mock demo flow
      if (confirmation.verificationId === 'demo-123456') {
        if (otp !== '123456') {
          alert('Invalid OTP. Use 123456 for demo.');
          return;
        }
      }

      const response = await fetch('https://ns-jewellery.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.success) {
        setLogin(data.token, !data.user.mpin);
      } else {
        alert('Authentication failed on server.');
      }
    } catch (error) {
      alert('Invalid OTP or Verification failed');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Verify OTP</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter the 6-digit code sent to</Text>
        <Text style={[styles.phoneText, { color: colors.text }]}>+91 {phone}</Text>
      </View>

      <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.inputContainer, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : COLORS.lightGray, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="• • • • • •"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            textAlign="center"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, otp.length === 6 ? { backgroundColor: colors.primary } : styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={otp.length !== 6}
        >
          <Text style={styles.buttonText}>Verify & Proceed</Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: colors.textMuted }]}>Didn't receive the code? </Text>
          {timer > 0 ? (
            <Text style={[styles.timerText, { color: colors.textMuted }]}>Resend in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(30)}>
              <Text style={[styles.resendButton, { color: colors.primary }]}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 10,
  },
  subtitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontFamily: 'serif',
  },
  phoneText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 55,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
  },
  input: {
    fontSize: 24,
    color: '#000',
    letterSpacing: 10,
    fontWeight: 'bold',
  },
  button: {
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonActive: {
    backgroundColor: '#D4AF37',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#888',
  },
  timerText: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  resendButton: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
});

export default OTPScreen;
