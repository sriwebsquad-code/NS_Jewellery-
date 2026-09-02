import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import * as Device from 'expo-device';
import { ShieldAlert } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
}

export default function SecurityBoundary({ children }: Props) {
  const [isSecure, setIsSecure] = useState<boolean | null>(null);
  const [violationType, setViolationType] = useState<string>('');

  useEffect(() => {
    checkSecurity();
  }, []);

  const checkSecurity = async () => {
    try {
      const isJailBroken = await Device.isRootedExperimentalAsync();
      
      if (isJailBroken) {
        setViolationType('ROOT');
        setIsSecure(false);
        return;
      }

      setIsSecure(true);
    } catch (error) {
      console.error('Security check failed:', error);
      // Fallback to secure so we don't accidentally block legitimate users if library fails
      setIsSecure(true);
    }
  };

  if (isSecure === null) {
    // Show nothing or a splash screen while checking
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Securing environment...</Text>
      </View>
    );
  }

  if (!isSecure) {
    return (
      <View style={styles.container}>
        <ShieldAlert size={80} color="#D32F2F" style={styles.icon} />
        
        <Text style={styles.title}>Security Alert</Text>
        
        {violationType === 'DEV_MODE' ? (
          <>
            <Text style={styles.description}>
              Developer Options are currently enabled on your device.
            </Text>
            <Text style={styles.instruction}>
              To protect your account and data, this application cannot run while Developer Options or USB Debugging is active. Please disable it in your device Settings to continue.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Your device appears to be rooted or jailbroken.
            </Text>
            <Text style={styles.instruction}>
              For your financial security, NS Mahaveer Jewellery does not support rooted or modified devices.
            </Text>
          </>
        )}

        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={checkSecurity}
        >
          <Text style={styles.retryButtonText}>Check Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  instruction: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#D4AF37', // Gold color to match theme
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
