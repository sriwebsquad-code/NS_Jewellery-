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
  const { phone } = route.params;
  const setLogin = useAuthStore((state) => state.setLogin);
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    try {
      // TODO: Replace with actual Firebase OTP verification
      // Example:
      // await confirmation.confirm(otp); 
      // const idToken = await auth().currentUser.getIdToken();
      // const response = await fetch('YOUR_RENDER_URL/api/auth/verify-firebase', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ idToken })
      // });
      // const data = await response.json();
      // setLogin(data.token, !data.user.mpin);
      
      // Demo Mode Fallback
      if (otp === '123456') { 
        setLogin('fake-jwt-token', false);
      } else {
        alert('Invalid OTP');
      }
    } catch (error) {
      alert('Verification failed');
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    color: COLORS.primary,
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.white,
    fontSize: SIZES.h4,
  },
  phoneText: {
    color: COLORS.white,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginTop: 5,
  },
  formContainer: {
    flex: 2,
    padding: SIZES.padding,
    paddingTop: 40,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    height: 60,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
  },
  input: {
    fontSize: 24,
    color: COLORS.black,
    letterSpacing: 10,
    fontWeight: 'bold',
  },
  button: {
    height: 55,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
  },
  buttonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  resendText: {
    color: COLORS.darkGray,
  },
  timerText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  resendButton: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
});

export default OTPScreen;
