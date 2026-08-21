import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone } from 'lucide-react-native';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();

  const handleSendOTP = async () => {
    if (phone.length === 10) {
      try {
        // Mocking firebase auth for urgent demo
        const confirmation = { verificationId: 'demo-123456' };
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
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />
      
      {/* Top Logo Section */}
      <View style={styles.logoSection}>
        <Image 
          source={require('../../../assets/app_logo.jpg')} 
          style={[styles.logo, { borderRadius: 20 }]} 
        />
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
    backgroundColor: '#0F0F0F',
  },
  logoSection: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  logoText: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'serif',
    letterSpacing: 2,
  },
  logoSubText: {
    color: '#FFF',
    fontSize: 12,
    letterSpacing: 6,
    marginTop: 5,
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 60,
    justifyContent: 'flex-end',
  },
  loginHeading: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 20,
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
    marginTop: 10,
  },
  buttonActive: {
    backgroundColor: '#4DEB9F',
  },
  buttonDisabled: {
    backgroundColor: '#1E5A3D',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  bottomText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 40,
  },
  bottomTextLink: {
    color: '#D4AF37',
    fontWeight: 'bold',
  }
});

export default LoginScreen;

