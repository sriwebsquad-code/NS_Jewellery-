import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CreateMPINScreen = () => {
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const setMpinCreated = useAuthStore((state) => state.setMpinCreated);
  const token = useAuthStore((state) => state.token);
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  const mpinInputRef = useRef<TextInput>(null);
  const confirmMpinInputRef = useRef<TextInput>(null);

  const handleCreate = async () => {
    if (mpin === confirmMpin) {
      setLoading(true);
      try {
        const response = await fetch('https://ns-jewellery.onrender.com/api/auth/mpin/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ mpin })
        });
        const data = await response.json();
        
        if (data.success) {
          setMpinCreated();
        } else {
          alert(data.message || 'Failed to create MPIN');
        }
      } catch (error) {
        alert('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('MPINs do not match');
    }
  };

  const isValid = mpin.length === 4 && confirmMpin.length === 4;

  const renderBoxes = (value: string, onPress: () => void) => {
    const boxes = [];
    for (let i = 0; i < 4; i++) {
      const hasValue = value.length > i;
      boxes.push(
        <TouchableOpacity 
          key={i} 
          style={[styles.box, hasValue ? styles.boxFilled : null]}
          onPress={onPress}
          activeOpacity={1}
        >
          {hasValue && <View style={styles.dot} />}
        </TouchableOpacity>
      );
    }
    return <View style={styles.boxesContainer}>{boxes}</View>;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FDFDFD' }]}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Secure Your Account</Text>
          <Text style={styles.subtitle}>Create a 4-digit MPIN for quick access</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Enter 4-Digit MPIN</Text>
          {renderBoxes(mpin, () => mpinInputRef.current?.focus())}
          <TextInput
            ref={mpinInputRef}
            style={styles.hiddenInput}
            keyboardType="numeric"
            maxLength={4}
            value={mpin}
            onChangeText={(val) => {
              setMpin(val);
              if (val.length === 4) confirmMpinInputRef.current?.focus();
            }}
          />

          <Text style={styles.label}>Confirm MPIN</Text>
          {renderBoxes(confirmMpin, () => confirmMpinInputRef.current?.focus())}
          <TextInput
            ref={confirmMpinInputRef}
            style={styles.hiddenInput}
            keyboardType="numeric"
            maxLength={4}
            value={confirmMpin}
            onChangeText={setConfirmMpin}
          />

          <View style={styles.infoBox}>
            <ShieldCheck color="#555" size={24} style={{ marginRight: 12 }} />
            <Text style={styles.infoText}>
              Your MPIN keeps your account safe and secure.{'\n'}Do not share your MPIN with anyone.
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity 
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={!isValid || loading}
          >
            {isValid ? (
              <LinearGradient
                colors={['#D5A539', '#B8860B']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Set MPIN & Continue'}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.gradientButton, { backgroundColor: '#E0E0E0' }]}>
                <Text style={styles.buttonTextDisabled}>Set MPIN & Continue</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    color: '#B8860B',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#555',
    fontSize: 15,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 25,
  },
  label: {
    fontSize: 15,
    color: '#000',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 35,
  },
  box: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#D5A539',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  boxFilled: {
    backgroundColor: '#FFFFFF',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D5A539',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F9F4EB',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    color: '#555',
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    width: '100%',
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 1,
  },
  gradientButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateMPINScreen;
