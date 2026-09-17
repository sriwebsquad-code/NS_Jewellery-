import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Menu, User, Mail, FileText, CheckCircle2, Calendar, MapPin, UserCircle2, Edit2, X } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { COLORS } from '../../constants/theme';
import { ENV } from '../../config/env';

const MyAccountScreen = () => {
  const navigation = useNavigation<any>();
  const { user, token, updateUser } = useAuthStore() as any;
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formName, setFormName] = React.useState(user?.name || '');
  const [formEmail, setFormEmail] = React.useState(user?.email || '');
  const [formDob, setFormDob] = React.useState(user?.dob || '');
  const [formGender, setFormGender] = React.useState(user?.gender || '');
  const [formAddress, setFormAddress] = React.useState(user?.address || '');
  const [formState, setFormState] = React.useState(user?.state || '');
  const [formPincode, setFormPincode] = React.useState(user?.pincode || '');

  // Keep editForm as a derived object for save handler
  const editForm = { name: formName, email: formEmail, dob: formDob, gender: formGender, address: formAddress, state: formState, pincode: formPincode };
  
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [date, setDate] = React.useState(user?.dob ? new Date(user.dob) : new Date());

  const openEditModal = () => {
    // Reset all individual fields from latest user data when opening
    setFormName(user?.name || '');
    setFormEmail(user?.email || '');
    setFormDob(user?.dob || '');
    setFormGender(user?.gender || '');
    setFormAddress(user?.address || '');
    setFormState(user?.state || '');
    setFormPincode(user?.pincode || '');
    setDate(user?.dob ? new Date(user.dob) : new Date());
    setIsEditModalVisible(true);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setFormDob(`${year}-${month}-${day}`);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${ENV.API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (data.success) {
        updateUser(editForm);
        setIsEditModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Account</Text>
        <TouchableOpacity onPress={() => openEditModal()}>
          <Edit2 color={colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Email Address</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.email || 'Not Provided'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: mode === 'dark' ? 'rgba(253, 216, 53, 0.1)' : 'rgba(92, 10, 16, 0.1)' }]}>
              <Calendar color={colors.primary} size={20} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Date of Birth</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.dob || 'Not Provided'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: mode === 'dark' ? 'rgba(253, 216, 53, 0.1)' : 'rgba(92, 10, 16, 0.1)' }]}>
              <UserCircle2 color={colors.primary} size={20} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Gender</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.gender || 'Not Provided'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: mode === 'dark' ? 'rgba(253, 216, 53, 0.1)' : 'rgba(92, 10, 16, 0.1)' }]}>
              <MapPin color={colors.primary} size={20} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Address</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.address || 'Not Provided'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: mode === 'dark' ? 'rgba(253, 216, 53, 0.1)' : 'rgba(92, 10, 16, 0.1)' }]}>
              <MapPin color={colors.primary} size={20} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>State</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.state || 'Not Provided'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: mode === 'dark' ? 'rgba(253, 216, 53, 0.1)' : 'rgba(92, 10, 16, 0.1)' }]}>
              <MapPin color={colors.primary} size={20} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Pincode</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{user?.pincode || 'Not Provided'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: mode === 'dark' ? 'rgba(253, 216, 53, 0.1)' : 'rgba(92, 10, 16, 0.1)' }]}>
              <FileText color={colors.primary} size={20} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Aadhar Verification</Text>
              {user?.kycStatus === 'VERIFIED' ? (
                <View style={styles.verificationBadge}>
                  <CheckCircle2 color={COLORS.success} size={16} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.verificationBadge, { backgroundColor: 'rgba(255, 99, 71, 0.1)' }]}
                  onPress={() => navigation.navigate('AadharVerification')}
                >
                  <Text style={[styles.verifiedText, { color: 'tomato' }]}>Verify Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: mode === 'dark' ? 'rgba(253, 216, 53, 0.1)' : 'rgba(92, 10, 16, 0.1)' }]}>
              <FileText color={colors.primary} size={20} />
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>PAN Verification</Text>
              {user?.panStatus === 'VERIFIED' ? (
                <View style={styles.verificationBadge}>
                  <CheckCircle2 color={COLORS.success} size={16} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.verificationBadge, { backgroundColor: 'rgba(255, 99, 71, 0.1)' }]}
                  onPress={() => {
                    if (user?.kycStatus !== 'VERIFIED') {
                      Alert.alert('Verification Required', 'Please verify your Aadhaar first before verifying your PAN.');
                    } else {
                      navigation.navigate('PanVerification');
                    }
                  }}
                >
                  <Text style={[styles.verifiedText, { color: 'tomato' }]}>Verify Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
              style={{ width: '100%' }}
            >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name *</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <User color={COLORS.primary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, { color: colors.text }]}
                    value={formName}
                    onChangeText={setFormName}
                    returnKeyType="next"
                  />
                </View>
                
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address (optional)</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <Mail color={COLORS.primary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.inputField, { color: colors.text }]}
                    value={formEmail}
                    onChangeText={setFormEmail}
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                </View>
                
                <Text style={[styles.inputLabel, { color: colors.text }]}>Date of Birth *</Text>
                <TouchableOpacity style={[styles.inputContainer, { borderColor: colors.border }]} onPress={() => setShowDatePicker(true)}>
                  <Calendar color={COLORS.primary} size={20} style={styles.inputIcon} />
                  <Text style={[styles.inputField, { color: formDob ? colors.text : colors.textMuted, paddingTop: Platform.OS === 'ios' ? 0 : 2, textAlignVertical: 'center' }]}>
                    {formDob || 'YYYY-MM-DD'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                    maximumDate={new Date()}
                  />
                )}
                
                <Text style={[styles.inputLabel, { color: colors.text }]}>Gender *</Text>
                <View style={styles.genderContainer}>
                  {(['Male', 'Female', 'Other'] as string[]).map(g => (
                    <TouchableOpacity 
                      key={g} 
                      style={[styles.genderBtn, { borderColor: colors.border }, formGender === g && styles.genderBtnSelected]}
                      onPress={() => setFormGender(g)}
                    >
                      <Text style={[styles.genderText, { color: colors.text }, formGender === g && styles.genderTextSelected]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={[styles.inputLabel, { color: colors.text }]}>Address *</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border, alignItems: 'flex-start', minHeight: 80 }]}>
                  <MapPin color={COLORS.primary} size={20} style={[styles.inputIcon, { marginTop: 14 }]} />
                  <TextInput
                    style={[styles.inputField, { color: colors.text, height: 70, textAlignVertical: 'top', paddingTop: 12 }]}
                    value={formAddress}
                    onChangeText={setFormAddress}
                    multiline={true}
                    numberOfLines={3}
                    blurOnSubmit={true}
                  />
                </View>
                
                <Text style={[styles.inputLabel, { color: colors.text }]}>State *</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border, minHeight: 48 }]}>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, paddingLeft: 15, height: 48 }]}
                    value={formState}
                    onChangeText={setFormState}
                    placeholder="Enter state"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
                
                <Text style={[styles.inputLabel, { color: colors.text }]}>Pincode *</Text>
                <View style={[styles.inputContainer, { borderColor: colors.border, minHeight: 48 }]}>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, paddingLeft: 15, height: 48 }]}
                    value={formPincode}
                    onChangeText={setFormPincode}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </View>
                
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'serif',
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: colors.text,
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
    color: colors.cardBackground,
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: colors.textMuted,
  },
  detailsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: colors.text,
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
    color: colors.textMuted,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 15,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  genderTextSelected: {
    color: COLORS.white,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  saveBtnText: {
    color: colors.cardBackground,
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default MyAccountScreen;
