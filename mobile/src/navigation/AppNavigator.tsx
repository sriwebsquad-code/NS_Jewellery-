import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../constants/Colors';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import CreateMPINScreen from '../screens/auth/CreateMPINScreen';
import LoginMPINScreen from '../screens/auth/LoginMPINScreen';
import ForgotMpinScreen from '../screens/auth/ForgotMpinScreen';
import DrawerNavigator from './DrawerNavigator';
import PaymentScreen from '../screens/main/PaymentScreen';
import PaymentSuccessScreen from '../screens/main/PaymentSuccessScreen';
import JewelleryDetailScreen from '../screens/main/JewelleryDetailScreen';
import LiveRateScreen from '../screens/main/LiveRateScreen';
import WalletScreen from '../screens/main/WalletScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import AadharVerificationScreen from '../screens/main/AadharVerificationScreen';
import PanVerificationScreen from '../screens/main/PanVerificationScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import TermsPrivacyScreen from '../screens/main/TermsPrivacyScreen';

import RegistrationScreen from '../screens/auth/RegistrationScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isLoggedIn, hasMpin, user, lastActiveAt, logout } = useAuthStore();
  const { mode } = useThemeStore();

  const { updateActivity } = useAuthStore();

  useEffect(() => {
    const checkExpiry = () => {
      if (isLoggedIn && lastActiveAt) {
        const fortyFiveDaysMs = 45 * 24 * 60 * 60 * 1000;
        if (Date.now() - lastActiveAt > fortyFiveDaysMs) {
          logout();
        } else {
          updateActivity();
        }
      }
    };

    checkExpiry();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkExpiry();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isLoggedIn, lastActiveAt]);

  const CustomDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background,
      text: Colors.light.text,
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      text: Colors.dark.text,
    },
  };

  return (
    <NavigationContainer theme={mode === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
          </>
        ) : user?.isNewUser ? (
          <Stack.Screen name="Registration" component={RegistrationScreen} />
        ) : !hasMpin ? (
          <Stack.Screen name="CreateMPIN" component={CreateMPINScreen} />
        ) : (
          <>
            <Stack.Screen name="LoginMPIN" component={LoginMPINScreen} />
            <Stack.Screen name="Main" component={DrawerNavigator} />
            <Stack.Screen name="JewelleryDetail" component={JewelleryDetailScreen} />
            <Stack.Screen name="ForgotMpin" component={ForgotMpinScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="AadharVerification" component={AadharVerificationScreen} />
            <Stack.Screen name="PanVerification" component={PanVerificationScreen} />
            <Stack.Screen name="Live Rates" component={LiveRateScreen} />
            <Stack.Screen name="Notifications" component={NotificationScreen} />
            <Stack.Screen name="Gold Wallet" component={WalletScreen} initialParams={{ metalType: 'GOLD' }} />
            <Stack.Screen name="Silver Wallet" component={WalletScreen} initialParams={{ metalType: 'SILVER' }} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
