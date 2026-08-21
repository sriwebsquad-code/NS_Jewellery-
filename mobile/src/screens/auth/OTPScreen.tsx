import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Image, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Delete } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

const OTPScreen = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phone, confirmation } = route.params;
  const setLogin = useAuthStore((state) => state.setLogin);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    try {
      let payload: any = { phone, otp };
      if (confirmation.verificationId === 'demo-123456') {
        if (otp !== '123456') {
          alert('Invalid OTP. Use 123456 for demo.');
          setOtp('');
          return;
        }
      }
      const response = await fetch('https://ns-jewellery.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.success) {
        setLogin(data.token, !data.user.mpin);
      } else {
        alert('Authentication failed on server.');
        setOtp('');
      }
    } catch (error) {
      alert('Invalid OTP or Verification failed');
      setOtp('');
      console.error(error);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'del') {
      setOtp((prev) => prev.slice(0, -1));
    } else {
      if (otp.length < 6) {
        setOtp((prev) => prev + key);
      }
    }
  };

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push(
        <View key={i} style={[styles.dotBox, { backgroundColor: otp[i] ? '#FFF' : 'rgba(255,255,255,0.3)' }]}>
          <Text style={styles.dotText}>{otp[i] || ''}</Text>
        </View>
      );
    }
    return dots;
  };

  return (
    <LinearGradient colors={['#FAE596', '#E2B84D', '#C79A31']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E2B84D" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter Verification Code</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image 
              source={require('../../../assets/login.jpg')} 
              style={styles.logo} 
            />
          </View>
        </View>

        <Text style={styles.infoText}>We have sent OTP on your number</Text>

        <View style={styles.dotsContainer}>
          {renderDots()}
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive a OTP? </Text>
          {timer > 0 ? (
            <Text style={styles.resendLink}>Resend in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(30)}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flex: 1 }} />

        {/* Custom Keypad */}
        <View style={styles.keypadContainer}>
          {[ ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'] ].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((key) => (
                <TouchableOpacity key={key} style={styles.key} onPress={() => handleKeyPress(key)}>
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={styles.keypadRow}>
            <View style={styles.key} />
            <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('0')}>
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('del')}>
              <Delete color="#FFF" size={28} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Wavy bottom effect */}
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
    marginTop: 30,
    marginBottom: 30,
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
  infoText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dotBox: {
    width: 40,
    height: 45,
    borderRadius: 8,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dotText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  resendLink: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  keypadContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    zIndex: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  key: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '400',
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

export default OTPScreen;
