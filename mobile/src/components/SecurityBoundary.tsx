import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Device from 'expo-device';
import { ShieldAlert } from 'lucide-react-native';

interface Props {
  children: React.ReactNode;
}

export default function SecurityBoundary({ children }: Props) {
  const [isSecure, setIsSecure] = useState<boolean>(true);
  const [violationType, setViolationType] = useState<string>('');

  useEffect(() => {
    checkSecurity();
  }, []);

  const checkSecurity = async () => {
    let timeoutId: NodeJS.Timeout;
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Timeout')), 3000);
      });

      const securityChecks = async () => {
        const isJailBroken = await Device.isRootedExperimentalAsync();
        
        if (isJailBroken) {
          return { violation: 'ROOT' };
        }
        
        return { violation: null };
      };

      const result: any = await Promise.race([securityChecks(), timeoutPromise]);
      clearTimeout(timeoutId!);

      if (result.violation) {
        setViolationType(result.violation);
        setIsSecure(false);
      }
    } catch (error) {
      clearTimeout(timeoutId!);
      console.error('Security check failed/timed out:', error);
      // Fail open: don't lock the user out if the library hangs or fails
    }
  };

  if (!isSecure) {
    return (
      <View style={styles.container}>
        <ShieldAlert size={80} color="#D32F2F" style={styles.icon} />
        
        <Text style={styles.title}>Security Alert</Text>
        
        <Text style={styles.description}>
          Your device appears to be rooted or jailbroken.
        </Text>
        <Text style={styles.instruction}>
          For your financial security, NS Mahaveer Jewellery does not support rooted or modified devices.
        </Text>

        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setIsSecure(true);
            setTimeout(checkSecurity, 1000);
          }}
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
