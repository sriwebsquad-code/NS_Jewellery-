import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { COLORS } from '../../constants/theme';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useAuthStore } from '../../store/authStore';

const JewelleryDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute() as any;
  const { item } = route.params;

  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { user } = useAuthStore();
  const isFav = isFavorite(item.id);
  const [loadingWhatsapp, setLoadingWhatsapp] = React.useState(false);

  const handleProceedToBuy = async () => {
    setLoadingWhatsapp(true);
    try {
      const res = await fetch('https://ns-jewellery.onrender.com/api/settings');
      const data = await res.json();
      const num = data?.data?.whatsappNumber;
      
      if (!num) {
        Alert.alert('Error', 'WhatsApp contact number not configured by admin.');
        return;
      }
      
      const customerName = user?.name || 'A Customer';
      const imageUrl = item.images?.[0] ? (item.images[0].startsWith('http') ? item.images[0] : `https://ns-jewellery.onrender.com${item.images[0]}`) : 'No image available';
      
      const message = `Hello, this is ${customerName}.\n\nI would like to inquire about the following item:\n\nItem: ${item.name}\nCategory: ${item.category?.name || 'N/A'}\nPurity: ${item.purity}\nWeight: ${item.weight}g\n\nImage: ${imageUrl}`;
      const url = `whatsapp://send?phone=91${num}&text=${encodeURIComponent(message)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed on your device');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server. Please try again.');
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Full width Image */}
        <View style={[styles.imageContainer, { backgroundColor: colors.cardBackground }]}>
          <Image 
            source={{ uri: item.images?.[0] ? (item.images[0].startsWith('http') ? item.images[0] : `https://ns-jewellery.onrender.com${item.images[0]}`) : 'https://via.placeholder.com/400' }} 
            style={styles.mainImage} 
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.categorySubtitle, { color: colors.primary }]}>{item.category?.name?.toUpperCase() || 'CATEGORY'}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
          
          <View style={styles.detailsRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Purity</Text>
            <Text style={[styles.value, { color: colors.text }]}>{item.purity}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Weight</Text>
            <Text style={[styles.value, { color: colors.text }]}>{item.weight} g</Text>
          </View>

          {item.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.label, { color: colors.textMuted }]}>Description</Text>
              <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
            </View>
          ) : null}
        </View>

      </ScrollView>
      
      {/* Action Buttons */}
      <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: mode === 'dark' ? colors.cardBackground : COLORS.white }]}>
        <TouchableOpacity style={styles.likeBtn} onPress={() => toggleFavorite(item)}>
          <Heart color={isFav ? COLORS.error : COLORS.primary} size={24} fill={isFav ? COLORS.error : 'transparent'} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quoteBtn} onPress={handleProceedToBuy} disabled={loadingWhatsapp}>
          {loadingWhatsapp ? (
            <ActivityIndicator color={colors.cardBackground} />
          ) : (
            <Text style={styles.btnText}>Proceed to Buy</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardBackground,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    padding: 5,
    marginLeft: -5,
  },
  imageContainer: {
    width: '100%',
    height: 450,
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoSection: {
    padding: 20,
  },
  categorySubtitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontFamily: 'serif',
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 25,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'transparent',
  },
  likeBtn: {
    width: 60,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 15,
  },
  quoteBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: colors.cardBackground,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  }
});

export default JewelleryDetailScreen;
