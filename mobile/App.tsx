import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import NetworkBoundary from './src/components/NetworkBoundary';
import SecurityBoundary from './src/components/SecurityBoundary';
import ErrorBoundary from './src/components/ErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';

// Removed artificial splash screen delay for faster startup

import { useThemeStore } from './src/store/themeStore';

export default function App() {
  const { mode } = useThemeStore();

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <StatusBar 
            translucent={true} 
            backgroundColor="transparent" 
            barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} 
          />
          <SecurityBoundary>
            <NetworkBoundary>
              <AppNavigator />
            </NetworkBoundary>
          </SecurityBoundary>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
