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
        tabBarActiveTintColor: '#D4AF37',
        tabBarInactiveTintColor: mode === 'dark' ? colors.textMuted : '#8C7A6B',
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: mode === 'dark' ? colors.backgroundSecondary : '#FDFCF8',
          borderTopWidth: 1,
          borderTopColor: mode === 'dark' ? colors.border : '#EAEAEA',
          height: 65,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
          fontFamily: 'sans-serif',
          fontWeight: '700',
        },
        tabBarIndicatorStyle: {
          backgroundColor: '#D4AF37',
          height: 3,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        },
        tabBarIcon: ({ focused, color, size = 24 }: any) => {
          let IconComponent;
          if (route.name === 'Home') IconComponent = Home;
          else if (route.name === 'Jewellery') IconComponent = BookOpen;
          else if (route.name === 'Digi Gold') {
            return (
              <Image 
                source={require('../../assets/premium_gold_coin_3d.jpg')} 
                style={{ width: size, height: size, borderRadius: size/2, opacity: focused ? 1 : 0.6 }} 
              />
            );
          }
          else if (route.name === 'Digi Silver') {
            return (
              <Image 
                source={require('../../assets/premium_silver_coin_3d.jpg')} 
                style={{ width: size, height: size, borderRadius: size/2, opacity: focused ? 1 : 0.6 }} 
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
