import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { COLORS, SIZES } from '../../constants/theme';

const LoginMPINScreen = () => {
  const [mpin, setMpin] = useState('');
  const logout = useAuthStore((state) => state.logout);
  const navigation = useNavigation<any>();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  const handleLogin = () => {
    if (mpin === '1234') { // Demo static MPIN
       navigation.navigate('Main');
    } else {
      alert('Incorrect MPIN');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <Image 
          source={require('../../../assets/rn_logo.png')} 
          style={{ width: 90, height: 90, resizeMode: 'contain', marginBottom: 20 }} 
        />
        <Text style={[styles.title, { color: colors.primary }]}>Welcome Back!</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter your MPIN to unlock</Text>
      </View>

      <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.inputContainer, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : COLORS.lightGray, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="• • • •"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            value={mpin}
            onChangeText={setMpin}
            textAlign="center"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, mpin.length === 4 ? { backgroundColor: colors.primary } : styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={mpin.length !== 4}
        >
          <Text style={styles.buttonText}>Unlock App</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => navigation.navigate('ForgotMpin')}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Forgot MPIN?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={[styles.logoutText, { color: colors.textMuted }]}>Logout / Use different account</Text>
        </TouchableOpacity>
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
  profilePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.primary,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileText: {
    color: COLORS.white,
    fontSize: SIZES.h2,
    fontWeight: 'bold',
  },
  title: {
    color: COLORS.white,
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: COLORS.lightGray,
    fontSize: SIZES.h4,
  },
  formContainer: {
    flex: 1.5,
    padding: SIZES.padding,
    paddingTop: 50,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    height: 60,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    marginHorizontal: 40,
  },
  input: {
    fontSize: 30,
    color: COLORS.black,
    letterSpacing: 20,
    fontWeight: 'bold',
  },
  button: {
    height: 55,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
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
  logoutButton: {
    marginTop: 30,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
});

export default LoginMPINScreen;
