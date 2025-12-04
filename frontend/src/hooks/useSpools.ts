import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { spoolsApi } from '../api'
import type { SpoolCreate, SpoolUpdate } from '../types'

// Query keys
export const spoolKeys = {
    all: ['spools'] as const,
    lists: () => [...spoolKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...spoolKeys.lists(), filters] as const,
    details: () => [...spoolKeys.all, 'detail'] as const,
    detail: (id: string) => [...spoolKeys.details(), id] as const,
}

/**
 * Fetch all spools
 */
export const useSpools = () => {
    return useQuery({
        queryKey: spoolKeys.lists(),
        queryFn: spoolsApi.getSpools,
    })
}

/**
 * Fetch a single spool by ID
 */
export const useSpool = (id: string) => {
    return useQuery({
        queryKey: spoolKeys.detail(id),
        queryFn: () => spoolsApi.getSpool(id),
        enabled: !!id,
    })
}

/**
 * Create a new spool
 */
export const useCreateSpool = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: SpoolCreate) => spoolsApi.createSpool(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: spoolKeys.lists() })
        },
    })
}

/**
 * Update an existing spool
 */
export const useUpdateSpool = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: SpoolUpdate }) => spoolsApi.updateSpool(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: spoolKeys.lists() })
            queryClient.invalidateQueries({
                queryKey: spoolKeys.detail(variables.id),
            })
        },
    })
}

/**
 * Delete a spool
 */
export const useDeleteSpool = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => spoolsApi.deleteSpool(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: spoolKeys.lists() })
        },
    })
}

/**
 * Search spools by barcode
 */
export const useSpoolsByBarcode = (barcode: string) => {
    return useQuery({
        queryKey: spoolKeys.list({ barcode }),
        queryFn: () => spoolsApi.searchByBarcode(barcode),
        enabled: !!barcode,
    })
}
