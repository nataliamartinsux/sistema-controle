import { api } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/login/', { email, password });
    const { access, refresh, papel, nome, email: userEmail } = response.data;
    const displayEmail = userEmail || email;

    if (access) {
      localStorage.setItem('sysmerenda_access', access);
      localStorage.setItem('sysmerenda_refresh', refresh);
      localStorage.setItem('sysmerenda_papel', papel);
      if (nome) {
        localStorage.setItem('sysmerenda_nome', nome);
      }
      if (displayEmail) {
        localStorage.setItem('sysmerenda_email', displayEmail);
      }
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('sysmerenda_access');
    localStorage.removeItem('sysmerenda_refresh');
    localStorage.removeItem('sysmerenda_papel');
    localStorage.removeItem('sysmerenda_nome');
    localStorage.removeItem('sysmerenda_email');
  }
};