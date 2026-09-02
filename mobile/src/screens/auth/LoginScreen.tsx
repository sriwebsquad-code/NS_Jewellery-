import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Image, 
  StatusBar, 
  Dimensions,
  ImageBackground,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation<any>();

  const handleSendOTP = async () => {
    if (phone.length === 10) {
      try {
        const phoneNumber = `+91${phone}`;
        const response = await fetch('https://ns-jewellery.onrender.com/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phoneNumber })
        });
        
        navigation.navigate('OTP', { phone });
      } catch (error: any) {
        // Fallback for UI testing if backend is offline
        navigation.navigate('OTP', { phone });
      }
    } else {
      alert('Please enter a valid 10-digit phone number');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* 
        TODO: Uncomment the ImageBackground when you add 'login_bg.png' to your assets folder! 
        For now, it falls back to a plain cream background color.
      */}
      {/* <ImageBackground 
        source={require('../../../assets/login_bg.png')} 
        style={styles.container}
        resizeMode="cover"
      > */}
      <View style={[styles.container, { backgroundColor: '#FDFCF8' }]}>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image 
              source={require('../../../assets/new_logo.png')} 
              style={styles.logo} 
            />
          </View>

          {/* Text Section */}
          <View style={styles.textSection}>
            <Text style={styles.heading}>Welcome!</Text>
            <Text style={styles.subheading}>Login to continue</Text>
            
            {/* Small decorative diamond */}
            <View style={styles.decorativeLineContainer}>
              <View style={styles.shortLine} />
              <View style={styles.diamondSmall} />
              <View style={styles.shortLine} />
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.prefixContainer}>
                <Text style={styles.prefixText}>+91</Text>
                <ChevronDown color="#999" size={16} style={{ marginLeft: 4 }} />
              </View>
              <View style={styles.separator} />
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
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
                colors={['#D5A539', '#A87313']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Continue</Text>
                <ArrowRight color="#FFF" size={20} style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />

          {/* Trust Badges Section */}
          <View style={styles.trustSection}>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Certified & Trusted By</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.badgesRow}>
              <Image 
                source={require('../../../assets/trust_badges.png')} 
                style={{ width: '100%', height: 40, resizeMode: 'contain' }} 
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('TermsPrivacy')}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('TermsPrivacy')}>Privacy Policy</Text>
            </Text>
          </View>

        </ScrollView>
      </View>
      {/* </ImageBackground> */}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: height * 0.12,
    paddingBottom: 30,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    width: width * 0.54,
    height: width * 0.54,
    overflow: 'hidden',
    borderRadius: 30,
    alignSelf: 'center',
  },
  logo: {
    width: width * 0.62,
    height: width * 0.62,
    resizeMode: 'cover',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heading: {
    fontFamily: 'serif',
    fontSize: 34,
    fontWeight: 'bold',
    color: '#A67A27',
    marginBottom: 5,
  },
  subheading: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  decorativeLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  shortLine: {
    width: 30,
    height: 1,
    backgroundColor: '#D5A539',
  },
  diamondSmall: {
    width: 6,
    height: 6,
    backgroundColor: '#D5A539',
    transform: [{ rotate: '45deg' }],
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    borderRadius: 8,
    height: 55,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D5A539', // Gold border
  },
  prefixContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefixText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  separator: {
    width: 1,
    height: 30,
    backgroundColor: '#EAEAEA',
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
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  trustSection: {
    width: '100%',
    marginTop: 40,
    marginBottom: 30,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D5A539',
    opacity: 0.5,
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#555',
    fontSize: 13,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  badgePlaceholder: {
    width: width * 0.16,
    height: width * 0.16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  badgeText: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: '#D5A539',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
