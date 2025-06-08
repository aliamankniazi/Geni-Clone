import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  isEmailVerified: boolean;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await axios.post('/api/auth/login', {
            email,
            password
          });

          const { user, token, refreshToken } = response.data.data;
          
          // Set axios authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(
            error.response?.data?.message || 'Login failed'
          );
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await axios.post('/api/auth/register', userData);
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(
            error.response?.data?.message || 'Registration failed'
          );
        }
      },

      logout: () => {
        // Remove axios authorization header
        delete axios.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          });

          const { token } = response.data.data;
          
          // Update axios authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({ token });
        } catch (error: any) {
          // If refresh fails, logout user
          get().logout();
          throw new Error('Session expired. Please login again.');
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          const response = await axios.put('/api/auth/profile', data);
          const updatedUser = response.data.data;

          set({
            user: updatedUser,
            isLoading: false
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(
            error.response?.data?.message || 'Profile update failed'
          );
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true });
        try {
          await axios.post('/api/auth/verify-email', { token });
          
          // Update user's email verification status
          const { user } = get();
          if (user) {
            set({
              user: { ...user, isEmailVerified: true },
              isLoading: false
            });
          }
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(
            error.response?.data?.message || 'Email verification failed'
          );
        }
      }
    }),
    {
      name: 'geni-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        // Set axios authorization header on rehydration
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      }
    }
  )
);

// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshAuth();
        
        // Retry the original request with new token
        const { token } = useAuthStore.getState();
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
); 