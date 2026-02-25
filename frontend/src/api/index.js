import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  toggleLike: (id) => api.post(`/products/${id}/like`),
};

export const chatAPI = {
  getOrCreateRoom: (productId) => api.post('/chat/rooms', { productId }),
  getMyRooms: () => api.get('/chat/rooms'),
  getMessages: (roomId) => api.get(`/chat/rooms/${roomId}/messages`),
};

export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (formData) => api.put('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  writeReview: (data) => api.post('/users/reviews', data),
  getMyProducts: (status) => api.get('/users/me/products', { params: { status } }),
  getMyLikes: () => api.get('/users/me/likes'),
};

export default api;
