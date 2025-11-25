import { apiClient } from './client'
import type { Material, MaterialCreate } from '../types'

export const materialsApi = {
    /**
     * Get all materials
     */
    getMaterials: async (): Promise<Material[]> => {
        const response = await apiClient.get<Material[]>('/api/materials/')
        return response.data
    },

    /**
     * Get a single material by ID
     */
    getMaterial: async (id: string): Promise<Material> => {
        const response = await apiClient.get<Material>(`/api/materials/${id}/`)
        return response.data
    },

    /**
     * Create a new material
     */
    createMaterial: async (data: MaterialCreate): Promise<Material> => {
        const response = await apiClient.post<Material>('/api/materials/', data)
        return response.data
    },

    /**
     * Update an existing material
     */
    updateMaterial: async (id: string, data: Partial<MaterialCreate>): Promise<Material> => {
        const response = await apiClient.put<Material>(`/api/materials/${id}/`, data)
        return response.data
    },

    /**
     * Delete a material
     */
    deleteMaterial: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/materials/${id}/`)
    },

    /**
     * Search materials by name
     */
    searchByName: async (name: string): Promise<Material[]> => {
        const response = await apiClient.get<Material[]>('/api/materials/', {
            params: { name },
        })
        return response.data
    },
}

export default materialsApi
