import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { COLORS, SIZES } from '../constants/theme';
import { LogOut, Home, User, Calendar, BookOpen, FileText, Phone, RotateCcw, Lock, TrendingUp, Moon, Sun } from 'lucide-react-native';

const CustomDrawer = (props: any) => {
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 40 }}>
        {/* Header / Brand Area */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Customer'}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
        </View>

        {/* Custom Navigation Items */}
        <View style={styles.navSection}>
          <DrawerItem label="Home" icon={Home} isFocused={props.state.index === 0} onPress={() => props.navigation.navigate('MainTab')} />

          <DrawerItem label="My Account" icon={User} isFocused={false} onPress={() => props.navigation.navigate('MyAccountScreen')} />
          <DrawerItem label="My Digital Locker" icon={Lock} isFocused={false} onPress={() => props.navigation.navigate('MyLockerScreen')} />
          <DrawerItem label="Jewellery" icon={BookOpen} isFocused={props.state.index === 1} onPress={() => props.navigation.navigate('CatalogueScreen')} />
          <DrawerItem label="Terms & Privacy" icon={FileText} isFocused={false} onPress={() => props.navigation.navigate('TermsPrivacyScreen')} />
          <DrawerItem label="About us" icon={Phone} isFocused={false} onPress={() => props.navigation.navigate('AboutUsScreen')} />
          <DrawerItem label="Return Policies" icon={RotateCcw} isFocused={false} onPress={() => props.navigation.navigate('ReturnPoliciesScreen')} />
          <DrawerItem label="Change MPIN" icon={Lock} isFocused={false} onPress={() => props.navigation.navigate('ChangeMpinScreen')} />
          {((user as any)?.role === 'ADMIN') && (
            <DrawerItem label="Admin Panel" icon={User} isFocused={false} onPress={() => props.navigation.navigate('AdminDashboard')} />
          )}
        </View>

      </DrawerContentScrollView>

      <View style={styles.themeToggleContainer}>
        <View style={styles.themeToggleLeft}>
          {mode === 'dark' ? <Moon color={COLORS.white} size={20} /> : <Sun color={COLORS.white} size={20} />}
          <Text style={styles.themeToggleText}>Dark Mode</Text>
        </View>
        <Switch 
          value={mode === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: '#767577', true: COLORS.primary }}
          thumbColor={mode === 'dark' ? '#FFF' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <LogOut color={COLORS.white} size={20} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const DrawerItem = ({ label, icon: Icon, isFocused, onPress }: any) => {
  return (
    <TouchableOpacity style={[styles.drawerItem, isFocused && styles.drawerItemFocused]} onPress={onPress}>
      <View style={[styles.activeIndicator, isFocused && styles.activeIndicatorVisible]} />
      <View style={styles.drawerItemContent}>
        <Icon color={COLORS.white} size={20} />
        <Text style={styles.drawerItemText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userPhone: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  navSection: {
    marginTop: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 5,
  },
  drawerItemFocused: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeIndicator: {
    width: 4,
    height: '100%',
    backgroundColor: 'transparent',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  activeIndicatorVisible: {
    backgroundColor: COLORS.primary,
  },
  drawerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  drawerItemText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleText: {
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  }
});

export default CustomDrawer;
