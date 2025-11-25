import axios from 'axios'

// In production (Docker), use empty string for relative paths (same origin via Nginx proxy)
// In development, use localhost:8000 to hit backend directly
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
})

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
            // Handle unauthorized
            localStorage.removeItem('token')
            window.location.href = '/login'
        }

        if (error.response?.status === 404) {
            console.error('Resource not found')
        }

        if (error.response?.status >= 500) {
            console.error('Server error occurred')
        }

        return Promise.reject(error)
    },
)

export default apiClient
