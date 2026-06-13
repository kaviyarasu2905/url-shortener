import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5000/api'
});

// Interceptor to attach Bearer Token dynamically from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  updatePassword: (data) => API.put('/auth/password', data),
  deleteAccount: () => API.delete('/auth/account'),
};

export const urlAPI = {
  create: (data) => API.post('/urls', data),
  getAll: () => API.get('/urls'),
  delete: (id) => API.delete(`/urls/${id}`),
  update: (id, data) => API.put(`/urls/${id}`, data),
  getAnalytics: (id) => API.get(`/urls/${id}/analytics`),
  getQR: (id) => API.get(`/urls/${id}/qr`),
  createBulk: (data) => API.post('/urls/bulk', data),
};

export default API;
