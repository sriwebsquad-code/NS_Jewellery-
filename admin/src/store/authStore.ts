import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Hydrate from localStorage in a real app
  token: localStorage.getItem('adminToken') || null,
  login: (user, token) => {
    localStorage.setItem('adminToken', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('adminToken');
    set({ user: null, token: null });
  },
}));
