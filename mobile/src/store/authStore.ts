import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isLoggedIn: boolean;
  hasMpin: boolean;
  token: string | null;
  user: { name: string; phone: string; kycStatus: string; panStatus: string; isNewUser?: boolean } | null;
  lastActiveAt: number | null;
  setLogin: (token: string, hasMpin: boolean, user?: any) => void;
  setUser: (user: any) => void;
  setMpinCreated: () => void;
  setKycStatus: (status: string) => void;
  setPanStatus: (status: string) => void;
  updateUser: (data: any) => void;
  updateActivity: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      hasMpin: false,
      token: null,
      user: { name: 'Customer', phone: '+91 9876543210', kycStatus: 'PENDING', panStatus: 'PENDING' }, // Default mock user
      lastActiveAt: null,
      setLogin: (token, hasMpin, user) => set((state) => ({ isLoggedIn: true, token, hasMpin, user: user || state.user, lastActiveAt: Date.now() })),
      setUser: (user) => set({ user }),
      setMpinCreated: () => set((state) => ({ hasMpin: true, user: { ...state.user, isNewUser: false } as any })),
      setKycStatus: (status) => set((state) => ({ user: { ...state.user, kycStatus: status } as any })),
      setPanStatus: (status) => set((state) => ({ user: { ...state.user, panStatus: status } as any })),
      updateUser: (data) => set((state) => ({ user: { ...state.user, ...data } as any })),
      updateActivity: () => set({ lastActiveAt: Date.now() }),
      logout: () => set({ isLoggedIn: false, hasMpin: false, token: null, user: null, lastActiveAt: null }),
    }),
    {
      name: 'auth-storage', // unique name
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
