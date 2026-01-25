// Dashboard types

export interface InventoryStats {
    total_spools: number
    total_weight: number
    spools_in_use: number
    low_stock_count: number
}

export interface ActivityLog {
    id: string
    action_type: string
    entity_type: string
    entity_id: string | null
    description: string
    extra_data: string | null
    user_id: string | null
    user_email: string | null
    created_at: string
}

export interface Insight {
    id: string
    content: string
    job_id: string | null
    generated_by: string
    created_at: string
}

export interface Job {
    id: string
    job_type: string
    status: 'ready' | 'processing' | 'completed' | 'failed'
    payload: string | null
    result: string | null
    error_message: string | null
    retry_count: number
    max_retries: number
    created_at: string
    started_at: string | null
    completed_at: string | null
}

export interface DashboardResponse {
    stats: InventoryStats
    recent_activity: ActivityLog[]
    latest_insight: Insight | null
}

export interface InsightsHistoryResponse {
    insights: Insight[]
}

export interface GenerateInsightResponse {
    insight: Insight
    message: string
}
