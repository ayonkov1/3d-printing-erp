import { apiClient } from './client'
import type { Color, ColorCreate } from '../types'

export const colorsApi = {
    /**
     * Get all colors
     */
    getColors: async (): Promise<Color[]> => {
        const response = await apiClient.get<Color[]>('/api/colors/')
        return response.data
    },

    /**
     * Get a single color by ID
     */
    getColor: async (id: string): Promise<Color> => {
        const response = await apiClient.get<Color>(`/api/colors/${id}/`)
        return response.data
    },

    /**
     * Create a new color
     */
    createColor: async (data: ColorCreate): Promise<Color> => {
        const response = await apiClient.post<Color>('/api/colors/', data)
        return response.data
    },

    /**
     * Update an existing color
     */
    updateColor: async (id: string, data: Partial<ColorCreate>): Promise<Color> => {
        const response = await apiClient.put<Color>(`/api/colors/${id}/`, data)
        return response.data
    },

    /**
     * Delete a color
     */
    deleteColor: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/colors/${id}/`)
    },

    /**
     * Search colors by name
     */
    searchByName: async (name: string): Promise<Color[]> => {
        const response = await apiClient.get<Color[]>('/api/colors/', {
            params: { name },
        })
        return response.data
    },
}

export default colorsApi
