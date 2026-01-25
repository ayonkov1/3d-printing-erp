import { apiClient } from './client'
import type { DashboardResponse, InventoryStats, ActivityLog, InsightsHistoryResponse, Insight, GenerateInsightResponse, Job } from '../types/dashboard'

export const dashboardApi = {
    /**
     * Get full dashboard data (stats + activity + latest insight)
     */
    getDashboard: async (): Promise<DashboardResponse> => {
        const response = await apiClient.get<DashboardResponse>('/api/dashboard/')
        return response.data
    },

    /**
     * Get inventory statistics only
     */
    getStats: async (): Promise<InventoryStats> => {
        const response = await apiClient.get<InventoryStats>('/api/dashboard/stats')
        return response.data
    },

    /**
     * Get recent activity logs
     */
    getActivity: async (limit = 50): Promise<ActivityLog[]> => {
        const response = await apiClient.get<ActivityLog[]>('/api/dashboard/activity', {
            params: { limit },
        })
        return response.data
    },

    /**
     * Get historical AI insights
     */
    getInsightsHistory: async (limit = 10): Promise<InsightsHistoryResponse> => {
        const response = await apiClient.get<InsightsHistoryResponse>('/api/dashboard/insights', {
            params: { limit },
        })
        return response.data
    },

    /**
     * Get the most recent AI insight
     */
    getLatestInsight: async (): Promise<Insight> => {
        const response = await apiClient.get<Insight>('/api/dashboard/insights/latest')
        return response.data
    },

    /**
     * Delete an insight by ID
     */
    deleteInsight: async (insightId: string): Promise<void> => {
        await apiClient.delete(`/api/dashboard/insights/${insightId}`)
    },

    /**
     * Generate a new AI insight (synchronous - may take 5-10 seconds)
     */
    generateInsight: async (): Promise<GenerateInsightResponse> => {
        const response = await apiClient.post<GenerateInsightResponse>('/api/dashboard/insights/generate')
        return response.data
    },

    /**
     * Get recent jobs and their status
     */
    getJobs: async (limit = 20): Promise<Job[]> => {
        const response = await apiClient.get<Job[]>('/api/dashboard/jobs', {
            params: { limit },
        })
        return response.data
    },
}

export default dashboardApi
