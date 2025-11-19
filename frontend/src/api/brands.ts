import { apiClient } from './client'
import type { Brand, BrandCreate } from '../types'

export const brandsApi = {
    /**
     * Get all brands
     */
    getBrands: async (): Promise<Brand[]> => {
        const response = await apiClient.get<Brand[]>('/brands')
        return response.data
    },

    /**
     * Get a single brand by ID
     */
    getBrand: async (id: string): Promise<Brand> => {
        const response = await apiClient.get<Brand>(`/brands/${id}`)
        return response.data
    },

    /**
     * Create a new brand
     */
    createBrand: async (data: BrandCreate): Promise<Brand> => {
        const response = await apiClient.post<Brand>('/brands', data)
        return response.data
    },

    /**
     * Update an existing brand
     */
    updateBrand: async (id: string, data: Partial<BrandCreate>): Promise<Brand> => {
        const response = await apiClient.put<Brand>(`/brands/${id}`, data)
        return response.data
    },

    /**
     * Delete a brand
     */
    deleteBrand: async (id: string): Promise<void> => {
        await apiClient.delete(`/brands/${id}`)
    },

    /**
     * Search brands by name
     */
    searchByName: async (name: string): Promise<Brand[]> => {
        const response = await apiClient.get<Brand[]>('/brands', {
            params: { name },
        })
        return response.data
    },
}

export default brandsApi
