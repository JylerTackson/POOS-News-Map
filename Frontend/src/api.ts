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
  addFavorite: (userId: string) => `${API_BASE_URL}/api/users/${userId}/favorites`,      // ADD THIS
  removeFavorite: (userId: string) => `${API_BASE_URL}/api/users/${userId}/favorites`,  // ADD THIS
  resendVerification: `${API_BASE_URL}/api/users/resend-verification`,

  // News endpoints
  dailyNews: `${API_BASE_URL}/api/news/Daily`,
  newsByCountry: (countryCode: string) => `${API_BASE_URL}/api/news/Country/${countryCode}`,
  getCountryFromCoords: (lat: number, lng: number) => `${API_BASE_URL}/api/news/country-from-coords/${lat}/${lng}`,  // ADD THIS LINE
  
  // Team endpoints
  teamAbout: `${API_BASE_URL}/api/team/About`,
};