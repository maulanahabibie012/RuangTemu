import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse } from '../types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (data: AuthResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (data) => {
        if (typeof document !== 'undefined') {
          document.cookie = 'has-auth=true; path=/; max-age=604800; samesite=lax'; // 7 days
        }
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        if (typeof document !== 'undefined') {
          document.cookie = 'has-auth=true; path=/; max-age=604800; samesite=lax';
        }
        set({
          accessToken,
          refreshToken,
        });
      },

      updateUser: (userUpdates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdates } : null,
        })),

      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'has-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      // Optional: Only persist necessary fields (avoid storing raw tokens if preferred, but for MVP it's okay)
    }
  )
);