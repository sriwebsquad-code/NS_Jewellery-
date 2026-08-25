import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { ArrowLeft, Heart, HeartOff } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { COLORS } from '../../constants/theme';
import { useFavoritesStore, FavoriteItem } from '../../store/favoritesStore';

const FavoritesScreen = () => {
  const navigation = useNavigation() as any;
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  const { favorites, toggleFavorite, isFavorite } = useFavoritesStore();

  const renderJewelleryItem = ({ item }: { item: FavoriteItem }) => {
    const isFav = isFavorite(item.id);
    return (
      <TouchableOpacity 
        style={styles.jewelleryCard}
        onPress={() => navigation.navigate('JewelleryDetail', { item })}
      >
        <Image 
          source={{ uri: item.images?.[0] ? (item.images[0].startsWith('http') ? item.images[0] : `https://ns-jewellery.onrender.com${item.images[0]}`) : 'https://via.placeholder.com/200' }} 
          style={styles.jewelleryImage} 
        />
        <TouchableOpacity style={styles.wishlistBtn} onPress={() => toggleFavorite(item)}>
          <Heart color={isFav ? COLORS.error : colors.primary} size={16} fill={isFav ? COLORS.error : 'transparent'} />
        </TouchableOpacity>
        
        <View style={styles.jewelleryInfo}>
           <Text style={[styles.jewelleryName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
           <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
             <Text style={[styles.jewelleryWeight, { color: colors.textMuted }]}>{item.weight}g</Text>
             <Text style={[styles.jewelleryPurity, { color: colors.primary }]}>{item.purity}</Text>
           </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerLogo, { color: colors.text }]}>My Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <HeartOff color={colors.textMuted} size={64} style={{ marginBottom: 20 }} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No favorites saved yet</Text>
            <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
              Click the heart icon on any jewellery item to save it here.
            </Text>
            <TouchableOpacity 
              style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.exploreBtnText}>Explore Catalogue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={renderJewelleryItem}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconBtn: {
    padding: 5,
    marginLeft: -5,
  },
  headerLogo: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  jewelleryCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: mode === 'dark' ? '#000' : COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jewelleryImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: mode === 'dark' ? '#000' : COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jewelleryInfo: {
    padding: 12,
  },
  jewelleryName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  jewelleryWeight: {
    fontSize: 12,
    fontWeight: '600',
  },
  jewelleryPurity: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  }
});

export default FavoritesScreen;
