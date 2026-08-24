import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone, ArrowRight } from 'lucide-react-native';
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();

  const handleSendOTP = async () => {
    if (phone.length === 10) {
      try {
        const phoneNumber = `+91${phone}`;
        // Trigger Native Firebase Phone Auth using modular API
        const auth = getAuth();
        const confirmation = await signInWithPhoneNumber(auth, phoneNumber);
        navigation.navigate('OTP', { phone, confirmation });
      } catch (error: any) {
        alert('Error: ' + error.message);
        console.error(error);
      }
    } else {
      alert('Please enter a valid 10-digit phone number');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF8F0" />
      
      {/* Background Gradients */}
      <LinearGradient
        colors={['#F9F1E2', '#FCF9F2', '#FDF8F0']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Top Logo Section */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../../../assets/new_logo.png')} 
            style={styles.logo} 
          />
        </View>

        {/* Text Section */}
        <View style={styles.textSection}>
          <Text style={styles.heading}>Sign in</Text>
          <Text style={styles.subheading}>Login with your mobile number</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.inputLabelContainer}>
            <Phone color="#B8860B" size={16} style={{marginRight: 6}} />
            <Text style={styles.inputLabel}>Mobile Number</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.prefixContainer}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <View style={styles.separator} />
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              placeholderTextColor="#999"
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
              colors={['#D4AF37', '#B8860B', '#996515']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>SEND OTP</Text>
              <ArrowRight color="#FFF" size={20} style={{marginLeft: 8}} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F0',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.05,
    marginBottom: 40,
  },
  logo: {
    width: width * 0.65,
    height: width * 0.65,
    resizeMode: 'contain',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: '#555',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    height: 55,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  prefixContainer: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  separator: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingHorizontal: 16,
    height: '100%',
  },
  button: {
    height: 55,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default LoginScreen;
