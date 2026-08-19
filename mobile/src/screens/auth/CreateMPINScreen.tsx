import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const CreateMPINScreen = () => {
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const setMpinCreated = useAuthStore((state) => state.setMpinCreated);
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  const handleCreate = () => {
    if (mpin === confirmMpin) {
      // In production: send MPIN to backend to save it
      setMpinCreated();
    } else {
      alert('MPINs do not match');
    }
  };

  const isValid = mpin.length === 4 && confirmMpin.length === 4;

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <Text style={[styles.title, { color: colors.primary }]}>Secure Your Account</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Create a 4-digit MPIN for quick access</Text>
      </View>

      <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.label, { color: colors.text }]}>Enter 4-Digit MPIN</Text>
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

        <Text style={[styles.label, { marginTop: 20, color: colors.text }]}>Confirm MPIN</Text>
        <View style={[styles.inputContainer, { backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : COLORS.lightGray, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="• • • •"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            value={confirmMpin}
            onChangeText={setConfirmMpin}
            textAlign="center"
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, isValid ? { backgroundColor: colors.primary } : styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Set MPIN & Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardBackground,
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
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.cardBackground,
    fontSize: SIZES.h4,
  },
  formContainer: {
    flex: 2,
    padding: SIZES.padding,
    paddingTop: 40,
  },
  label: {
    fontSize: SIZES.h4,
    color: colors.textMuted,
    marginBottom: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: SIZES.radius,
    height: 60,
    backgroundColor: colors.background,
    justifyContent: 'center',
    marginHorizontal: 40,
  },
  input: {
    fontSize: 30,
    color: colors.text,
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
    backgroundColor: colors.border,
  },
  buttonText: {
    color: colors.cardBackground,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  },
});

export default CreateMPINScreen;
