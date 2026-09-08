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

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <StatusBar hidden={true} translucent={true} backgroundColor="transparent" barStyle="dark-content" />
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
