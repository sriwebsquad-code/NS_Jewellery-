import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone } from 'lucide-react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth, firebaseConfig } from '../../config/firebase';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();
  const recaptchaVerifier = useRef(null);

  const handleSendOTP = async () => {
    if (phone.length === 10) {
      try {
        // If testing demo, you can still optionally skip by typing 123456 in OTP
        const phoneNumber = `+91${phone}`;
        const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current as any);
        navigation.navigate('OTP', { phone, confirmation });
      } catch (error) {
        alert('Failed to send OTP. Please try again.');
        console.error(error);
      }
    } else {
      alert('Please enter a valid 10-digit phone number');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />
      
      {/* Top Logo Section */}
      <View style={styles.logoSection}>
        <Image 
          source={require('../../../assets/rn_logo_black.png')} 
          style={styles.logo} 
        />
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.logoText}>NS MAHAVEER</Text>
        <Text style={styles.logoSubText}>JEWELLERY</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.loginHeading}>LOGIN</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
          <Phone color="#000" size={20} />
        </View>

        <TouchableOpacity 
          style={[styles.button, phone.length === 10 ? styles.buttonActive : styles.buttonDisabled]}
          onPress={handleSendOTP}
          disabled={phone.length !== 10}
        >
          <Text style={styles.buttonText}>SEND OTP</Text>
        </TouchableOpacity>


      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#D4AF37',
    fontFamily: 'serif',
    marginBottom: 10,
    fontWeight: '500',
  },
  logoText: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'serif',
    letterSpacing: 2,
    textAlign: 'center',
  },
  logoSubText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'serif',
    letterSpacing: 6,
    marginTop: 5,
    textAlign: 'center',
  },
  formSection: {
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
  loginHeading: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: 1,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  button: {
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default LoginScreen;

