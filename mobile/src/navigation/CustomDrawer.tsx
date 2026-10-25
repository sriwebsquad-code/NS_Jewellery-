import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../constants/Colors';
import { LogOut, Home, User, BookOpen, FileText, Phone, RotateCcw, Lock, Moon, Sun, ChevronRight } from 'lucide-react-native';

const CustomDrawer = (props: any) => {
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 20 }}>
        {/* Header / Brand Area */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#D4AF37', '#A87B4C']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.name || 'Customer'}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.brandText}>NS Mahaveer Jewellery</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        {/* Custom Navigation Items */}
        <View style={styles.navSection}>
          <DrawerItem styles={styles} label="Home" icon={Home} isFocused={props.state.index === 0} onPress={() => props.navigation.navigate('MainTab')} />
          <DrawerItem styles={styles} label="My Account" icon={User} isFocused={false} onPress={() => props.navigation.navigate('MyAccountScreen')} />
          <DrawerItem styles={styles} label="My Savings" icon={Lock} isFocused={false} onPress={() => props.navigation.navigate('MyLockerScreen')} />
          <DrawerItem styles={styles} label="Jewellery" icon={BookOpen} isFocused={props.state.index === 1} onPress={() => props.navigation.navigate('CatalogueScreen')} />
          <DrawerItem styles={styles} label="Terms & Privacy" icon={FileText} isFocused={false} onPress={() => props.navigation.navigate('TermsPrivacyScreen')} />
          <DrawerItem styles={styles} label="About us" icon={Phone} isFocused={false} onPress={() => props.navigation.navigate('AboutUsScreen')} />
          <DrawerItem styles={styles} label="Return Policies" icon={RotateCcw} isFocused={false} onPress={() => props.navigation.navigate('ReturnPoliciesScreen')} />
          <DrawerItem styles={styles} label="Change MPIN" icon={Lock} isFocused={false} onPress={() => props.navigation.navigate('ChangeMpinScreen')} />
          {((user as any)?.role === 'ADMIN') && (
            <DrawerItem styles={styles} label="Admin Panel" icon={User} isFocused={false} onPress={() => props.navigation.navigate('AdminDashboard')} />
          )}
        </View>

      </DrawerContentScrollView>

      <View style={{ paddingHorizontal: 15, paddingBottom: 20 }}>
        <View style={styles.developerContainer}>
          <Text style={styles.developerText}>
            Developed By: <Text style={styles.textBlack}>Sri Web Squad</Text>
          </Text>
        </View>

        <View style={styles.drawerItem}>
          <View style={styles.drawerItemContent}>
            {mode === 'dark' ? <Moon color={'#D4AF37'} size={20} /> : <Sun color={'#C89F7A'} size={20} />}
            <Text style={[styles.drawerItemText, { flex: 1 }]}>Dark Mode</Text>
            <Switch 
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#EAEAEA', true: '#D4AF37' }}
              thumbColor={'#FFF'}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.drawerItem} 
          onPress={logout}
        >
          <View style={styles.drawerItemContent}>
            <LogOut color={colors.primary} size={20} />
            <Text style={[styles.drawerItemText, { flex: 1 }]}>Logout</Text>
            <ChevronRight color={colors.icon} size={16} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DrawerItem = ({ label, icon: Icon, isFocused, onPress, styles }: any) => {
  if (isFocused) {
    return (
      <TouchableOpacity onPress={onPress}>
        <LinearGradient
          colors={['#D4AF37', '#A87B4C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.drawerItemActive}
        >
          <View style={styles.drawerItemContent}>
            <Icon color={'#FFF'} size={20} />
            <Text style={[styles.drawerItemText, { color: '#FFF', flex: 1 }]}>{label}</Text>
            <ChevronRight color={'#FFF'} size={16} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
      <View style={styles.drawerItemContent}>
        <Icon color={'#D4AF37'} size={20} />
        <Text style={[styles.drawerItemText, { flex: 1 }]}>{label}</Text>
        <ChevronRight color={'#C89F7A'} size={16} />
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  userName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  userPhone: {
    color: colors.textMuted,
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginTop: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4AF37',
    opacity: 0.5,
  },
  brandText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#D4AF37',
    fontFamily: 'serif',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  navSection: {
    paddingHorizontal: 15,
  },
  drawerItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: mode === 'dark' ? 0.2 : 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  drawerItemActive: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  drawerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerItemText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '600',
  },
  developerContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  developerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  textBlack: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 11,
  }
});

export default CustomDrawer;
