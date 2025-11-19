import { apiClient } from './client'
import type { Spool, SpoolCreate, SpoolUpdate } from '../types'

export const spoolsApi = {
    /**
     * Get all spools
     */
    getSpools: async (): Promise<Spool[]> => {
        const response = await apiClient.get<Spool[]>('/api/spools')
        return response.data
    },

    /**
     * Get a single spool by ID
     */
    getSpool: async (id: string): Promise<Spool> => {
        const response = await apiClient.get<Spool>(`/api/spools/${id}`)
        return response.data
    },

    /**
     * Create a new spool
     */
    createSpool: async (data: SpoolCreate): Promise<Spool> => {
        const response = await apiClient.post<Spool>('/api/spools', data)
        return response.data
    },

    /**
     * Update an existing spool
     */
    updateSpool: async (id: string, data: SpoolUpdate): Promise<Spool> => {
        const response = await apiClient.put<Spool>(`/api/spools/${id}`, data)
        return response.data
    },

    /**
     * Delete a spool
     */
    deleteSpool: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/spools/${id}`)
    },

    /**
     * Get spools by status
     */
    getSpoolsByStatus: async (status: string): Promise<Spool[]> => {
        const response = await apiClient.get<Spool[]>('/api/spools', {
            params: { status },
        })
        return response.data
    },

    /**
     * Search spools by barcode
     */
    searchByBarcode: async (barcode: string): Promise<Spool[]> => {
        const response = await apiClient.get<Spool[]>('/api/spools', {
            params: { barcode },
        })
        return response.data
    },
}

export default spoolsApi
