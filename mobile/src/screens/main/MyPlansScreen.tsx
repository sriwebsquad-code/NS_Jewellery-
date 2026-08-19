import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Menu, ChevronDown, Calendar, Check } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const MyPlansScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token, user } = useAuthStore();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);
  
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string>(route.params?.defaultCategory || 'Gold Schemes');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [installmentAmount, setInstallmentAmount] = useState<string>('');
  
  // Show dropdown toggles
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  useEffect(() => {
    if (route.params?.defaultCategory) {
      setSelectedCategory(route.params.defaultCategory);
    }
  }, [route.params?.defaultCategory]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const API_URL = 'https://ns-jewellery.onrender.com';
      const response = await fetch(`${API_URL}/api/plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setPlans(data.data);
        if (data.data.length > 0) {
          const currentCategory = route.params?.defaultCategory || 'Gold Schemes';
          const filtered = data.data.filter((p: any) => {
            if (currentCategory === 'Gold Schemes') return p.name.toLowerCase().includes('gold');
            if (currentCategory === 'Silver Schemes') return p.name.toLowerCase().includes('silver');
            return false;
          });
          if (filtered.length > 0) {
            setSelectedPlanId(filtered[0].id);
            setSelectedCategory(currentCategory);
          } else {
            setSelectedPlanId(data.data[0].id);
            setSelectedCategory('Gold Schemes');
          }
        }
      } else {
        throw new Error('API returned false success');
      }
    } catch (error) {
      console.error('Failed to fetch plans, using local fallback:', error);
      // Hard fallback so UI never breaks during dev if backend fails/token expires
      const goldBenefits = [
        "NO WASTAGE NO MAKING CHARGES FOR THE GOLD WEIGHT ACCUMULATED ONLY AFTER 11MONTHS.",
        "THE PLAN CANNOT BE CLOSED IN BETWEEN. NO BENEFITS WILL BE GIVEN.",
        "THE AMOUNT WILL BE CONVERTED TO WEIGHT AS PER RATE OF GOLD ON THE PAYMENT DATE IF PAID BETWEEN 12.00AM TO THE NEXT MORNING WHEN THE RATE IS UPDATED, IT WILL CALCULATE ON THE NEXT MORNING RATE. NOT ON PREVIOUS DATE RATE.",
        "NOTE: NO ORDERS ACCEPTED FOR JEWELLERY PLANS, READY ITEMS CAN BE PURCHASED WHATEVER ITS WASTAGE MAY BE.",
        "NOTE : DIAMOND ORNAMENTS, SILVER ITEMS,& GIFTS CANNOT BE PURCHASED IN THIS PLANS"
      ];
      const silverBenefits = [
        "NO WASTAGE NO MAKING CHARGES FOR THE SILVER WEIGHT ACCUMULATED ONLY AFTER 11MONTHS.",
        "THE PLAN CANNOT BE CLOSED IN BETWEEN. NO BENEFITS WILL BE GIVEN.",
        "THE AMOUNT WILL BE CONVERTED TO WEIGHT AS PER RATE OF SILVER ON THE PAYMENT DATE IF PAID BETWEEN 12.00AM TO THE NEXT MORNING WHEN THE RATE IS UPDATED, IT WILL CALCULATE ON THE NEXT MORNING RATE. NOT ON PREVIOUS DATE RATE.",
        "NOTE: NO ORDERS ACCEPTED FOR JEWELLERY PLANS, READY ITEMS CAN BE PURCHASED WHATEVER ITS WASTAGE MAY BE.",
        "NOTE : DIAMOND ORNAMENTS, GOLD ITEMS,& GIFTS CANNOT BE PURCHASED IN THIS PLANS"
      ];

      const fallbackPlans = [
        { id: 'mock-11-month-gold', name: '11 Month Gold Scheme', type: 'AMOUNT', durationMonths: 11, benefits: JSON.stringify(goldBenefits) },
        { id: 'mock-gold-11', name: 'Gold 11 Scheme', type: 'GOLD', durationMonths: 11, benefits: JSON.stringify(goldBenefits) },
        { id: 'mock-11-month-silver', name: '11 Month Silver Scheme', type: 'AMOUNT', durationMonths: 11, benefits: JSON.stringify(silverBenefits) },
        { id: 'mock-silver-11', name: 'Silver 11 Scheme', type: 'SILVER', durationMonths: 11, benefits: JSON.stringify(silverBenefits) }
      ];
      setPlans(fallbackPlans);
      
      const currentCategory = route.params?.defaultCategory || 'Gold Schemes';
      const filtered = fallbackPlans.filter(p => {
        if (currentCategory === 'Gold Schemes') return p.name.toLowerCase().includes('gold');
        if (currentCategory === 'Silver Schemes') return p.name.toLowerCase().includes('silver');
        return false;
      });
      setSelectedPlanId(filtered[0].id);
      setSelectedCategory(currentCategory);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Gold Schemes', 'Silver Schemes'];
  
  const filteredPlans = plans.filter(p => {
    if (selectedCategory === 'Gold Schemes') return p.name.toLowerCase().includes('gold');
    if (selectedCategory === 'Silver Schemes') return p.name.toLowerCase().includes('silver');
    return false;
  });

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || filteredPlans[0];
  
  let parsedBenefits: string[] = [];
  if (selectedPlan && selectedPlan.benefits) {
    try {
      parsedBenefits = JSON.parse(selectedPlan.benefits);
    } catch (e) {
      parsedBenefits = [selectedPlan.benefits];
    }
  }

  // Handle Category selection
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setShowCategoryDropdown(false);
    // Auto-select first plan of this category
    const newFiltered = plans.filter(p => {
      if (cat === 'Gold Schemes') return p.name.toLowerCase().includes('gold');
      if (cat === 'Silver Schemes') return p.name.toLowerCase().includes('silver');
      return false;
    });
    if (newFiltered.length > 0) {
      setSelectedPlanId(newFiltered[0].id);
    } else {
      setSelectedPlanId(null);
    }
  };

  const isGold = selectedCategory === 'Gold Schemes';
  const isSilver = selectedCategory === 'Silver Schemes';
  const titleColor = isGold ? '#F5B041' : (isSilver ? '#AAB7B8' : '#2C3E50'); 

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#F5B041" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Menu color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerLogo, { color: colors.text }]}>NS JEWELLERY</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <Text style={[styles.pageTitle, { color: titleColor }]}>
            {isGold ? 'Gold Saving Scheme' : (isSilver ? 'Silver Saving Scheme' : 'Standard Saving Scheme')}
          </Text>

          {/* Scheme Category Dropdown */}
          <Text style={[styles.label, { color: colors.text }]}>Select Scheme Category</Text>
          <TouchableOpacity 
            style={[styles.dropdownField, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>{selectedCategory}</Text>
            <ChevronDown color={colors.icon} size={24} />
          </TouchableOpacity>
          
          {showCategoryDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              {categories.map((cat, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.dropdownItem}
                  onPress={() => handleSelectCategory(cat)}
                >
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Scheme Name Dropdown */}
          <Text style={[styles.label, { color: colors.text }]}>Select Scheme Name</Text>
          <TouchableOpacity 
            style={[styles.dropdownField, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => setShowPlanDropdown(!showPlanDropdown)}
          >
            <Text style={[styles.dropdownText, { color: colors.text }]}>{selectedPlan ? selectedPlan.name : 'No Plans Found'}</Text>
            <ChevronDown color={colors.icon} size={24} />
          </TouchableOpacity>

          {showPlanDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              {filteredPlans.length > 0 ? filteredPlans.map((plan, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedPlanId(plan.id);
                    setShowPlanDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>{plan.name}</Text>
                </TouchableOpacity>
              )) : (
                <View style={styles.dropdownItem}>
                  <Text style={[styles.dropdownItemText, { color: colors.textMuted }]}>No plans available</Text>
                </View>
              )}
            </View>
          )}

          {/* Monthly Installment Amount */}
          <Text style={[styles.label, { color: colors.text }]}>Monthly Installment Amount (₹)</Text>
          <View style={[styles.dropdownField, styles.inputFieldContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.rupeeIcon, { color: colors.text }]}>₹</Text>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="e.g. 5000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={installmentAmount}
              onChangeText={setInstallmentAmount}
            />
          </View>

          {/* Duration Indicator */}
          {selectedPlan && (
            <View style={styles.durationContainer}>
              <Calendar color={colors.icon} size={18} style={{ marginRight: 6 }} />
              <Text style={[styles.durationText, { color: colors.textMuted }]}>Plan Duration <Text style={[styles.durationTextBold, { color: colors.text }]}>{selectedPlan.durationMonths} months</Text></Text>
            </View>
          )}

          {/* Benefits Card */}
          {selectedPlan && (
            <View style={[styles.benefitsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={[styles.benefitsAccent, { backgroundColor: titleColor }]} />
              <Text style={[styles.benefitsTitle, { color: colors.text }]}>Benefits</Text>
              
              <View style={styles.benefitsList}>
                {parsedBenefits.map((benefit, idx) => (
                  <View key={idx} style={styles.benefitRow}>
                    <Check color={titleColor} size={20} style={{ marginRight: 8, marginTop: 2 }} strokeWidth={3} />
                    <Text style={[styles.benefitText, { color: colors.textMuted }]}>{benefit.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Proceed Button Fixed at Bottom */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[
            styles.proceedBtn, 
            (!installmentAmount || isNaN(Number(installmentAmount))) && styles.proceedBtnDisabled
          ]}
          disabled={!installmentAmount || isNaN(Number(installmentAmount))}
          onPress={() => {
            if (user?.kycStatus !== 'VERIFIED') {
              Alert.alert(
                "KYC Required",
                "Please verify your Aadhar to join a Savings Plan.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Verify Now", onPress: () => navigation.navigate('AadharVerification') }
                ]
              );
              return;
            }
            navigation.navigate('Payment', { 
              amount: Number(installmentAmount),
              planId: selectedPlanId,
              planName: selectedPlan?.name,
              planType: selectedPlan?.type
            });
          }}
        >
          <Text style={styles.proceedBtnText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconBtn: {
    padding: 5,
    marginLeft: -5,
  },
  headerLogo: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#6C1B1B',
    letterSpacing: 1,
  },
  content: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 5,
  },
  dropdownField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    marginTop: -15,
    marginBottom: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  inputFieldContainer: {
    justifyContent: 'flex-start',
    paddingVertical: 4, // TextInput provides its own height
  },
  rupeeIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    paddingVertical: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  durationText: {
    fontSize: 15,
    color: '#4A4A4A',
  },
  durationTextBold: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E1F0FF', // light blue border like screenshot
    position: 'relative',
    overflow: 'hidden',
  },
  benefitsAccent: {
    position: 'absolute',
    left: 0,
    top: 20,
    bottom: 20,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2B1B3D',
    marginBottom: 15,
    marginLeft: 10,
  },
  benefitsList: {
    marginLeft: 5,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  bottomBar: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  proceedBtn: {
    backgroundColor: '#F1C40F', // vibrant yellow
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#F1C40F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedBtnDisabled: {
    backgroundColor: '#E5E7E9',
    shadowOpacity: 0,
    elevation: 0,
  },
  proceedBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});

export default MyPlansScreen;

