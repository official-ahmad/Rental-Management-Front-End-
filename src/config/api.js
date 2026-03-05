// ============================================
// API Configuration - Switch Between Local & Live
// ============================================

// 🔁 Toggle this to switch between LOCAL and LIVE
const USE_LOCAL = false; // true = localhost, false = live server

// URLs
const LOCAL_URL = "http://localhost:8000";
const LIVE_URL = "https://rental-management-back-end.onrender.com";

// Active Base URL
export const API_BASE_URL = USE_LOCAL ? LOCAL_URL : LIVE_URL;

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
