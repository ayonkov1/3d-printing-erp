import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { materialsApi } from '../api'
import type { MaterialCreate } from '../types'

// Query keys
export const materialKeys = {
    all: ['materials'] as const,
    lists: () => [...materialKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...materialKeys.lists(), filters] as const,
    details: () => [...materialKeys.all, 'detail'] as const,
    detail: (id: string) => [...materialKeys.details(), id] as const,
}

/**
 * Fetch all materials
 */
export const useMaterials = () => {
    return useQuery({
        queryKey: materialKeys.lists(),
        queryFn: materialsApi.getMaterials,
    })
}

/**
 * Fetch a single material by ID
 */
export const useMaterial = (id: string) => {
    return useQuery({
        queryKey: materialKeys.detail(id),
        queryFn: () => materialsApi.getMaterial(id),
        enabled: !!id,
    })
}

/**
 * Create a new material
 */
export const useCreateMaterial = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: MaterialCreate) => materialsApi.createMaterial(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() })
        },
    })
}

/**
 * Update an existing material
 */
export const useUpdateMaterial = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<MaterialCreate> }) => materialsApi.updateMaterial(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() })
            queryClient.invalidateQueries({
                queryKey: materialKeys.detail(variables.id),
            })
        },
    })
}

/**
 * Delete a material
 */
export const useDeleteMaterial = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => materialsApi.deleteMaterial(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: materialKeys.lists() })
        },
    })
}

/**
 * Search materials by name
 */
export const useMaterialsByName = (name: string) => {
    return useQuery({
        queryKey: materialKeys.list({ name }),
        queryFn: () => materialsApi.searchByName(name),
        enabled: !!name,
    })
}
