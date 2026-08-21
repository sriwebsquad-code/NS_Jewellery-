import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useThemeStore } from '../store/themeStore';

const NetworkBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // NetInfo can sometimes return null initially, we default to assuming connected until explicitly false
      if (state.isConnected !== null) {
        setIsConnected(state.isConnected);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isConnected === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <WifiOff size={80} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>No Internet Connection</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Please check your network settings and try again. This application requires an active internet connection to function.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    zIndex: 9999,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  }
});

export default NetworkBoundary;
