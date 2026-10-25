import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Menu, Lock, Phone } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../constants/Colors';
import { ENV } from '../../config/env';

const ChangeMpinScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore() as any;
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState(user?.phone || '');
  const [newMpin, setNewMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your registered phone number');
      return;
    }
    if (newMpin.length !== 4 || confirmMpin.length !== 4) {
      Alert.alert('Error', 'MPIN must be 4 digits');
      return;
    }
    if (newMpin !== confirmMpin) {
      Alert.alert('Error', 'MPINs do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${ENV.API_URL}/auth/mpin/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      
      if (data.success) {
        Alert.alert('OTP Sent', data.message);
        setStep(2);
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetMpin = async () => {
    if (!otp || otp.length !== 4) {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${ENV.API_URL}/auth/mpin/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newMpin })
      });
      const data = await res.json();
      
      if (data.success) {
        Alert.alert('Success', 'MPIN updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to reset MPIN');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to reset MPIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Menu color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Change MPIN</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {step === 1 ? (
          <>
            <Text style={[styles.description, { color: colors.textMuted }]}>
              Enter your registered mobile number and your new 4-digit MPIN.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Mobile Number</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
                <Phone color={colors.primary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>New MPIN</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
                <Lock color={colors.primary} size={20} style={styles.inputIcon} />
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
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
                <Lock color={colors.primary} size={20} style={styles.inputIcon} />
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

            <TouchableOpacity style={styles.submitButton} onPress={handleRequestOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.description, { color: colors.textMuted }]}>
              Please enter the 4-digit OTP sent to your registered phone number.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Enter OTP</Text>
              <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}>
                <Lock color={colors.primary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter 4-digit OTP"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleResetMpin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>Verify & Update MPIN</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    padding: 5,
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'serif',
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 30,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ChangeMpinScreen;
