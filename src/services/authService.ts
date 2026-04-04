import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export interface SignupPayload {
  fullName: string;
  email: string;
  password?: string;
  passwordConfirmation?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async signup(payload: SignupPayload) {
    const store = useAuthStore.getState();
    store.setLoading(true);
    store.setError(null);

    try {
      const response = await api.post('/auth/signup', payload);
      const { user, accessToken } = response.data;
      store.setAuth(user, accessToken);
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data;
      const message = apiError?.errors?.[0]?.message || apiError?.message || 'Une erreur est survenue lors de l\'inscription';
      store.setError(message);
      throw error;
    } finally {
      store.setLoading(false);
    }
  },

  /**
   * Log in an existing user
   */
  async login(payload: LoginPayload) {
    const store = useAuthStore.getState();
    store.setLoading(true);
    store.setError(null);

    try {
      const response = await api.post('/auth/login', payload);
      const { user, token } = response.data?.data;
      store.setAuth(user, token);
      return response.data?.data;
    } catch (error: any) {
      const apiError = error.response?.data;
      const message = apiError?.errors?.[0]?.message || apiError?.message || 'Une erreur est survenue lors de la connexion';
      store.setError(message);
      throw error;
    } finally {
      store.setLoading(false);
    }
  },

  /**
   * Log out the current user
   */
  async logout() {
    const store = useAuthStore.getState();
    store.setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      store.clearAuth();
      store.setLoading(false);
    }
  },

  /**
   * Fetch current user profile
   */
  async fetchProfile() {
    const store = useAuthStore.getState();
    store.setLoading(true);
    try {
      const response = await api.get('/account/profile');
      const user = response.data;
      // Re-update user info in store (token remains same)
      const currentToken = localStorage.getItem('access_token') || store.accessToken;
      if (currentToken) {
         store.setAuth(user, currentToken);
      }
      return user;
    } catch (error: any) {
      if (error.response?.status === 401) {
        store.clearAuth();
      }
      throw error;
    } finally {
      store.setLoading(false);
    }
  }
};
