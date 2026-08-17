import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Menu, User, Mail, FileText, CheckCircle2 } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { COLORS } from '../../constants/theme';

const MyAccountScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore() as any;
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Account</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: colors.cardBackground, shadowColor: mode === 'dark' ? '#000' : COLORS.black }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'C'}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'Customer'}</Text>
          <Text style={[styles.phone, { color: colors.textMuted }]}>{user?.phone || '+91 9876543210'}</Text>
        </View>

        <View style={[styles.detailsContainer, { backgroundColor: colors.cardBackground, shadowColor: mode === 'dark' ? '#000' : COLORS.black }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Details</Text>
          
          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: mode === 'dark' ? 'rgba(253, 216, 53, 0.1)' : 'rgba(92, 10, 16, 0.1)' }]}>
              <User color={colors.primary} size={20} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Full Name</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.name || 'Customer Name'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: mode === 'dark' ? 'rgba(253, 216, 53, 0.1)' : 'rgba(92, 10, 16, 0.1)' }]}>
              <Mail color={colors.primary} size={20} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Email Address (Gmail)</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.email || 'customer@gmail.com'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: mode === 'dark' ? 'rgba(253, 216, 53, 0.1)' : 'rgba(92, 10, 16, 0.1)' }]}>
              <FileText color={colors.primary} size={20} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Aadhar Verification</Text>
              <View style={styles.verificationBadge}>
                <CheckCircle2 color={COLORS.success} size={16} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'serif',
    color: COLORS.black,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  detailsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)', // Light primary
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 174, 96, 0.1)', // Light success
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  }
});

export default MyAccountScreen;
