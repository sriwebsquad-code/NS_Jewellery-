import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();

  const handleSendOTP = async () => {
    if (phone.length === 10) {
      try {
        const phoneNumber = `+91${phone}`;
        // Temporarily passing static confirmation object until backend is fully hooked up for testing build
        const response = await fetch('http://192.168.1.100:5000/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phoneNumber })
        });
        
        if (response.ok) {
          navigation.navigate('OTP', { phone });
        } else {
          // If backend isn't ready yet, navigate anyway so user can test UI
          navigation.navigate('OTP', { phone });
        }
      } catch (error: any) {
        // Fallback for UI testing if backend is offline
        navigation.navigate('OTP', { phone });
      }
    } else {
      alert('Please enter a valid 10-digit phone number');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Decorative Wave Backgrounds (Simulated with gradients/shapes) */}
      <View style={styles.topWave} />
      <View style={styles.bottomWave} />

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.contentContainer}>
          
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image 
              source={require('../../../assets/new_logo.png')} 
              style={styles.logo} 
            />
          </View>

          {/* Text Section */}
          <View style={styles.textSection}>
            <Text style={styles.heading}>Sign In</Text>
            <Text style={styles.subheading}>Enter your mobile number to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.prefixContainer}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.prefixText}>+91</Text>
                <ChevronDown color="#666" size={14} style={{ marginLeft: 4 }} />
              </View>
              <View style={styles.separator} />
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, phone.length !== 10 && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={phone.length !== 10}
            >
              <LinearGradient
                colors={['#D4AF37', '#AA771C']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Send OTP</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.outlineButton}
              onPress={() => navigation.navigate('LoginMPIN')}
            >
              <Lock color="#B8860B" size={16} style={{ marginRight: 8 }} />
              <Text style={styles.outlineButtonText}>Login with MPIN</Text>
            </TouchableOpacity>
          </View>

        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New user? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
            <Text style={styles.footerLink}>Register</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topWave: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  bottomWave: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    resizeMode: 'contain',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heading: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B8860B',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 55,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  prefixContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  prefixText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  separator: {
    width: 1,
    height: 25,
    backgroundColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingHorizontal: 15,
    height: '100%',
  },
  button: {
    height: 55,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 12,
  },
  outlineButton: {
    flexDirection: 'row',
    height: 55,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  outlineButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#B8860B',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
