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
     * Generate a new AI insight with streaming (streams content as it's generated)
     * @param onChunk - Callback for each content chunk
     * @param onComplete - Callback when insight is complete with saved insight data
     * @param onError - Callback for errors
     */
    generateInsightStream: async (
        onChunk: (content: string) => void,
        onComplete: (insight: Insight) => void,
        onError: (error: string) => void,
    ): Promise<void> => {
        const token = localStorage.getItem('token')

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/dashboard/insights/generate/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to generate insight: ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
            throw new Error('No response body')
        }

        try {
            while (true) {
                const { done, value } = await reader.read()

                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        try {
                            const parsed = JSON.parse(data)

                            if (parsed.type === 'content') {
                                onChunk(parsed.content)
                            } else if (parsed.type === 'complete') {
                                onComplete(parsed.insight)
                            } else if (parsed.type === 'error') {
                                onError(parsed.error)
                            }
                        } catch (e) {
                            // Ignore JSON parse errors
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock()
        }
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
