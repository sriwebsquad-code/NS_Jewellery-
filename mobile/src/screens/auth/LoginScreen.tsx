import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, StatusBar, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();

  const handleSendOTP = async () => {
    if (phone.length === 10) {
      try {
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
    <LinearGradient colors={['#FAE596', '#E2B84D', '#C79A31']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E2B84D" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>OTP Verification</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image 
              source={require('../../../assets/login.png')} 
              style={styles.logo} 
            />
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCodeText}>(+91) India</Text>
              <ChevronDown color="#000" size={20} />
            </View>
            
            <View style={styles.inputWrapper}>
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

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTextMain}>We will send you one time password (OTP)</Text>
              <Text style={styles.infoTextSub}>Carrier rates may apply</Text>
            </View>

            <TouchableOpacity 
              style={[styles.nextButton, phone.length === 10 ? styles.nextButtonActive : styles.nextButtonDisabled]}
              onPress={handleSendOTP}
              disabled={phone.length !== 10}
            >
              <ArrowRight color="#FFF" size={24} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Wavy bottom decorative effect */}
        <View style={styles.wave1} />
        <View style={styles.wave2} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoWrapper: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    borderRadius: 15,
  },
  cardContainer: {
    paddingHorizontal: 30,
    alignItems: 'center',
    zIndex: 10,
  },
  card: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 25,
    padding: 25,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 15,
    marginBottom: 15,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  inputWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 15,
    marginBottom: 25,
  },
  input: {
    fontSize: 16,
    color: '#000',
  },
  infoTextContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTextMain: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoTextSub: {
    fontSize: 10,
    color: '#D4AF37',
  },
  nextButton: {
    position: 'absolute',
    bottom: -25,
    alignSelf: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  nextButtonActive: {
    backgroundColor: '#D4AF37',
  },
  nextButtonDisabled: {
    backgroundColor: '#E0C782',
  },
  wave1: {
    position: 'absolute',
    bottom: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 1,
  },
  wave2: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.15)',
    zIndex: 1,
  }
});

export default LoginScreen;
