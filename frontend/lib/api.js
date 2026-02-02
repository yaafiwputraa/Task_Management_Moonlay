/**
 * API client configuration using Axios.
 * Handles HTTP requests to the backend with automatic JWT token injection.
 * @module lib/api
 */

import axios from "axios";

/**
 * Base API URL from environment variable.
 * @constant {string}
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

/**
 * Axios instance configured with base URL and request interceptors.
 * Automatically injects JWT token from localStorage to all requests.
 * @constant {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Request interceptor that automatically injects JWT token from localStorage.
 * Only runs on client-side (checks for window object).
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor that handles global error responses.
 * Automatically redirects to login on 401 Unauthorized.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Set or remove the authentication token in localStorage.
 * @param {string|null} token - JWT token to store, or null to remove.
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
}

/**
 * Load the authentication token from localStorage.
 * @returns {string|null} The stored JWT token or null if not found.
 */
export function loadTokenFromStorage() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default api;