import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Dimensions, SafeAreaView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeft, Delete } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const OTPScreen = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(600);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phone } = route.params || { phone: '9876543210' };
  const { setLogin, setUser } = useAuthStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    try {
      await fetch('https://ns-jewellery.onrender.com/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      setTimer(600); // Reset timer to 10 minutes
    } catch (e) {
      console.log('Failed to resend OTP', e);
    }
  };

  const handleVerify = async (code: string) => {
    try {
      let payload: any = { phone, otp: code };
      
      const response = await fetch('https://ns-jewellery.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        setLogin(data.data.token, !!data.data.user.mpin);
      } else {
        alert('Authentication failed on server.');
        setOtp('');
      }
    } catch (error: any) {
      alert('Error: ' + (error.message || JSON.stringify(error)));
      console.error(error);
      setOtp('');
    }
  };

  const handleKeyPress = (val: string) => {
    if (otp.length < 6) {
      setOtp(otp + val);
    }
  };

  const handleBackspace = () => {
    if (otp.length > 0) {
      setOtp(otp.slice(0, -1));
    }
  };

  const renderOTPBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = otp[i] || '';
      const isFocused = otp.length === i;
      boxes.push(
        <View 
          key={i} 
          style={[
            styles.otpBox, 
            isFocused && styles.otpBoxFocused,
            char ? styles.otpBoxFilled : null
          ]}
        >
          <Text style={styles.otpText}>{char}</Text>
        </View>
      );
    }
    return boxes;
  };

  const pad = [
    { num: '1', letters: '' }, { num: '2', letters: 'ABC' }, { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' }, { num: '5', letters: 'JKL' }, { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' }, { num: '8', letters: 'TUV' }, { num: '9', letters: 'WXYZ' },
    { num: '', letters: '' }, { num: '0', letters: '' }, { num: 'backspace', letters: '' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#D5A539" size={24} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        {/* Logo Removed */}

        {/* Text Section */}
        <View style={styles.textSection}>
          <Text style={styles.heading}>Enter OTP</Text>
          <Text style={styles.subheading}>We have sent a 6-digit code to</Text>
          
          <View style={styles.phonePill}>
            <Text style={styles.phoneText}>📞 +91 {phone}</Text>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.editText}>Edit ✎</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OTP Boxes */}
        <View style={styles.otpContainer}>
          {renderOTPBoxes()}
        </View>

        {timer > 0 ? (
          <Text style={styles.resendText}>
            Resend OTP in <Text style={styles.timerText}>{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</Text>
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={[styles.resendText, { color: '#D5A539', fontWeight: 'bold' }]}>Resend OTP</Text>
          </TouchableOpacity>
        )}

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity 
            style={[styles.submitButton, otp.length !== 6 && styles.submitButtonInactive]} 
            onPress={() => handleVerify(otp)}
            disabled={otp.length !== 6}
          >
            {otp.length === 6 ? (
              <LinearGradient
                colors={['#D5A539', '#A87313']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.gradientButton}
              >
                <Text style={styles.submitButtonText}>Verify OTP</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.submitButtonTextInactive}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Keypad */}
      <View style={styles.keypadContainer}>
        {pad.map((item, index) => {
          if (item.num === '') {
            return <View key={index} style={styles.keypadButton} />;
          }
          if (item.num === 'backspace') {
            return (
              <TouchableOpacity key={index} style={styles.keypadButton} onPress={handleBackspace}>
                <View style={styles.keypadButtonInner}>
                  <Delete color="#333" size={24} />
                </View>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={index} style={styles.keypadButton} onPress={() => handleKeyPress(item.num)}>
              <View style={styles.keypadButtonInner}>
                <Text style={styles.keyNum}>{item.num}</Text>
                {item.letters ? <Text style={styles.keyLetters}>{item.letters}</Text> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D5A539',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: -20,
    width: width * 0.45,
    height: width * 0.45,
    overflow: 'hidden',
    borderRadius: 30,
  },
  logo: {
    width: width * 0.52,
    height: width * 0.52,
    resizeMode: 'cover',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  heading: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A67A27',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  phoneText: {
    fontSize: 13,
    color: '#333',
    marginRight: 15,
    fontWeight: '500',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    fontSize: 13,
    color: '#A67A27',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    gap: 8,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFocused: {
    borderColor: '#D5A539',
    borderWidth: 1.5,
  },
  otpBoxFilled: {
    borderColor: '#D5A539',
  },
  otpText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
  },
  resendText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
    marginBottom: 35,
  },
  timerText: {
    color: '#A67A27',
    fontWeight: 'bold',
  },
  submitContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  submitButton: {
    width: '100%',
    height: 55,
    borderRadius: 30,
    overflow: 'hidden',
  },
  submitButtonInactive: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  submitButtonTextInactive: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
  },
  keypadButton: {
    width: '33.33%',
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonInner: {
    width: 75,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  keyNum: {
    fontSize: 26,
    fontWeight: '500',
    color: '#111',
  },
  keyLetters: {
    fontSize: 9,
    color: '#777',
    marginTop: -2,
    letterSpacing: 1.5,
  },
});

export default OTPScreen;
