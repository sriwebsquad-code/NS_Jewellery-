import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Delete } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LoginMPINScreen = () => {
  const [mpin, setMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout, updateActivity, setLogin, user } = useAuthStore();
  const navigation = useNavigation<any>();

  const handleLogin = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://ns-jewellery.onrender.com/api/auth/mpin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user?.phone, mpin: code })
      });
      const data = await response.json();
      
      if (data.success) {
        setLogin(data.data.token, true, data.data.user);
        updateActivity();
        navigation.replace('Main');
      } else {
        alert(data.message || 'Incorrect MPIN');
        setMpin('');
      }
    } catch (error) {
      alert('Network error. Please try again.');
      setMpin('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (val: string) => {
    if (mpin.length < 4) {
      const newMpin = mpin + val;
      setMpin(newMpin);
      if (newMpin.length === 4) {
        handleLogin(newMpin);
      }
    }
  };

  const handleBackspace = () => {
    if (mpin.length > 0) {
      setMpin(mpin.slice(0, -1));
    }
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
      
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../../../assets/new_logo.png')} 
            style={styles.logo} 
          />
        </View>

        {/* Text Section */}
        <View style={styles.textSection}>
          <Text style={styles.heading}>Welcome Back!</Text>
          <Text style={styles.subheading}>Enter your MPIN to unlock</Text>
        </View>

        {/* MPIN Dots Indicator */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = mpin.length > index;
            return (
              <View key={index} style={styles.dotOuter}>
                {isFilled && <View style={styles.dotInner} />}
              </View>
            );
          })}
        </View>

        {/* Unlock Button */}
        <TouchableOpacity 
          style={[styles.button, (mpin.length !== 4 || loading) && styles.buttonDisabled]}
          disabled={mpin.length !== 4 || loading}
        >
          <LinearGradient
            colors={['#D4AF37', '#AA771C']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>{loading ? 'Unlocking...' : 'Unlock App'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Forgot MPIN */}
        <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotMpin')}>
          <Text style={styles.forgotText}>Forgot MPIN?</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerIcon}>✧</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout / Use different account</Text>
        </TouchableOpacity>

      </ScrollView>

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
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: height * 0.08,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
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
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 15,
  },
  dotOuter: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 1,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#B8860B',
  },
  button: {
    height: 55,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
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
  forgotBtn: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotText: {
    color: '#B8860B',
    fontSize: 14,
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerIcon: {
    marginHorizontal: 15,
    color: '#D4AF37',
    fontSize: 14,
  },
  logoutBtn: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    color: '#666',
    fontSize: 13,
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
    marginTop: 10,
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

export default LoginMPINScreen;
