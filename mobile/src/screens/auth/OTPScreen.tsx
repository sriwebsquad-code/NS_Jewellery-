import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, StatusBar, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const OTPScreen = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(45);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phone, confirmation } = route.params;
  const { setLogin, setUser } = useAuthStore();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    try {
      let payload: any = { phone, otp };
      
      if (confirmation.verificationId === 'demo-123456') {
        if (otp !== '123456') {
          alert('Invalid OTP. Use 123456 for demo.');
          return;
        }
      } else {
        const userCredential = await confirmation.confirm(otp);
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
      }
    } catch (error: any) {
      alert('Error: ' + (error.message || JSON.stringify(error)));
      console.error(error);
    }
  };

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  // Render 6 OTP boxes
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF8F0" />
      
      <LinearGradient
        colors={['#F9F1E2', '#FCF9F2', '#FDF8F0']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.logoSection}>
          <Image 
            source={require('../../../assets/new_logo.png')} 
            style={styles.logo} 
          />
        </View>

        <View style={styles.textSection}>
          <Text style={styles.heading}>Verify OTP</Text>
          <Text style={styles.subheading}>Enter the 6-digit code sent to your number</Text>
        </View>

        <View style={styles.formContainer}>
          
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.otpContainer}
            onPress={() => inputRef.current?.focus()}
          >
            {renderOTPBoxes()}
          </TouchableOpacity>
          
          {/* Hidden text input to handle keyboard */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
            keyboardType="number-pad"
            autoFocus
          />

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <>
                <Text style={styles.resendText}>Resend OTP in </Text>
                <Text style={styles.timerText}>
                  00:{timer < 10 ? `0${timer}` : timer}
                </Text>
              </>
            ) : (
              <TouchableOpacity onPress={() => setTimer(45)}>
                <Text style={styles.resendButton}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
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
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.1,
    marginBottom: 40,
  },
  logo: {
    width: width * 0.65,
    height: width * 0.65,
    resizeMode: 'contain',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 14,
    color: '#555',
  },
  formContainer: {
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  otpBoxFocused: {
    borderColor: '#D4AF37',
    borderWidth: 1.5,
    backgroundColor: '#FFF',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFF',
  },
  otpText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#555',
  },
  timerText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  resendButton: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default OTPScreen;
