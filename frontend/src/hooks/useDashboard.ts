import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { dashboardApi } from '../api/dashboard'
import type { Insight } from '../types/dashboard'

// Query keys factory
export const dashboardKeys = {
    all: ['dashboard'] as const,
    dashboard: () => [...dashboardKeys.all, 'main'] as const,
    stats: () => [...dashboardKeys.all, 'stats'] as const,
    activity: (limit?: number) => [...dashboardKeys.all, 'activity', limit] as const,
    insights: () => [...dashboardKeys.all, 'insights'] as const,
    insightsHistory: (limit?: number) => [...dashboardKeys.insights(), 'history', limit] as const,
    latestInsight: () => [...dashboardKeys.insights(), 'latest'] as const,
    jobs: (limit?: number) => [...dashboardKeys.all, 'jobs', limit] as const,
}

/**
 * Get full dashboard data
 */
export const useDashboard = () => {
    return useQuery({
        queryKey: dashboardKeys.dashboard(),
        queryFn: () => dashboardApi.getDashboard(),
        refetchInterval: 30000, // Refresh every 30 seconds
    })
}

/**
 * Get inventory stats only
 */
export const useDashboardStats = () => {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: () => dashboardApi.getStats(),
    })
}

/**
 * Get recent activity logs
 */
export const useDashboardActivity = (limit = 50) => {
    return useQuery({
        queryKey: dashboardKeys.activity(limit),
        queryFn: () => dashboardApi.getActivity(limit),
    })
}

/**
 * Get insights history
 */
export const useInsightsHistory = (limit = 10) => {
    return useQuery({
        queryKey: dashboardKeys.insightsHistory(limit),
        queryFn: () => dashboardApi.getInsightsHistory(limit),
    })
}

/**
 * Get latest insight
 */
export const useLatestInsight = () => {
    return useQuery({
        queryKey: dashboardKeys.latestInsight(),
        queryFn: () => dashboardApi.getLatestInsight(),
        retry: false, // Don't retry if no insights exist
    })
}

/**
 * Generate a new AI insight
 */
export const useGenerateInsight = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => dashboardApi.generateInsight(),
        onSuccess: () => {
            // Invalidate all dashboard-related queries
            queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
        },
    })
}

/**
 * Delete an insight
 */
export const useDeleteInsight = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (insightId: string) => dashboardApi.deleteInsight(insightId),
        onSuccess: () => {
            // Invalidate all dashboard-related queries
            queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
        },
    })
}

/**
 * Get recent jobs
 */
export const useJobs = (limit = 20) => {
    return useQuery({
        queryKey: dashboardKeys.jobs(limit),
        queryFn: () => dashboardApi.getJobs(limit),
        refetchInterval: 10000, // Refresh every 10 seconds to catch job updates
    })
}

/**
 * Generate insight with streaming
 */
export const useGenerateInsightStream = () => {
    const queryClient = useQueryClient()
    const [isGenerating, setIsGenerating] = useState(false)
    const [streamingContent, setStreamingContent] = useState('')
    const [error, setError] = useState<string | null>(null)

    const generate = useCallback(async () => {
        setIsGenerating(true)
        setStreamingContent('')
        setError(null)

        try {
            await dashboardApi.generateInsightStream(
                (content) => {
                    // Append each chunk to the streaming content
                    setStreamingContent((prev) => prev + content)
                },
                (insight: Insight) => {
                    // When complete, invalidate queries to refresh the UI
                    queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
                    setIsGenerating(false)
                },
                (errorMsg) => {
                    setError(errorMsg)
                    setIsGenerating(false)
                },
            )
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate insight')
            setIsGenerating(false)
        }
    }, [queryClient])

    const reset = useCallback(() => {
        setStreamingContent('')
        setError(null)
    }, [])

    return {
        generate,
        isGenerating,
        streamingContent,
        error,
        reset,
    }
}
