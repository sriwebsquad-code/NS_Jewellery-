import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  hasMpin: boolean;
  token: string | null;
  user: { name: string; phone: string; kycStatus: string } | null;
  setLogin: (token: string, hasMpin: boolean, user?: any) => void;
  setMpinCreated: () => void;
  setKycStatus: (status: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  hasMpin: false,
  token: null,
  user: { name: 'Customer', phone: '+91 9876543210', kycStatus: 'PENDING' }, // Default mock user
  setLogin: (token, hasMpin, user) => set((state) => ({ isLoggedIn: true, token, hasMpin, user: user || state.user })),
  setMpinCreated: () => set({ hasMpin: true }),
  setKycStatus: (status) => set((state) => ({ user: state.user ? { ...state.user, kycStatus: status } : null })),
  logout: () => set({ isLoggedIn: false, hasMpin: false, token: null, user: null }),
}));
