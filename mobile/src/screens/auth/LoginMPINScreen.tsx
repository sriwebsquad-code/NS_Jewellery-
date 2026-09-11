import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Delete, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ENV } from '../../config/env';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const LoginMPINScreen = () => {
  const [mpin, setMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout, updateActivity, setLogin, user } = useAuthStore();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const handleLogin = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${ENV.API_URL}/auth/mpin/login`, {
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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFCF8" translucent={false} />
      
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

        <TouchableOpacity 
          style={[styles.button, (mpin.length !== 4 || loading) && styles.buttonDisabled]}
          disabled={mpin.length !== 4 || loading}
        >
          <LinearGradient
            colors={['#D5A539', '#A87313']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.gradientButton}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Lock color="#FFF" size={16} style={{ marginRight: 6 }} />
              <Text style={styles.buttonText}>{loading ? 'Unlocking...' : 'Unlock'}</Text>
            </View>
            {loading && <ActivityIndicator color="#fff" size="small" style={{ marginLeft: 8 }} />}
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider with Diamond */}
        <View style={styles.dividerContainer}>
           <View style={styles.dividerLine} />
           <View style={styles.diamond} />
           <View style={styles.dividerLine} />
        </View>

        {/* Forgot MPIN */}
        <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotMpin')}>
          <Text style={styles.forgotText}>Forgot MPIN?</Text>
        </TouchableOpacity>
        
        {/* Subtle Logout Option */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout / Use different account</Text>
        </TouchableOpacity>
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
                  <Delete color="#333" size={20} />
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
    backgroundColor: '#FDFCF8',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: width * 0.45,
    height: width * 0.45,
  },
  logo: {
    width: '100%',
    height: '100%',
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
    color: '#A67A27',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    gap: 12,
  },
  dotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D5A539',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D5A539',
  },
  button: {
    height: 48,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
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
    fontSize: 15,
    fontWeight: '600',
  },
  forgotBtn: {
    alignItems: 'center',
    marginBottom: 5,
  },
  forgotText: {
    color: '#A67A27',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#999',
    fontSize: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 40,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D5A539',
  },
  diamond: {
    width: 6,
    height: 6,
    backgroundColor: '#D5A539',
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 12,
  },
  keypadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    paddingTop: 5,
    paddingBottom: Platform.OS === 'ios' ? 20 : 15,
  },
  keypadButton: {
    width: '33.33%',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonInner: {
    width: 65,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFCF8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8D4A2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  keyNum: {
    fontSize: 24,
    fontWeight: '500',
    color: '#111',
  },
  keyLetters: {
    fontSize: 8,
    color: '#777',
    marginTop: -2,
    letterSpacing: 1.2,
  },
});

export default LoginMPINScreen;
