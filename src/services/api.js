import axios from 'axios';

// Base URL dari environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance dengan konfigurasi default
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor untuk menambahkan token jika ada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handling error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid, redirect ke login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },
  
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Accounts API
export const accountsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/accounts', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },
  
  create: async (accountData) => {
    const response = await api.post('/accounts', accountData);
    return response.data;
  },
  
  update: async (id, accountData) => {
    const response = await api.put(`/accounts/${id}`, accountData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },
  
  getTree: async () => {
    const response = await api.get('/accounts/tree');
    return response.data;
  },
};

// Transactions API
export const transactionsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
  
  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },
  
  update: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
  
  getStatistics: async (params = {}) => {
    const response = await api.get('/transactions/statistics', { params });
    return response.data;
  },
  
  getReport: async (params = {}) => {
    const response = await api.get('/transactions/report', { params });
    return response.data;
  },
};

// Account Summary API
export const summaryAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/account-summary', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/account-summary/${id}`);
    return response.data;
  },
  
  financialSummary: async (params = {}) => {
    const response = await api.get('/account-summary/financial', { params });
    return response.data;
  },
  
  getTopAccounts: async (params = {}) => {
    const response = await api.get('/account-summary/top', { params });
    return response.data;
  },
  
  getAccountBalance: async (id) => {
    const response = await api.get(`/account-summary/${id}/balance`);
    return response.data;
  },
};

export default api;
