import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { colorsApi } from '../api'
import type { ColorCreate } from '../types'

// Query keys
export const colorKeys = {
    all: ['colors'] as const,
    lists: () => [...colorKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...colorKeys.lists(), filters] as const,
    details: () => [...colorKeys.all, 'detail'] as const,
    detail: (id: string) => [...colorKeys.details(), id] as const,
}

/**
 * Fetch all colors
 */
export const useColors = () => {
    return useQuery({
        queryKey: colorKeys.lists(),
        queryFn: colorsApi.getColors,
    })
}

/**
 * Fetch a single color by ID
 */
export const useColor = (id: string) => {
    return useQuery({
        queryKey: colorKeys.detail(id),
        queryFn: () => colorsApi.getColor(id),
        enabled: !!id,
    })
}

/**
 * Create a new color
 */
export const useCreateColor = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: ColorCreate) => colorsApi.createColor(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: colorKeys.lists() })
        },
    })
}

/**
 * Update an existing color
 */
export const useUpdateColor = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ColorCreate> }) => colorsApi.updateColor(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: colorKeys.lists() })
            queryClient.invalidateQueries({
                queryKey: colorKeys.detail(variables.id),
            })
        },
    })
}

/**
 * Delete a color
 */
export const useDeleteColor = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => colorsApi.deleteColor(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: colorKeys.lists() })
        },
    })
}

/**
 * Search colors by name
 */
export const useColorsByName = (name: string) => {
    return useQuery({
        queryKey: colorKeys.list({ name }),
        queryFn: () => colorsApi.searchByName(name),
        enabled: !!name,
    })
}
