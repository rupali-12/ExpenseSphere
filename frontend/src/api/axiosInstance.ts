import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => handleRequest(config),
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => handleResponse(response),
  (error) => handleResponseError(error),
);

export default api;

export function handleRequest(config: any) {
  // Attach token from localStorage to every request
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

export function handleResponse(response: any) {
  return response;
}

export function handleResponseError(error: any) {
  const status = error.response?.status;

  if (status === 401 && !error.config.url.includes("/login")) {
    // Clear token and redirect to login
    localStorage.removeItem("token")
    window.location.href = "/login";
  }

  if (status === 500) {
    console.error("Server error — please try again later");
  }

  return Promise.reject(error);
}