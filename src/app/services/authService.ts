import { api } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/login/', { email, password });
    const { access, refresh, papel } = response.data;

    if (access) {
      localStorage.setItem('sysmerenda_access', access);
      localStorage.setItem('sysmerenda_refresh', refresh);
      localStorage.setItem('sysmerenda_papel', papel);
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('sysmerenda_access');
    localStorage.removeItem('sysmerenda_refresh');
    localStorage.removeItem('sysmerenda_papel');
  }
};