import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeft, Edit2, Delete } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const OTPScreen = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(45);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phone, confirmation } = route.params || { phone: '9876543210', confirmation: null };
  const { setLogin, setUser } = useAuthStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (code: string) => {
    try {
      let payload: any = { phone, otp: code };
      
      if (confirmation?.verificationId === 'demo-123456') {
        if (code !== '123456') {
          alert('Invalid OTP. Use 123456 for demo.');
          setOtp('');
          return;
        }
      } else if (confirmation) {
        const userCredential = await confirmation.confirm(code);
        payload.idToken = await userCredential.user.getIdToken();
      }

      const response = await fetch('https://ns-jewellery.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data.user);
        setLogin(data.data.token, !data.data.user.mpin);
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
      const newOtp = otp + val;
      setOtp(newOtp);
      if (newOtp.length === 6) {
        handleVerify(newOtp);
      }
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#B8860B" size={24} />
        </TouchableOpacity>
      </View>
      
      {/* Logo */}
      <View style={styles.logoSection}>
        <Image 
          source={require('../../../assets/new_logo.png')} 
          style={styles.logo} 
        />
      </View>

      {/* Text Section */}
      <View style={styles.textSection}>
        <Text style={styles.heading}>Enter OTP</Text>
        <Text style={styles.subheading}>We have sent a 6-digit code to</Text>
        
        <View style={styles.phonePill}>
          <Text style={styles.phoneText}>📞 +91 {phone}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.editText}>Edit</Text>
            <Edit2 color="#B8860B" size={12} style={{marginLeft: 4}} />
          </TouchableOpacity>
        </View>
      </View>

      {/* OTP Boxes */}
      <View style={styles.otpContainer}>
        {renderOTPBoxes()}
      </View>

      <Text style={styles.resendText}>
        Resend OTP in <Text style={styles.timerText}>00:{timer < 10 ? `0${timer}` : timer}</Text>
      </Text>

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

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 20,
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    resizeMode: 'contain',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#B8860B',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: '#666',
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
  },
  phoneText: {
    fontSize: 13,
    color: '#666',
    marginRight: 10,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    fontSize: 13,
    color: '#B8860B',
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  otpBoxFocused: {
    borderColor: '#B8860B',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: '#B8860B',
    backgroundColor: '#FFFFFF',
  },
  otpText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
  },
  resendText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 30,
  },
  timerText: {
    color: '#B8860B',
    fontWeight: 'bold',
  },
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingBottom: 40,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  keypadButton: {
    width: '33.33%',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonInner: {
    width: 70,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  keyNum: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
  },
  keyLetters: {
    fontSize: 9,
    color: '#999',
    marginTop: -2,
    letterSpacing: 1,
  },
});

export default OTPScreen;
