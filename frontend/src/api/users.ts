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

export interface UpdateUserRoleRequest {
    role: 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER'
}

export interface UpdateUserStatusRequest {
    is_active: boolean
}

export const usersApi = {
    /**
     * List all users (Admin only)
     */
    listUsers: async (): Promise<User[]> => {
        const response = await apiClient.get<User[]>('/api/users')
        return response.data
    },

    /**
     * Update user role (Admin only)
     */
    updateUserRole: async (userId: string, role: UpdateUserRoleRequest['role']): Promise<User> => {
        const response = await apiClient.patch<User>(`/api/users/${userId}/role`, null, {
            params: { role },
        })
        return response.data
    },

    /**
     * Activate or deactivate user (Admin only)
     */
    updateUserStatus: async (userId: string, isActive: boolean): Promise<User> => {
        const response = await apiClient.patch<User>(`/api/users/${userId}/status`, null, {
            params: { is_active: isActive },
        })
        return response.data
    },
}
