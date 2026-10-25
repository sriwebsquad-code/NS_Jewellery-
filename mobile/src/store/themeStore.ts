import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { Colors } from '../constants/Colors';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

export type ThemeColors = typeof Colors.light | typeof Colors.dark;

interface ThemeState {
  themePreference: ThemePreference;
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (preference: ThemePreference) => void;
}

const getInitialMode = (preference: ThemePreference): ThemeMode => {
  if (preference === 'system') {
    const systemScheme = Appearance.getColorScheme();
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themePreference: 'light',
      mode: 'light',
      colors: Colors.light,
      toggleTheme: () => {
        const currentMode = get().mode;
        const nextMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
        set({
          themePreference: nextMode,
          mode: nextMode,
          colors: Colors[nextMode],
        });
      },
      setTheme: (preference: ThemePreference) => {
        const resolvedMode = getInitialMode(preference);
        set({
          themePreference: preference,
          mode: resolvedMode,
          colors: Colors[resolvedMode],
        });
      },
    }),
    {
      name: 'ns-jewellery-theme',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolvedMode = getInitialMode(state.themePreference || 'light');
          state.mode = resolvedMode;
          state.colors = Colors[resolvedMode];
        }
      },
    }
  )
);

// Listen to system OS appearance changes
Appearance.addChangeListener(({ colorScheme }) => {
  const { themePreference, setTheme } = useThemeStore.getState();
  if (themePreference === 'system') {
    setTheme('system');
  }
});
