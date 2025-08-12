import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.',
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({
        success: false,
        message: 'An unexpected error occurred.',
      });
    }
  }
);

// Process API functions
export const generateFromText = async (data) => {
  return api.post('/processes/generate', data);
};

export const generateFromGuided = async (data) => {
  return api.post('/processes/guided', data);
};

export const optimizeProcess = async (data) => {
  return api.post('/processes/optimize', data);
};

export const getProcess = async (id) => {
  return api.get(`/processes/${id}`);
};

export const updateProcess = async (id, data) => {
  return api.put(`/processes/${id}`, data);
};

export const deleteProcess = async (id) => {
  return api.delete(`/processes/${id}`);
};

export const getAllProcesses = async (params = {}) => {
  return api.get('/processes', { params });
};

// Question API functions
export const getBpmnQuestions = async () => {
  return api.get('/questions/bpmn');
};

export const getIndustryQuestions = async (industry) => {
  return api.get(`/questions/industry/${industry}`);
};

export const getAllQuestionSets = async () => {
  return api.get('/questions');
};

// Export API functions
export const exportAsPng = async (data) => {
  return api.post('/export/png', data);
};

export const exportAsSvg = async (data) => {
  return api.post('/export/svg', data);
};

export const exportAsXml = async (data) => {
  return api.post('/export/xml', data, {
    responseType: 'blob',
  });
};

// Auth API functions
export const createGuestSession = async () => {
  return api.post('/auth/guest');
};

export default api;
