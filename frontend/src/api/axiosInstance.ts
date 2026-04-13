import axios from 'axios';

// Create Base instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers:{
        'Content-Type': 'application/json',
    }
})

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Runs before every request is sent
api.interceptors.request.use(
  (config) => handleRequest(config),
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────────────────────────────────────
// Runs after every response comes back
api.interceptors.response.use(
  (response) => handleResponse(response),
  (error) => handleResponseError(error)
)

export default api

// Exported helpers for easier unit testing
export function handleRequest(config: any) {
  return config
}

export function handleResponse(response: any) {
  // If response is successful just return it as is
  return response
}

export function handleResponseError(error: any) {
  // Global error handling
  const status = error.response?.status

  if (status === 401) {
    // Token expired or invalid — clear storage and redirect to login
    // We use window.location to avoid circular import with router
    window.location.href = '/login'
  }

  if (status === 500) {
    console.error('Server error — please try again later')
  }

  return Promise.reject(error)
}