import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { COLORS } from '../../constants/theme';
import { Menu } from 'lucide-react-native';

const ReturnPoliciesScreen = () => {
  const navigation = useNavigation<any>();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Return Policies</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Buyer policies:</Text>
        <Text style={styles.text}>
          As a buyer, you need to accept and follow our rules and policies before you can purchase an item. This helps ensure a smoother, more enjoyable transaction for both buyers and sellers.
        </Text>

        <Text style={styles.sectionTitle}>Cancellation Policy for Buyers:</Text>
        <Text style={styles.text}>
          Once an order is successfully placed but not confirmed, it can be cancelled by either the buyer or the seller. Once an order is successfully placed and confirmed, it can be cancelled by the buyer only. An order cannot be cancelled once it is dispatched or while in transit or is delivered. For customised Jewellery, orders once confirmed cannot be cancelled.
        </Text>

        <Text style={styles.sectionTitle}>Return Policy for Buyers:</Text>
        <Text style={styles.text}>
          Return requests will be accepted only when an order is delivered successfully. Returns will be accepted up to 10 days post successful delivery of any order i.e. delivery + 10 days. Items weighing below 4 grams of Gold, 50 gms of silver and customised Jewellery are not eligible for returns. Buyer can return the order after contacting our store. A return will only be accepted by the seller in case of unused and undamaged product. Once an order is returned to the seller, the refund will be processed within 7 working days.
        </Text>

        <Text style={styles.sectionTitle}>Shipping :</Text>
        <Text style={styles.text}>
          Customers will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
        </Text>

        <Text style={styles.sectionTitle}>Refund Policy for Buyers:</Text>
        <Text style={styles.text}>
          In order to be eligible for a refund, you have to return the product within 10 calendar days of your purchase. The product must be in the same condition that you receive it and undamaged in any way. After we receive your item, our team of professionals will inspect it and process your refund. The money will be refunded to the original payment method you’ve used during the purchase. For credit card payments it may take 5 to 10 business days for a refund to show up on your credit card statement. If the product is damaged in any way, or you have initiated the return after 10 calendar days have passed, you will not be eligible for a refund.
        </Text>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 10,
  }
});

export default ReturnPoliciesScreen;
