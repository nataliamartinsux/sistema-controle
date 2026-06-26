import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor: Pega o token salvo e injeta na requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sysmerenda_access');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor de resposta: Redireciona para o login se o token expirar ou for inválido (401),
// exceto durante a tentativa de login propriamente dita.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url;

    if ((error.response?.status === 401 || error.response?.status === 403) && requestUrl !== '/api/login/') {
      console.warn("Token expirado ou inválido. Redirecionando para o login...");
      localStorage.removeItem("sysmerenda_access");
      localStorage.removeItem("sysmerenda_papel");
      window.location.href = "/login"; // Força o usuário a logar de novo
    }

    return Promise.reject(error);
  }
);