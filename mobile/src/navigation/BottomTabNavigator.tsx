import React from 'react';
import { Image } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Colors } from '../constants/Colors';
import { useThemeStore } from '../store/themeStore';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import CatalogueScreen from '../screens/main/CatalogueScreen';
import DigitalGoldScreen from '../screens/main/DigitalGoldScreen';
import DigitalSilverScreen from '../screens/main/DigitalSilverScreen';
import MyPlansScreen from '../screens/main/MyPlansScreen';

import { Home, BookOpen, Coins, Calendar, CircleDollarSign } from 'lucide-react-native';

const Tab = createMaterialTopTabNavigator();

const BottomTabNavigator = () => {
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
        },
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          top: 0,
        },
        tabBarIcon: ({ focused, color, size = 24 }: any) => {
          let IconComponent;
          if (route.name === 'Home') IconComponent = Home;
          else if (route.name === 'Jewellery') IconComponent = BookOpen;
          else if (route.name === 'Digi Gold') {
            return (
              <Image 
                source={require('../../assets/gold_coin.png')} 
                style={{ width: size, height: size, resizeMode: 'contain', opacity: focused ? 1 : 0.6 }} 
              />
            );
          }
          else if (route.name === 'Digi Silver') {
            return (
              <Image 
                source={require('../../assets/silver_coin.png')} 
                style={{ width: size, height: size, resizeMode: 'contain', opacity: focused ? 1 : 0.6 }} 
              />
            );
          }
          else if (route.name === 'My Plans') IconComponent = Calendar;
          
          return IconComponent ? <IconComponent color={color} size={24} /> : <></>;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Jewellery" component={CatalogueScreen} />
      <Tab.Screen name="Digi Gold" component={DigitalGoldScreen} />
      <Tab.Screen name="Digi Silver" component={DigitalSilverScreen} />
      <Tab.Screen name="My Plans" component={MyPlansScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
