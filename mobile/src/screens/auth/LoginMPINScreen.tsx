import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, Dimensions, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Delete, ChevronLeft } from 'lucide-react-native';
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : logout()}
        >
          <ChevronLeft color="#D5A539" size={24} />
        </TouchableOpacity>
      </View>
      
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

        {/* Unlock Button */}
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
            <Text style={styles.buttonText}>{loading ? 'Unlocking...' : 'Unlock'}</Text>
          </LinearGradient>
        </TouchableOpacity>

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
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -20,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
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
    color: '#A67A27',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 35,
    gap: 15,
  },
  dotOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#D5A539',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D5A539',
  },
  button: {
    height: 55,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 25,
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
    fontWeight: '600',
  },
  forgotBtn: {
    alignItems: 'center',
    marginBottom: 10,
  },
  forgotText: {
    color: '#A67A27',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    alignItems: 'center',
    marginTop: 15,
  },
  logoutText: {
    color: '#AAA',
    fontSize: 12,
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

export default LoginMPINScreen;
