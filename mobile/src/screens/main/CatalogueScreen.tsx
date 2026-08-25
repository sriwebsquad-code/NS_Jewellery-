import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { Menu, Heart, Search, Sparkles } from 'lucide-react-native';
import { useThemeStore } from '../../store/themeStore';
import { COLORS } from '../../constants/theme';
import { useFavoritesStore } from '../../store/favoritesStore';

const CatalogueScreen = () => {
  const navigation = useNavigation() as any;
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? Colors.dark : Colors.light;
  const styles = getStyles(colors, mode);

  const { favorites, toggleFavorite, isFavorite } = useFavoritesStore();

  const [search, setSearch] = useState('');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const API_URL = 'https://ns-jewellery.onrender.com';
      const [catRes, itemRes] = await Promise.all([
        fetch(`${API_URL}/api/jewellery/categories`),
        fetch(`${API_URL}/api/jewellery/items`)
      ]);
      const catData = await catRes.json();
      const itemData = await itemRes.json();
      if (catData.success) setCategories(catData.data);
      if (itemData.success) setItems(itemData.data);
    } catch (error) {
      console.error('Failed to fetch jewellery:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = (item: any, index: number) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.categoryCard}
        onPress={() => setSelectedCategory(item.id)}
      >
        <View style={[styles.categoryIconContainer, { 
          backgroundColor: isSelected ? colors.primary : colors.cardBackground, 
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: 1,
          shadowColor: mode === 'dark' ? '#000' : COLORS.black 
        }]}>
          {item.image ? (
            <Image 
              source={{uri: item.image.startsWith('http') ? item.image : `https://ns-jewellery.onrender.com${item.image}`}} 
              style={styles.categoryImg} 
            />
          ) : (
             <View style={styles.categoryImgPlaceholder} />
          )}
        </View>
        <Text style={[styles.categoryText, { color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? 'bold' : 'normal' }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderJewelleryItem = ({ item, index }: any) => {
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
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
          <Menu color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerLogo, { color: colors.text }]}>NS Mahaveer Collection</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Favorites')}>
          <View>
            <Heart color={colors.text} size={24} />
            {favorites.length > 0 && (
              <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.error, width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>{favorites.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: mode === 'dark' ? '#000' : COLORS.black }]}>
          <Search color={colors.textMuted} size={20} style={{ marginLeft: 15 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search collections..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {categories.map((cat, idx) => renderCategoryItem(cat, idx))}
            
            <TouchableOpacity style={styles.categoryCard} onPress={() => setSelectedCategory('All')}>
              <View style={[styles.categoryIconContainer, { 
                backgroundColor: selectedCategory === 'All' ? colors.primary : colors.cardBackground, 
                borderWidth: 1, 
                borderColor: selectedCategory === 'All' ? colors.primary : colors.border, 
                shadowColor: mode === 'dark' ? '#000' : COLORS.black 
              }]}>
                 <Sparkles color={selectedCategory === 'All' ? '#FFF' : colors.primary} size={20} />
              </View>
              <Text style={[styles.categoryText, { color: selectedCategory === 'All' ? colors.primary : colors.text, fontWeight: selectedCategory === 'All' ? 'bold' : 'normal' }]}>All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {loading ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={items.filter(i => {
              const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.category?.name?.toLowerCase().includes(search.toLowerCase());
              const matchesCategory = selectedCategory === 'All' || i.categoryId === selectedCategory;
              return matchesSearch && matchesCategory;
            })}
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
    backgroundColor: colors.cardBackground,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'serif',
    color: COLORS.secondary,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: 15,
    height: 55,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 15,
  },
  categoriesContainer: {
    marginTop: 25,
    marginBottom: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 25,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    overflow: 'hidden',
  },
  categoryImg: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  categoryImgPlaceholder: {
    width: 35,
    height: 35,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 17.5,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  jewelleryCard: {
    width: '48%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  jewelleryImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
    backgroundColor: colors.cardBackground,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jewelleryInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  jewelleryName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.secondary,
    marginBottom: 2,
    fontFamily: 'serif',
  },
  jewelleryWeight: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondaryDark,
  },
  jewelleryPurity: {
    display: 'none',
  }
});

export default CatalogueScreen;

