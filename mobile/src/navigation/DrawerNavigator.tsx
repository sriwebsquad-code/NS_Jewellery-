import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from './CustomDrawer';
import BottomTabNavigator from './BottomTabNavigator';
import CatalogueScreen from '../screens/main/CatalogueScreen';
import MyAccountScreen from '../screens/main/MyAccountScreen';
import TermsPrivacyScreen from '../screens/main/TermsPrivacyScreen';
import ChangeMpinScreen from '../screens/main/ChangeMpinScreen';
import AboutUsScreen from '../screens/main/AboutUsScreen';
import ReturnPoliciesScreen from '../screens/main/ReturnPoliciesScreen';
import AdvanceBookingsScreen from '../screens/main/AdvanceBookingsScreen';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '80%',
        },
      }}
    >
      <Drawer.Screen name="MainTab" component={BottomTabNavigator} />
      <Drawer.Screen name="CatalogueScreen" component={CatalogueScreen} />
      <Drawer.Screen name="MyAccountScreen" component={MyAccountScreen} />
      <Drawer.Screen name="TermsPrivacyScreen" component={TermsPrivacyScreen} />
      <Drawer.Screen name="ChangeMpinScreen" component={ChangeMpinScreen} />
      <Drawer.Screen name="AboutUsScreen" component={AboutUsScreen} />
      <Drawer.Screen name="ReturnPoliciesScreen" component={ReturnPoliciesScreen} />
      <Drawer.Screen name="AdvanceBookingsScreen" component={AdvanceBookingsScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
