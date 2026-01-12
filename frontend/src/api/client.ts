import axios from 'axios'
import { showError } from '../lib/toast'

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
            // Only redirect if we're not already on the login page
            const currentPath = window.location.pathname
            if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                showError('Your session has expired. Please log in again.')
                window.location.href = '/login'
            }
        }

        if (error.response?.status === 404) {
            console.error('Resource not found:', error.config?.url)
        }

        if (error.response?.status >= 500) {
            console.error('Server error occurred:', error.response?.status)
        }

        return Promise.reject(error)
    },
)

export default apiClient
