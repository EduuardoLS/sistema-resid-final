import axios from 'axios';

// Lógica inteligente:
// 1. Se tiver a variável da Vercel (Produção), usa ela.
// 2. Se não tiver (Desenvolvimento), usa o localhost.
// OBS: Adicionamos o '/api' no final automaticamente se a variável não tiver.

const baseUrl = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` // Na Vercel: https://.../api
  : 'http://localhost:5000/api';           // No seu PC

const api = axios.create({
    baseURL: baseUrl
});

// Interceptador que adiciona o token a cada requisição
api.interceptors.request.use(async config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;