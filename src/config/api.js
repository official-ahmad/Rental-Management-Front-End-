const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export { API_BASE_URL };

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

export const API = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },

  BOOKINGS: {
    CREATE: `${API_BASE_URL}/api/bookings/create`,
    REQUEST: `${API_BASE_URL}/api/bookings/request`,
    ALL_REQUESTS: `${API_BASE_URL}/api/bookings/all-requests`,
    MY_BOOKING: (userId) => `${API_BASE_URL}/api/bookings/my-booking/${userId}`,
    UPDATE: (bookingId) => `${API_BASE_URL}/api/bookings/update/${bookingId}`,
    PAY: (bookingId) => `${API_BASE_URL}/api/bookings/pay/${bookingId}`,
    CANCEL: (bookingId) => `${API_BASE_URL}/api/bookings/cancel/${bookingId}`,
  },

  HOME: {
    ALL: `${API_BASE_URL}/api/home/all`,
    BY_ID: (id) => `${API_BASE_URL}/api/home/${id}`,
  },

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
