import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Reports API
export const reportsApi = {
  getQuestions: async (data: {
    business_idea: string;
    location?: string;
    budget_range?: string;
    business_type?: string;
    target_customer?: string;
  }) => {
    const response = await api.post('/reports/questions', data);
    return response.data;
  },

  generateReport: async (data: {
    business_idea: string;
    location?: string;
    budget_range?: string;
    business_type?: string;
    target_customer?: string;
  }) => {
    const response = await api.post('/reports/generate', data);
    return response.data;
  },

  getReports: async (skip = 0, limit = 10) => {
    const response = await api.get('/reports', { params: { skip, limit } });
    return response.data;
  },

  getReport: async (id: string) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  deleteReport: async (id: string) => {
    await api.delete(`/reports/${id}`);
  },
};

export default api;