import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { brandsApi } from '../api'
import type { BrandCreate } from '../types'

// Query keys
export const brandKeys = {
    all: ['brands'] as const,
    lists: () => [...brandKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...brandKeys.lists(), filters] as const,
    details: () => [...brandKeys.all, 'detail'] as const,
    detail: (id: string) => [...brandKeys.details(), id] as const,
}

/**
 * Fetch all brands
 */
export const useBrands = () => {
    return useQuery({
        queryKey: brandKeys.lists(),
        queryFn: brandsApi.getBrands,
    })
}

/**
 * Fetch a single brand by ID
 */
export const useBrand = (id: string) => {
    return useQuery({
        queryKey: brandKeys.detail(id),
        queryFn: () => brandsApi.getBrand(id),
        enabled: !!id,
    })
}

/**
 * Create a new brand
 */
export const useCreateBrand = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: BrandCreate) => brandsApi.createBrand(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
        },
    })
}

/**
 * Update an existing brand
 */
export const useUpdateBrand = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<BrandCreate> }) => brandsApi.updateBrand(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
            queryClient.invalidateQueries({
                queryKey: brandKeys.detail(variables.id),
            })
        },
    })
}

/**
 * Delete a brand
 */
export const useDeleteBrand = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => brandsApi.deleteBrand(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
        },
    })
}

/**
 * Search brands by name
 */
export const useBrandsByName = (name: string) => {
    return useQuery({
        queryKey: brandKeys.list({ name }),
        queryFn: () => brandsApi.searchByName(name),
        enabled: !!name,
    })
}
