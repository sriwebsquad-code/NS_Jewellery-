import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { COLORS, SIZES } from '../../constants/theme';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  const handleSendOTP = () => {
    // In production: trigger Firebase OTP
    if (phone.length === 10) {
      navigation.navigate('OTP', { phone });
    } else {
      alert('Please enter a valid 10-digit phone number');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        {/* Placeholder for App Logo */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>NS</Text>
        </View>
        <Text style={[styles.title, { color: colors.primary }]}>NS Jewellery</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Premium Savings & Digital Gold</Text>
      </View>

      <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
        <View style={[styles.inputContainer, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : COLORS.lightGray, borderColor: colors.border }]}>
          <Text style={[styles.prefix, { color: colors.text }]}>+91</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Enter your mobile number"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, phone.length === 10 ? { backgroundColor: colors.primary } : styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={phone.length !== 10}
        >
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>

        <Text style={[styles.termsText, { color: colors.textMuted }]}>
          By continuing, you agree to our Terms & Conditions and Privacy Policy
        </Text>
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
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: COLORS.white,
    fontSize: SIZES.h1,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  title: {
    color: COLORS.primary,
    fontSize: SIZES.h1,
    fontWeight: '900',
    fontFamily: 'serif',
  },
  subtitle: {
    color: COLORS.white,
    fontSize: SIZES.h4,
    marginTop: 5,
  },
  formContainer: {
    flex: 1.5,
    padding: SIZES.padding,
    paddingTop: 40,
  },
  label: {
    fontSize: SIZES.h4,
    color: COLORS.darkGray,
    marginBottom: 10,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: 15,
    height: 55,
    backgroundColor: COLORS.gray,
  },
  prefix: {
    fontSize: SIZES.h3,
    color: COLORS.darkGray,
    marginRight: 10,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    fontSize: SIZES.h3,
    color: COLORS.black,
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
  termsText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 12,
    marginTop: 20,
  },
});

export default LoginScreen;
