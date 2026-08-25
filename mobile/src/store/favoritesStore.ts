import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteItem {
  id: string;
  name: string;
  category: { id: string; name: string };
  purity: string;
  weight: number;
  makingCharges: number;
  images: string[];
  description?: string;
  isPopular?: boolean;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) => {
        const { favorites } = get();
        if (!favorites.some((f) => f.id === item.id)) {
          set({ favorites: [...favorites, item] });
        }
      },
      removeFavorite: (itemId) => {
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== itemId),
        }));
      },
      isFavorite: (itemId) => {
        return get().favorites.some((f) => f.id === itemId);
      },
      toggleFavorite: (item) => {
        const { isFavorite, removeFavorite, addFavorite } = get();
        if (isFavorite(item.id)) {
          removeFavorite(item.id);
        } else {
          addFavorite(item);
        }
      }
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
