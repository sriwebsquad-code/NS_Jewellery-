import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/theme';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import CatalogueScreen from '../screens/main/CatalogueScreen';
import DigitalGoldScreen from '../screens/main/DigitalGoldScreen';
import DigitalSilverScreen from '../screens/main/DigitalSilverScreen';
import MyPlansScreen from '../screens/main/MyPlansScreen';

import { Home, BookOpen, Coins, Calendar, CircleDollarSign } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          paddingBottom: 5,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;
          if (route.name === 'Home') IconComponent = Home;
          else if (route.name === 'Jewellery') IconComponent = BookOpen;
          else if (route.name === 'Digi Gold') IconComponent = Coins;
          else if (route.name === 'Digi Silver') IconComponent = CircleDollarSign;
          else if (route.name === 'My Plans') IconComponent = Calendar;
          
          return IconComponent ? <IconComponent color={color} size={24} /> : null;
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
