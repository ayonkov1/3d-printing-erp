import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useDashboard, useGenerateInsightStream, useInsightsHistory, useJobs, useDeleteInsight } from '../hooks/useDashboard'
import type { ActivityLog, Insight, Job } from '../types/dashboard'
import toast from 'react-hot-toast'
import { ConfirmModal } from './ConfirmModal'
import { NavBar } from './NavBar'
import {
    BarChart3,
    Package,
    Printer,
    AlertTriangle,
    Sparkles,
    RefreshCw,
    Clock,
    User,
    Plus,
    History,
    ChevronDown,
    ChevronUp,
    Briefcase,
    CheckCircle2,
    XCircle,
    Loader2,
    PlayCircle,
    Trash2,
} from 'lucide-react'

// Utility function to format relative time
const formatRelativeTime = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now.getTime() - date.getTime()

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diffInMs < minute) {
        return 'Just now'
    } else if (diffInMs < hour) {
        const mins = Math.floor(diffInMs / minute)
        return `${mins}m ago`
    } else if (diffInMs < day) {
        const hours = Math.floor(diffInMs / hour)
        return `${hours}h ago`
    } else {
        const days = Math.floor(diffInMs / day)
        return `${days}d ago`
    }
}

// Action type icons and colors
const getActionIcon = (actionType: string): { icon: React.ReactNode; color: string } => {
    switch (actionType) {
        case 'inventory_added':
            return { icon: <Plus className="w-4 h-4" />, color: 'text-green-500 bg-green-100 dark:bg-green-900/30' }
        case 'inventory_updated':
        case 'weight_updated':
            return { icon: <RefreshCw className="w-4 h-4" />, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' }
        case 'inventory_deleted':
            return { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' }
        case 'status_changed':
            return { icon: <Printer className="w-4 h-4" />, color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' }
        case 'spool_created':
            return { icon: <Package className="w-4 h-4" />, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' }
        default:
            return { icon: <Clock className="w-4 h-4" />, color: 'text-gray-500 bg-gray-100 dark:bg-gray-700' }
    }
}

// Job status icons and colors
const getJobStatusIcon = (status: string): { icon: React.ReactNode; color: string; bgColor: string } => {
    switch (status) {
        case 'ready':
            return {
                icon: <PlayCircle className="w-4 h-4" />,
                color: 'text-blue-500',
                bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            }
        case 'processing':
            return {
                icon: <Loader2 className="w-4 h-4 animate-spin" />,
                color: 'text-amber-500',
                bgColor: 'bg-amber-100 dark:bg-amber-900/30',
            }
        case 'completed':
            return {
                icon: <CheckCircle2 className="w-4 h-4" />,
                color: 'text-green-500',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
            }
        case 'failed':
            return {
                icon: <XCircle className="w-4 h-4" />,
                color: 'text-red-500',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
            }
        default:
            return {
                icon: <Clock className="w-4 h-4" />,
                color: 'text-gray-500',
                bgColor: 'bg-gray-100 dark:bg-gray-700',
            }
    }
}

// Stat card component
const StatCard: React.FC<{
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    subtitle?: string
}> = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        </div>
    </div>
)

// Activity item component
const ActivityItem: React.FC<{ log: ActivityLog }> = ({ log }) => {
    const { icon, color } = getActionIcon(log.action_type)

    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">{log.description}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(log.created_at)}</span>
                    {log.user_email && (
                        <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.user_email}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// Job item component
const JobItem: React.FC<{ job: Job }> = ({ job }) => {
    const { icon, color, bgColor } = getJobStatusIcon(job.status)

    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className={`p-2 rounded-lg ${bgColor}`}>
                <span className={color}>{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{job.job_type.replace(/_/g, ' ')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${bgColor} ${color} font-medium capitalize`}>{job.status}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(job.created_at)}</span>
                    {job.error_message && (
                        <>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span
                                className="text-xs text-red-500 truncate max-w-[150px]"
                                title={job.error_message}
                            >
                                {job.error_message}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// AI Insight panel with markdown rendering and streaming support
const InsightPanel: React.FC<{
    insight: Insight | null
    onGenerate: () => void
    isGenerating: boolean
    streamingContent?: string
}> = ({ insight, onGenerate, isGenerating, streamingContent = '' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights</h3>
            </div>
            <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Get Insights'}
            </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
            {isGenerating && streamingContent ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="mb-2 flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating insights...
                    </div>
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 mt-3">{children}</h3>,
                            p: ({ children }) => <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                            em: ({ children }) => <em className="italic text-gray-600 dark:text-gray-400">{children}</em>,
                            code: ({ children }) => (
                                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-purple-600 dark:text-purple-400">
                                    {children}
                                </code>
                            ),
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-3">{children}</blockquote>
                            ),
                        }}
                    >
                        {streamingContent}
                    </ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1" />
                </div>
            ) : insight ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 mt-3">{children}</h3>,
                            p: ({ children }) => <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                            em: ({ children }) => <em className="italic text-gray-600 dark:text-gray-400">{children}</em>,
                            code: ({ children }) => (
                                <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-purple-600 dark:text-purple-400">
                                    {children}
                                </code>
                            ),
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 dark:text-gray-400 my-3">{children}</blockquote>
                            ),
                        }}
                    >
                        {insight.content}
                    </ReactMarkdown>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        Generated {formatRelativeTime(insight.created_at)} • {insight.generated_by}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No insights generated yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Click "Get Insights" to analyze your inventory data with AI</p>
                </div>
            )}
        </div>
    </div>
)

// Insights history component
const InsightsHistory: React.FC<{
    insights: Insight[]
    onDelete: (id: string) => void
    isDeleting: boolean
}> = ({ insights, onDelete, isDeleting }) => {
    const [expanded, setExpanded] = useState<string | null>(null)

    if (insights.length === 0) return null

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Past Insights</h3>
                </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[300px] overflow-y-auto">
                {insights.map((insight) => (
                    <div
                        key={insight.id}
                        className="p-4"
                    >
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setExpanded(expanded === insight.id ? null : insight.id)}
                                className="flex-1 flex items-center justify-between text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatRelativeTime(insight.created_at)}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                        {insight.generated_by}
                                    </span>
                                </div>
                                {expanded === insight.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(insight.id)
                                }}
                                disabled={isDeleting}
                                className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                                title="Delete insight"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {expanded === insight.id && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{insight.content}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Main Dashboard component
export const Dashboard: React.FC = () => {
    const { data: dashboard, isLoading, error } = useDashboard()
    const { data: insightsHistory } = useInsightsHistory(5)
    const { data: jobs } = useJobs(10)
    const { generate, isGenerating, streamingContent, error: streamError, reset } = useGenerateInsightStream()
    const deleteInsight = useDeleteInsight()

    // State for delete confirmation modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [insightToDelete, setInsightToDelete] = useState<string | null>(null)

    const handleGenerateInsight = async () => {
        reset() // Clear any previous streaming content
        try {
            await generate()
            toast.success('Insight generated successfully')
        } catch (err) {
            toast.error(streamError || 'Failed to generate insight')
        }
    }

    const handleDeleteClick = (insightId: string) => {
        setInsightToDelete(insightId)
        setDeleteModalOpen(true)
    }

    const handleConfirmDelete = () => {
        if (insightToDelete) {
            deleteInsight.mutate(insightToDelete, {
                onSuccess: () => {
                    toast.success('Insight deleted')
                    setDeleteModalOpen(false)
                    setInsightToDelete(null)
                },
                onError: (err) => {
                    toast.error(`Failed to delete insight: ${err.message}`)
                },
            })
        }
    }

    const handleCancelDelete = () => {
        setDeleteModalOpen(false)
        setInsightToDelete(null)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-lime-500" />
                    <span className="text-gray-600 dark:text-gray-400">Loading dashboard...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Failed to load dashboard</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    const stats = dashboard?.stats
    const activity = dashboard?.recent_activity || []
    const latestInsight = dashboard?.latest_insight
    const pastInsights = insightsHistory?.insights.slice(1) || [] // Exclude latest

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="w-full px-8 py-6">
                <NavBar title="Dashboard" />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Spools"
                        value={stats?.total_spools || 0}
                        icon={<Package className="w-6 h-6 text-white" />}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Total Weight"
                        value={`${((stats?.total_weight || 0) / 1000).toFixed(1)} kg`}
                        icon={<BarChart3 className="w-6 h-6 text-white" />}
                        color="bg-green-500"
                        subtitle={`${stats?.total_weight?.toLocaleString() || 0}g`}
                    />
                    <StatCard
                        title="In Use"
                        value={stats?.spools_in_use || 0}
                        icon={<Printer className="w-6 h-6 text-white" />}
                        color="bg-amber-500"
                    />
                    <StatCard
                        title="Low Stock"
                        value={stats?.low_stock_count || 0}
                        icon={<AlertTriangle className="w-6 h-6 text-white" />}
                        color={stats?.low_stock_count ? 'bg-red-500' : 'bg-gray-400'}
                        subtitle={stats?.low_stock_count ? 'Need attention' : 'All good'}
                    />
                </div>

                {/* Main Content Grid - 3 columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1 - Jobs & History */}
                    <div className="space-y-6">
                        {/* Jobs Panel */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-gray-500" />
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Jobs</h3>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{jobs?.length || 0} jobs</span>
                                </div>
                            </div>
                            <div className="p-4 max-h-[300px] overflow-y-auto">
                                {jobs && jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <JobItem
                                            key={job.id}
                                            job={job}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No jobs yet</p>
                                        <p className="text-sm">Jobs will appear here when you generate insights</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Past Insights History */}
                        {pastInsights.length > 0 && (
                            <InsightsHistory
                                insights={pastInsights}
                                onDelete={handleDeleteClick}
                                isDeleting={deleteInsight.isPending}
                            />
                        )}
                    </div>

                    {/* Column 2 - AI Insights Output */}
                    <div className="min-h-[500px]">
                        <InsightPanel
                            insight={latestInsight || null}
                            onGenerate={handleGenerateInsight}
                            isGenerating={isGenerating}
                            streamingContent={streamingContent}
                        />
                    </div>

                    {/* Column 3 - Activity Feed */}
                    <div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">{activity.length} events</span>
                                </div>
                            </div>
                            <div className="p-4 max-h-[600px] overflow-y-auto">
                                {activity.length > 0 ? (
                                    activity.map((log) => (
                                        <ActivityItem
                                            key={log.id}
                                            log={log}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No recent activity</p>
                                        <p className="text-sm">Activity will appear here as you manage your inventory</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Insight Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Insight"
                message="Are you sure you want to delete this insight? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={deleteInsight.isPending}
                variant="danger"
            />
        </div>
    )
}

export default Dashboard
