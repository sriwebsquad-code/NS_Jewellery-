import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import NetworkBoundary from './src/components/NetworkBoundary';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar hidden={true} translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      <NetworkBoundary>
        <AppNavigator />
      </NetworkBoundary>
    </SafeAreaProvider>
  );
}
