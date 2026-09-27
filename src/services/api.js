import axios from 'axios';

// Base API URL configuration
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for injecting JWT auth token
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

// Response interceptor for catching auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('skillloop_token');
      localStorage.removeItem('skillloop_user');
    }
    return Promise.reject(error);
  }
);

// Auth & Health API
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

export const usersAPI = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/me', profileData);
    return response.data;
  },
};

// Discovery API
export const discoverAPI = {
  getRecommendations: async (limit = 10) => {
    const response = await api.get(`/discover?limit=${limit}`);
    return response.data;
  },
};

// Learning Requests API
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

// Exchanges API
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
