import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  addresses?: any[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('nexo_token');
  const userStr = localStorage.getItem('nexo_user');
  let user: User | null = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {}

  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    setAuth: (token, user) => {
      localStorage.setItem('nexo_token', token);
      localStorage.setItem('nexo_user', JSON.stringify(user));
      set({
        token, user, isAuthenticated: true,
        isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
      });
    },
    setUser: (user) => {
      localStorage.setItem('nexo_user', JSON.stringify(user));
      set({ user });
    },
    logout: () => {
      localStorage.removeItem('nexo_token');
      localStorage.removeItem('nexo_user');
      set({ token: null, user: null, isAuthenticated: false, isAdmin: false });
    },
  };
});
