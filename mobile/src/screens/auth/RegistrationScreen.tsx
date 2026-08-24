import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Dimensions } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, User, Mail, MapPin, Calendar, Users, Map } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const RegistrationScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dobStr, setDobStr] = useState('');
  
  const [gender, setGender] = useState('Male');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  
  const { token, updateUser } = useAuthStore() as any;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDob(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDobStr(formattedDate);
    }
  };

  const handleSaveProfile = async () => {
    if (!name || !email || !dobStr || !gender || !address || !state || !pincode) {
      alert('Please fill in all fields.');
      return;
    }
    
    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      alert('Please enter a valid 6-digit Pincode.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://ns-jewellery.onrender.com/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, address, dob: dobStr, gender, state, pincode })
      });
      const data = await response.json();
      
      if (data.success) {
        updateUser({ 
          name, 
          email, 
          address, 
          dob: dobStr,
          gender,
          state,
          pincode,
          isNewUser: false 
        });
      } else {
        alert('Failed to save profile details.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error while saving profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF8F0" />
      <LinearGradient
        colors={['#F9F1E2', '#FCF9F2', '#FDF8F0']}
        style={StyleSheet.absoluteFillObject}
      />
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerSection}>
            <Text style={styles.heading}>Welcome!</Text>
            <Text style={styles.subheading}>Please tell us a bit about yourself</Text>
          </View>

          <View style={styles.formCard}>
            
            <View style={styles.inputLabelContainer}><Text style={styles.inputLabel}>Full Name</Text></View>
            <View style={styles.inputContainer}>
              <User color="#D4AF37" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor="#999" value={name} onChangeText={setName} />
            </View>

            <View style={styles.inputLabelContainer}><Text style={styles.inputLabel}>Email Address</Text></View>
            <View style={styles.inputContainer}>
              <Mail color="#D4AF37" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            </View>
            
            <View style={styles.inputLabelContainer}><Text style={styles.inputLabel}>Date of Birth</Text></View>
            <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
              <Calendar color="#D4AF37" size={20} style={styles.inputIcon} />
              <Text style={[styles.input, { textAlignVertical: 'center', color: dobStr ? '#333' : '#999' }]}>
                {dobStr || 'Select Date of Birth'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dob}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            <View style={styles.inputLabelContainer}><Text style={styles.inputLabel}>Gender</Text></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity 
                  key={g} 
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputLabelContainer}><Text style={styles.inputLabel}>Address</Text></View>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <MapPin color="#D4AF37" size={20} style={[styles.inputIcon, {marginTop: 15}]} />
              <TextInput style={[styles.input, styles.textArea]} placeholder="Enter your full address" placeholderTextColor="#999" multiline numberOfLines={3} value={address} onChangeText={setAddress} />
            </View>

            <View style={styles.inputLabelContainer}><Text style={styles.inputLabel}>State</Text></View>
            <View style={[styles.inputContainer, { paddingRight: 0 }]}>
              <Map color="#D4AF37" size={20} style={styles.inputIcon} />
              <View style={{ flex: 1, marginLeft: -10 }}>
                <Picker
                  selectedValue={state}
                  onValueChange={(itemValue) => setState(itemValue)}
                  style={{ color: state ? '#333' : '#999', flex: 1 }}
                >
                  <Picker.Item label="Select State" value="" color="#999" />
                  <Picker.Item label="Andhra Pradesh" value="Andhra Pradesh" />
                  <Picker.Item label="Karnataka" value="Karnataka" />
                  <Picker.Item label="Kerala" value="Kerala" />
                  <Picker.Item label="Tamil Nadu" value="Tamil Nadu" />
                  <Picker.Item label="Telangana" value="Telangana" />
                  <Picker.Item label="Maharashtra" value="Maharashtra" />
                  <Picker.Item label="Delhi" value="Delhi" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputLabelContainer}><Text style={styles.inputLabel}>Pincode</Text></View>
            <View style={styles.inputContainer}>
              <MapPin color="#D4AF37" size={20} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="6-digit Pincode" placeholderTextColor="#999" keyboardType="number-pad" maxLength={6} value={pincode} onChangeText={setPincode} />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSaveProfile} disabled={loading}>
              <LinearGradient colors={['#D4AF37', '#B8860B', '#996515']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.gradientButton}>
                <Text style={styles.buttonText}>{loading ? 'SAVING...' : 'CONTINUE'}</Text>
                {!loading && <ArrowRight color="#FFF" size={20} style={{marginLeft: 8}} />}
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF8F0' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  headerSection: { marginBottom: 30, marginTop: 40 },
  heading: { fontSize: 28, fontWeight: '700', color: '#333', marginBottom: 8 },
  subheading: { fontSize: 16, color: '#555' },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)', padding: 24, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 5,
  },
  inputLabelContainer: { marginBottom: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: 8, height: 55,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  textAreaContainer: { height: 100, alignItems: 'flex-start' },
  inputIcon: { marginHorizontal: 16 },
  input: { flex: 1, fontSize: 15, color: '#333', height: '100%', paddingRight: 16 },
  textArea: { paddingTop: 15, textAlignVertical: 'top' },
  
  genderBtn: {
    flex: 1, height: 45, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)',
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, backgroundColor: '#FAFAFA'
  },
  genderBtnActive: {
    backgroundColor: '#D4AF37', borderColor: '#D4AF37'
  },
  genderText: { color: '#666', fontWeight: '600' },
  genderTextActive: { color: '#FFF' },

  button: {
    height: 55, borderRadius: 8, overflow: 'hidden', marginTop: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4,
  },
  gradientButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
});

export default RegistrationScreen;
