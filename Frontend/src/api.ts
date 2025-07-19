export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export const API_ENDPOINTS = {
  // User endpoints
  register: `${API_BASE_URL}/api/users/register`,
  login: `${API_BASE_URL}/api/users/login`,
  getUser: (email: string) => `${API_BASE_URL}/api/users/${email}`,
  updateUser: (id: string) => `${API_BASE_URL}/api/users/update/${id}`,
  deleteUser: (id: string) => `${API_BASE_URL}/api/users/delete/${id}`,
  forgotPassword: `${API_BASE_URL}/api/users/forgot-password`,
  verifyEmail: `${API_BASE_URL}/api/users/verify-email`,
  
  // News endpoints
  dailyNews: `${API_BASE_URL}/api/news/Daily`,
  newsByCountry: `${API_BASE_URL}/api/news/Country`,
  
  // Team endpoints
  teamAbout: `${API_BASE_URL}/api/team/About`,
};