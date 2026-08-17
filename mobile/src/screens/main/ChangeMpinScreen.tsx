import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../../constants/theme';
import { Menu, Lock, Phone } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

const ChangeMpinScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore() as any;
  const [phone, setPhone] = useState(user?.phone || '');
  const [newMpin, setNewMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');

  const handleChangeMpin = () => {
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

    // Call backend to update MPIN here
    Alert.alert('Success', 'Your MPIN has been updated successfully', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
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

        <TouchableOpacity style={styles.submitButton} onPress={handleChangeMpin}>
          <Text style={styles.submitButtonText}>Update MPIN</Text>
        </TouchableOpacity>
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
