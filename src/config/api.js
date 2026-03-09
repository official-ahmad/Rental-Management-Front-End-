// ============================================
// API Configuration — auto-detects environment
// ============================================

// In development: create .env with VITE_API_URL=http://localhost:8000
// In production (Vercel): set VITE_API_URL in environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://rental-management-back-end.onrender.com";

export { API_BASE_URL };

// Axios instance with automatic auth headers
import axios from "axios";

export const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// API Endpoints
export const API = {
  // Auth
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },

  // Bookings
  BOOKINGS: {
    CREATE: `${API_BASE_URL}/api/bookings/create`,
    REQUEST: `${API_BASE_URL}/api/bookings/request`,
    ALL_REQUESTS: `${API_BASE_URL}/api/bookings/all-requests`,
    MY_BOOKING: (userId) => `${API_BASE_URL}/api/bookings/my-booking/${userId}`,
    UPDATE: (bookingId) => `${API_BASE_URL}/api/bookings/update/${bookingId}`,
    PAY: (bookingId) => `${API_BASE_URL}/api/bookings/pay/${bookingId}`,
    CANCEL: (bookingId) => `${API_BASE_URL}/api/bookings/cancel/${bookingId}`,
  },

  // Home/Properties
  HOME: {
    ALL: `${API_BASE_URL}/api/home/all`,
  },

  // Manager
  MANAGER: {
    BASE: `${API_BASE_URL}/api/manager`,
    PROPERTIES: `${API_BASE_URL}/api/manager/properties`,
    USERS: `${API_BASE_URL}/api/manager/users`,
    ADD: `${API_BASE_URL}/api/manager/add`,
    UPDATE: (id) => `${API_BASE_URL}/api/manager/update/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/manager/delete/${id}`,
  },
};

export default API;
