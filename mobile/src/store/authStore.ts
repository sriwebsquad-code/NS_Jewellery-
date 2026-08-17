import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  hasMpin: boolean;
  token: string | null;
  user: { name: string; phone: string } | null;
  setLogin: (token: string, hasMpin: boolean) => void;
  setMpinCreated: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  hasMpin: false,
  token: null,
  user: { name: 'Customer', phone: '+91 9876543210' }, // Default mock user
  setLogin: (token, hasMpin) => set({ isLoggedIn: true, token, hasMpin }),
  setMpinCreated: () => set({ hasMpin: true }),
  logout: () => set({ isLoggedIn: false, hasMpin: false, token: null, user: null }),
}));
