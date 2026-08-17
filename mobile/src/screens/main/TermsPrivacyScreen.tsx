import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { COLORS, SIZES } from '../../constants/theme';
import { Menu } from 'lucide-react-native';

const TermsPrivacyScreen = () => {
  const navigation = useNavigation<any>();
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color={colors.text} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Privacy</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Introduction:</Text>
        <Text style={[styles.paragraph, { color: colors.textMuted }]}>
          At NS Jewellery, your privacy and trust are secured and given utmost importance. This Privacy Policy is carefully made to help you understand how your data is received, stored and used by NS Jewellery. You expressly consent to use & disclose your personal information in accordance with this Privacy Policy by logging into any of NS Jewellery's platforms on any medium. Note: Our privacy policy may change at any time without prior notification. Kindly review the privacy policy to be updated with this Privacy Policy. It shall apply uniformly against all of NS Jewellery's mode of transmission of portal.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>General:</Text>
        <Text style={[styles.paragraph, { color: colors.textMuted }]}>
          NS Jewellery warrants and covenants not to sell, rent or share for benefit, any of the personal data of the user so as to make it available for subscription for promotional advertisements/unsolicited enquiries by way of emails/calls. NS Jewellery further warrants that any email/call from it shall only be in connection with its services as mentioned in the terms and policy. NS Jewellery may reveal general statistical information about NS Jewellery & its users, on the average traffic on its website along with purchase trend on NS Jewellery etc. All the legal compliant requests for disclosures of personal data shall be accepted by NS Jewellery and it shall not amount to violation of privacy of the user.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Data:</Text>
        <Text style={[styles.paragraph, { color: colors.textMuted }]}>
          Personal Information means and includes all information such as name, address, mailing id, telephone number, all the details on the credit/debit card, UPI, account details, information about mobile phone and any other details that may have been voluntarily provide by the user in connection with availing any of the services on NS Jewellery. In addition, information regarding the domain, server, host providing the internet. IP address of the system/ISP and any other anonymous site data may be accessed by NS Jewellery.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Use of Personal Information</Text>
        <Text style={[styles.paragraph, { color: colors.textMuted }]}>
          We use personal information to provide you with the below:
          {'\n'}a. To resolve any technical snag, troubleshoot concerns, promote safe services, to perform financial transactions if any, measure consumer statistics in our services.
          {'\n'}b. To inform you about offers, products, services, updates, customize your experience, detect & protect us against error, fraud and other criminal activity, enforce our terms and conditions, etc.
          {'\n'}c. To send you offers based on your previous orders and interests.
          {'\n'}d. To customize your experience at NS Jewellery, by providing you with content that we think you might be interested in and to display content according to your preferences.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Cookies</Text>
        <Text style={[styles.paragraph, { color: colors.textMuted }]}>
          A "cookie" is a small piece of information stored by a web server on a web browser so it can be later read back from that browser. No personal information will be collected via cookies and other tracking technology; however, if you previously provided personally identifiable information, cookies may be tied to such information. Aggregate cookie and tracking information may be shared with third parties.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
        <Text style={[styles.paragraph, { color: colors.textMuted }]}>
          NS Jewellery has installed a secure server with stringent security measures in place to safeguard user's personal data from misuse, destruction and alteration of the information. Once your information is in our possession we adhere to strict security guidelines, protecting it against unauthorized access.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Links to Other Sites</Text>
        <Text style={[styles.paragraph, { color: colors.textMuted }]}>
          NS Jewellery may have linked up with a few websites to carry out the functions at its optimum. Therefore, is not responsible for the privacy policy or the content of the other websites linked/to be linked on NS Jewellery.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Consent</Text>
        <Text style={[styles.paragraph, { color: colors.textMuted }]}>
          By using NS Jewellery and/or by providing your information, you consent to the collection, storage and use of the information you disclose on NS Jewellery in accordance with this Privacy Policy, including but not limited to your consent for sharing your information as per this privacy policy.
        </Text>
        
        <View style={{ height: 40 }} />
      </ScrollView>
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
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'justify',
  }
});

export default TermsPrivacyScreen;
