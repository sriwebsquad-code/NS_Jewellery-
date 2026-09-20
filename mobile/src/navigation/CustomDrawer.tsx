import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { COLORS } from '../constants/theme';
import { LogOut, Home, User, BookOpen, FileText, Phone, RotateCcw, Lock, Moon, Sun, ChevronRight } from 'lucide-react-native';

const CustomDrawer = (props: any) => {
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();

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
            <Text style={styles.dividerIcon}>🪷</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        {/* Custom Navigation Items */}
        <View style={styles.navSection}>
          <DrawerItem label="Home" icon={Home} isFocused={props.state.index === 0} onPress={() => props.navigation.navigate('MainTab')} />

          <DrawerItem label="My Account" icon={User} isFocused={false} onPress={() => props.navigation.navigate('MyAccountScreen')} />
          <DrawerItem label="My Savings" icon={Lock} isFocused={false} onPress={() => props.navigation.navigate('MyLockerScreen')} />
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

      <View style={{ paddingHorizontal: 15, paddingBottom: 20 }}>
        <View style={styles.developerContainer}>
          <Text style={styles.developerText}>
            Developed By: <Text style={styles.textBlack}>Sri Web Squad</Text>
          </Text>
        </View>

        <View style={[styles.drawerItem, { backgroundColor: '#FDFCF8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }]}>
          <View style={styles.drawerItemContent}>
            {mode === 'dark' ? <Moon color={'#C89F7A'} size={20} /> : <Sun color={'#C89F7A'} size={20} />}
            <Text style={[styles.drawerItemText, { flex: 1 }]}>Dark Mode</Text>
            <Switch 
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#EAEAEA', true: '#D4AF37' }}
              thumbColor={mode === 'dark' ? '#FFF' : '#FFF'}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.drawerItem, { backgroundColor: '#FDFCF8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }]} 
          onPress={logout}
        >
          <View style={styles.drawerItemContent}>
            <LogOut color={'#C89F7A'} size={20} />
            <Text style={[styles.drawerItemText, { flex: 1 }]}>Logout</Text>
            <ChevronRight color={'#C89F7A'} size={16} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DrawerItem = ({ label, icon: Icon, isFocused, onPress }: any) => {
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
        <Icon color={'#C89F7A'} size={20} />
        <Text style={[styles.drawerItemText, { flex: 1 }]}>{label}</Text>
        <ChevronRight color={'#C89F7A'} size={16} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCF8', // Premium warm cream
  },
  cardBgPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    opacity: 0.1,
    resizeMode: 'contain',
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
    color: '#4A3424',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  userPhone: {
    color: '#6A4C25',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginTop: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4AF37',
    opacity: 0.5,
  },
  dividerIcon: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  navSection: {
    paddingHorizontal: 15,
  },
  drawerItem: {
    backgroundColor: '#FDFCF8',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
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
    color: '#4A3424',
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
    color: '#888',
    fontWeight: '500',
  },
  textBlack: {
    color: '#4A3424',
    fontWeight: 'bold',
    fontSize: 11,
  }
});

export default CustomDrawer;
