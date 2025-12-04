import { apiClient } from './client'
import type { Inventory, InventoryCreate, InventoryUpdate, InventoryCount } from '../types'

export const inventoryApi = {
    /**
     * Get all inventory items
     */
    getInventory: async (skip = 0, limit = 100): Promise<Inventory[]> => {
        const response = await apiClient.get<Inventory[]>('/api/inventory/', {
            params: { skip, limit },
        })
        return response.data
    },

    /**
     * Get a single inventory item by ID
     */
    getInventoryItem: async (id: string): Promise<Inventory> => {
        const response = await apiClient.get<Inventory>(`/api/inventory/${id}`)
        return response.data
    },

    /**
     * Add a spool to inventory
     */
    addToInventory: async (data: InventoryCreate): Promise<Inventory> => {
        const response = await apiClient.post<Inventory>('/api/inventory/', data)
        return response.data
    },

    /**
     * Update an inventory item (weight, status, etc.)
     */
    updateInventory: async (id: string, data: InventoryUpdate): Promise<Inventory> => {
        const response = await apiClient.patch<Inventory>(`/api/inventory/${id}`, data)
        return response.data
    },

    /**
     * Delete an inventory item
     */
    deleteInventory: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/inventory/${id}`)
    },

    /**
     * Get all inventory items for a specific spool type
     */
    getBySpoolId: async (spoolId: string): Promise<Inventory[]> => {
        const response = await apiClient.get<Inventory[]>(`/api/inventory/by-spool/${spoolId}`)
        return response.data
    },

    /**
     * Get all inventory items currently in use
     */
    getInUse: async (): Promise<Inventory[]> => {
        const response = await apiClient.get<Inventory[]>('/api/inventory/in-use')
        return response.data
    },

    /**
     * Count how many units of a spool type are in inventory
     */
    countBySpoolId: async (spoolId: string): Promise<InventoryCount> => {
        const response = await apiClient.get<InventoryCount>(`/api/inventory/count/${spoolId}`)
        return response.data
    },

    /**
     * Mark an inventory item as in use (loaded in printer)
     */
    markInUse: async (id: string, customProperties?: string): Promise<Inventory> => {
        return inventoryApi.updateInventory(id, {
            is_in_use: true,
            status_name: 'in_use',
            custom_properties: customProperties,
        })
    },

    /**
     * Mark an inventory item as back in stock
     */
    markInStock: async (id: string): Promise<Inventory> => {
        return inventoryApi.updateInventory(id, {
            is_in_use: false,
            status_name: 'in_stock',
        })
    },

    /**
     * Update weight after usage
     */
    updateWeight: async (id: string, newWeight: number): Promise<Inventory> => {
        return inventoryApi.updateInventory(id, {
            weight: newWeight,
        })
    },

    /**
     * Mark as depleted
     */
    markDepleted: async (id: string): Promise<Inventory> => {
        return inventoryApi.updateInventory(id, {
            weight: 0,
            is_in_use: false,
            status_name: 'depleted',
        })
    },
}

export default inventoryApi
