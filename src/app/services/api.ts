import axios from 'axios';

// URL base do backend que ela informou
const API_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Pega o token salvo e injeta na requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sysmerenda_access');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});