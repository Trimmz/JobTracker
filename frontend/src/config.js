// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_ENDPOINTS = {
  JOBS: `${API_BASE_URL}/api/jobs`,
  APPLICATIONS: `${API_BASE_URL}/api/applications`,
  LOGIN: `${API_BASE_URL}/api/login`,
  SIGNUP: `${API_BASE_URL}/api/signup`,
};
