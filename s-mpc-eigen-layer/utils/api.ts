import axios from 'axios';
import { getToken, removeToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Task-related API calls
export const taskApi = {
  createTask: (taskData) => api.post('/tasks', taskData),
  getUserTasks: () => api.get('/tasks'),
};

// Admin-related API calls
export const adminApi = {
  getAllTasks: () => api.get('/admin/tasks'),
  updateTaskStatus: (taskId, status) => api.patch(`/admin/tasks/${taskId}`, { status }),
  claimReward: (taskId) => api.post(`/admin/tasks/${taskId}/claim`),
};

// Authentication API calls
export const authApi = {
  login: (loginData) => api.post('/auth/login', loginData),
};

export default api; 