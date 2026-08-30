import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Menu, User, Mail, FileText, CheckCircle2, Calendar, MapPin, UserCircle2, Edit2, X, ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { COLORS } from '../../constants/theme';

const MyAccountScreen = () => {
  const navigation = useNavigation<any>();
  const { user, token, updateUser } = useAuthStore() as any;
  const { mode } = useThemeStore();
  
  // Custom colors matching the mockup
  const bgColor = '#F8EFEA'; // Light beige background
  const cardColor = '#FFFFFF';
  const iconBgColor = '#FDF3E7'; // Light orange/gold for icon background
  const iconColor = '#D4AF37'; // Gold
  const labelColor = '#9E9E9E';
  const valueColor = '#212121';
  const verifyBgColor = '#FCEAE8'; // Light pink
  const verifyTextColor = '#F05A4A'; // Orange/Tomato

  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    address: user?.address || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('https://ns-jewellery.onrender.com/api/user/profile', {
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

  const DetailRow = ({ icon: Icon, label, value, isVerification = false, isVerified = false, onVerify }: any) => (
    <View style={styles.detailRow}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Icon color={iconColor} size={22} strokeWidth={1.5} />
      </View>
      <View style={styles.detailInfo}>
        <Text style={[styles.detailLabel, { color: labelColor }]}>{label}</Text>
        {!isVerification ? (
          <Text style={[styles.detailValue, { color: valueColor }]}>{value}</Text>
        ) : (
          isVerified ? (
            <View style={styles.verificationBadge}>
              <CheckCircle2 color={COLORS.success} size={16} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.verificationBadge, { backgroundColor: verifyBgColor }]}
              onPress={onVerify}
            >
              <Text style={[styles.verifyNowText, { color: verifyTextColor }]}>Verify Now</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.openDrawer()} style={styles.backBtn}>
          <ChevronLeft color={COLORS.black} size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          setEditForm({
            name: user?.name || '',
            email: user?.email || '',
            dob: user?.dob || '',
            gender: user?.gender || '',
            address: user?.address || '',
            state: user?.state || '',
            pincode: user?.pincode || '',
          });
          setIsEditModalVisible(true);
        }}>
          <Edit2 color={iconColor} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Text style={styles.cardTitle}>Account Details</Text>
          
          <DetailRow icon={User} label="Full Name" value={user?.name || 'Customer Name'} />
          <DetailRow icon={Mail} label="Email Address" value={user?.email || 'Not Provided'} />
          <DetailRow icon={Calendar} label="Date of Birth" value={user?.dob || 'Not Provided'} />
          <DetailRow icon={UserCircle2} label="Gender" value={user?.gender || 'Not Provided'} />
          <DetailRow icon={MapPin} label="Address" value={user?.address || 'Not Provided'} />
          <DetailRow icon={MapPin} label="State" value={user?.state || 'Not Provided'} />
          <DetailRow icon={MapPin} label="Pincode" value={user?.pincode || 'Not Provided'} />
          
          <DetailRow 
            icon={FileText} 
            label="Aadhar Verification" 
            isVerification={true} 
            isVerified={user?.kycStatus === 'VERIFIED'}
            onVerify={() => navigation.navigate('AadharVerification')}
          />
          
          <DetailRow 
            icon={FileText} 
            label="PAN Verification" 
            isVerification={true} 
            isVerified={user?.panStatus === 'VERIFIED'}
            onVerify={() => navigation.navigate('PanVerification')}
          />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <X color={COLORS.black} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput style={styles.input} value={editForm.name} onChangeText={(t) => setEditForm({...editForm, name: t})} />
              
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput style={styles.input} value={editForm.email} onChangeText={(t) => setEditForm({...editForm, email: t})} keyboardType="email-address" />
              
              <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={editForm.dob} onChangeText={(t) => setEditForm({...editForm, dob: t})} />
              
              <Text style={styles.inputLabel}>Gender</Text>
              <TextInput style={styles.input} value={editForm.gender} onChangeText={(t) => setEditForm({...editForm, gender: t})} />
              
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput style={styles.input} value={editForm.address} onChangeText={(t) => setEditForm({...editForm, address: t})} multiline />
              
              <Text style={styles.inputLabel}>State</Text>
              <TextInput style={styles.input} value={editForm.state} onChangeText={(t) => setEditForm({...editForm, state: t})} />
              
              <Text style={styles.inputLabel}>Pincode</Text>
              <TextInput style={styles.input} value={editForm.pincode} onChangeText={(t) => setEditForm({...editForm, pincode: t})} keyboardType="number-pad" />
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  backBtn: {
    padding: 5,
  },
  content: {
    padding: 15,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'cursive', // Handwritten/playful feel
    color: '#000',
    marginBottom: 30,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  detailInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'cursive',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'cursive',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  verifyNowText: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'cursive',
  },
  verifiedText: {
    color: COLORS.success,
    fontSize: 13,
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
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default MyAccountScreen;
