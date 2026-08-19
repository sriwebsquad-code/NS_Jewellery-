import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { useThemeStore } from '../../store/themeStore';
import { COLORS } from '../../constants/theme';
import { Menu, MapPin, Phone, Clock } from 'lucide-react-native';

const AboutUsScreen = () => {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>About Us</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={{ width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 20 }} 
          />
          <Text style={[styles.title, { color: colors.primary }]}>NS Mahaveer Jewellery</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Since 1962</Text>
          
          <View style={styles.divider} />
          
          <Text style={[styles.description, { color: colors.text }]}>
            A legacy of purity and trust. NS Mahaveer Jewellery has been a well-known and trusted establishment in Cuddalore for over six decades, offering premium gold, silver, and traditional jewellery.
          </Text>

          <View style={styles.infoRow}>
            <MapPin color={colors.primary} size={24} style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Address</Text>
              <Text style={[styles.infoValue, { color: colors.textMuted }]}>
                40-41, Lawrence Road, Muthaiya Nagar, Thirupapuliyur, Cuddalore – 607002
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone color={colors.primary} size={24} style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Contact</Text>
              <Text style={[styles.infoValue, { color: colors.textMuted }]}>+91 7299573995</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Clock color={colors.primary} size={24} style={styles.icon} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Store Hours</Text>
              <Text style={[styles.infoValue, { color: colors.textMuted }]}>Mon - Sun: 9:30 AM - 8:30 PM</Text>
            </View>
          </View>
        </View>
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
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(200, 159, 122, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(200, 159, 122, 0.2)',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'serif',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(200, 159, 122, 0.2)',
    marginVertical: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  icon: {
    marginTop: 2,
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    lineHeight: 20,
  }
});

export default AboutUsScreen;
