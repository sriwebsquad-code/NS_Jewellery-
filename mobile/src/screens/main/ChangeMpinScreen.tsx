import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../../constants/theme';
import { Menu, Lock, Phone } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { ENV } from '../../config/env';

const ChangeMpinScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore() as any;
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
        Alert.alert('Success', 'Your MPIN has been updated successfully', [
          { text: 'OK', onPress: () => {
              setStep(1);
              setNewMpin('');
              setConfirmMpin('');
              setOtp('');
              navigation.goBack();
            } 
          }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to update MPIN');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update MPIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color={COLORS.black} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change MPIN</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {step === 1 ? (
          <>
            <Text style={styles.description}>
              Enter your registered phone number and a new 4-digit MPIN to secure your account.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone color={COLORS.darkGray} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Phone Number"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  editable={!user?.phone}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>New MPIN</Text>
              <View style={styles.inputWrapper}>
                <Lock color={COLORS.darkGray} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 4-digit MPIN"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={newMpin}
                  onChangeText={setNewMpin}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm MPIN</Text>
              <View style={styles.inputWrapper}>
                <Lock color={COLORS.darkGray} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm 4-digit MPIN"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={confirmMpin}
                  onChangeText={setConfirmMpin}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleRequestOtp} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitButtonText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Please enter the 4-digit OTP sent to your registered phone number.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Enter OTP</Text>
              <View style={styles.inputWrapper}>
                <Lock color={COLORS.darkGray} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 4-digit OTP"
                  keyboardType="numeric"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleResetMpin} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitButtonText}>Verify & Update MPIN</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'serif',
    color: COLORS.black,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 30,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
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
    color: COLORS.black,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ChangeMpinScreen;
