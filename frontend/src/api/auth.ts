import { apiClient } from './client'

export interface User {
    id: string
    email: string
    full_name: string | null
    role: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface AuthResponse {
    access_token: string
    token_type: string
    user: User
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterCredentials {
    email: string
    password: string
    full_name?: string
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials)
        return response.data
    },

    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/api/auth/register', credentials)
        return response.data
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/api/auth/me')
        return response.data
    },
}
