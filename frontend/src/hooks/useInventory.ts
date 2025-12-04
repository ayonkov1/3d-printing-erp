import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../api'
import type { InventoryCreate, InventoryUpdate } from '../types'

// Query keys factory
export const inventoryKeys = {
    all: ['inventory'] as const,
    lists: () => [...inventoryKeys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...inventoryKeys.lists(), filters] as const,
    details: () => [...inventoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...inventoryKeys.details(), id] as const,
    bySpool: (spoolId: string) => [...inventoryKeys.all, 'bySpool', spoolId] as const,
    inUse: () => [...inventoryKeys.all, 'inUse'] as const,
    count: (spoolId: string) => [...inventoryKeys.all, 'count', spoolId] as const,
}

/**
 * Get all inventory items
 */
export const useInventory = (skip = 0, limit = 100) => {
    return useQuery({
        queryKey: inventoryKeys.list({ skip, limit }),
        queryFn: () => inventoryApi.getInventory(skip, limit),
    })
}

/**
 * Get a single inventory item by ID
 */
export const useInventoryItem = (id: string) => {
    return useQuery({
        queryKey: inventoryKeys.detail(id),
        queryFn: () => inventoryApi.getInventoryItem(id),
        enabled: !!id,
    })
}

/**
 * Get inventory items for a specific spool type
 */
export const useInventoryBySpool = (spoolId: string) => {
    return useQuery({
        queryKey: inventoryKeys.bySpool(spoolId),
        queryFn: () => inventoryApi.getBySpoolId(spoolId),
        enabled: !!spoolId,
    })
}

/**
 * Get all inventory items currently in use
 */
export const useInventoryInUse = () => {
    return useQuery({
        queryKey: inventoryKeys.inUse(),
        queryFn: () => inventoryApi.getInUse(),
    })
}

/**
 * Count inventory items for a spool type
 */
export const useInventoryCount = (spoolId: string) => {
    return useQuery({
        queryKey: inventoryKeys.count(spoolId),
        queryFn: () => inventoryApi.countBySpoolId(spoolId),
        enabled: !!spoolId,
    })
}

/**
 * Add a spool to inventory
 */
export const useAddToInventory = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: InventoryCreate) => inventoryApi.addToInventory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.inUse() })
        },
    })
}

/**
 * Update an inventory item
 */
export const useUpdateInventory = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: InventoryUpdate }) =>
            inventoryApi.updateInventory(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.inUse() })
        },
    })
}

/**
 * Delete an inventory item
 */
export const useDeleteInventory = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => inventoryApi.deleteInventory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.inUse() })
        },
    })
}

/**
 * Mark inventory item as in use
 */
export const useMarkInUse = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, customProperties }: { id: string; customProperties?: string }) =>
            inventoryApi.markInUse(id, customProperties),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.inUse() })
        },
    })
}

/**
 * Mark inventory item as back in stock
 */
export const useMarkInStock = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => inventoryApi.markInStock(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.inUse() })
        },
    })
}

/**
 * Update inventory weight after usage
 */
export const useUpdateWeight = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, newWeight }: { id: string; newWeight: number }) =>
            inventoryApi.updateWeight(id, newWeight),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
        },
    })
}

/**
 * Mark inventory item as depleted
 */
export const useMarkDepleted = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => inventoryApi.markDepleted(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
            queryClient.invalidateQueries({ queryKey: inventoryKeys.inUse() })
        },
    })
}
