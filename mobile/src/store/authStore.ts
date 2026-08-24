import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  hasMpin: boolean;
  token: string | null;
  user: { name: string; phone: string; kycStatus: string; panStatus: string; isNewUser?: boolean } | null;
  setLogin: (token: string, hasMpin: boolean, user?: any) => void;
  setUser: (user: any) => void;
  setMpinCreated: () => void;
  setKycStatus: (status: string) => void;
  setPanStatus: (status: string) => void;
  updateUser: (data: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  hasMpin: false,
  token: null,
  user: { name: 'Customer', phone: '+91 9876543210', kycStatus: 'PENDING', panStatus: 'PENDING' }, // Default mock user
  setLogin: (token, hasMpin, user) => set((state) => ({ isLoggedIn: true, token, hasMpin, user: user || state.user })),
  setUser: (user) => set({ user }),
  setMpinCreated: () => set((state) => ({ hasMpin: true, user: { ...state.user, isNewUser: false } as any })),
  setKycStatus: (status) => set((state) => ({ user: { ...state.user, kycStatus: status } as any })),
  setPanStatus: (status) => set((state) => ({ user: { ...state.user, panStatus: status } as any })),
  updateUser: (data) => set((state) => ({ user: { ...state.user, ...data } as any })),
  logout: () => set({ isLoggedIn: false, hasMpin: false, token: null, user: null }),
}));
