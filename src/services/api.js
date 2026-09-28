import axios from 'axios';

// Base API URL configuration
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — inject JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillloop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with hard redirect to /login
// This is the canonical "session expired" handler used app-wide.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid credentials from storage
      localStorage.removeItem('skillloop_token');
      localStorage.removeItem('skillloop_user');
      // Hard-redirect to login so AuthContext re-initialises on next load.
      // Using window.location ensures we escape any stale React Router state.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth & Health ────────────────────────────────────────────────────────────

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const healthAPI = {
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const usersAPI = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/me', profileData);
    return response.data;
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ─── Discovery ───────────────────────────────────────────────────────────────

export const discoverAPI = {
  getRecommendations: async (limit = 10) => {
    const response = await api.get(`/discover?limit=${limit}`);
    return response.data;
  },
};

// ─── Learning Requests ───────────────────────────────────────────────────────

export const requestsAPI = {
  createRequest: async (data) => {
    const response = await api.post('/requests', data);
    return response.data;
  },
  getRequests: async (type = 'received') => {
    const response = await api.get(`/requests?type=${type}`);
    return response.data;
  },
  acceptRequest: async (id) => {
    const response = await api.patch(`/requests/${id}/accept`);
    return response.data;
  },
  rejectRequest: async (id) => {
    const response = await api.patch(`/requests/${id}/reject`);
    return response.data;
  },
};

// ─── Exchanges ───────────────────────────────────────────────────────────────

export const exchangesAPI = {
  getExchanges: async (statusFilter) => {
    const url = statusFilter ? `/exchanges?status=${statusFilter}` : '/exchanges';
    const response = await api.get(url);
    return response.data;
  },
  completeExchange: async (requestId, payload = {}) => {
    const response = await api.post(`/exchanges/${requestId}/complete`, payload);
    return response.data;
  },
  submitFeedback: async (exchangeId, feedbackData) => {
    const response = await api.post(`/exchanges/${exchangeId}/feedback`, feedbackData);
    return response.data;
  },
};

export default api;
