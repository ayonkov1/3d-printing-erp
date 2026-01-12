import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Standard error response from backend
 */
interface ApiErrorResponse {
    detail?: string | { msg: string }[]
    message?: string
    error?: string
}

/**
 * Toast configuration options
 */
interface ToastOptions {
    duration?: number
    position?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left'
}

/**
 * Default toast durations
 */
const DEFAULT_DURATIONS = {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000,
}

/**
 * Show a success toast notification
 */
export const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, {
        duration: options?.duration ?? DEFAULT_DURATIONS.success,
        position: options?.position ?? 'top-right',
        style: {
            background: '#10B981',
            color: '#fff',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
        },
    })
}

/**
 * Show an error toast notification
 */
export const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, {
        duration: options?.duration ?? DEFAULT_DURATIONS.error,
        position: options?.position ?? 'top-right',
        style: {
            background: '#EF4444',
            color: '#fff',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
        },
    })
}

/**
 * Show a warning toast notification
 */
export const showWarning = (message: string, options?: ToastOptions) => {
    toast(message, {
        duration: options?.duration ?? DEFAULT_DURATIONS.warning,
        position: options?.position ?? 'top-right',
        icon: '⚠️',
        style: {
            background: '#F59E0B',
            color: '#fff',
        },
    })
}

/**
 * Show an info toast notification
 */
export const showInfo = (message: string, options?: ToastOptions) => {
    toast(message, {
        duration: options?.duration ?? DEFAULT_DURATIONS.info,
        position: options?.position ?? 'top-right',
        icon: 'ℹ️',
        style: {
            background: '#3B82F6',
            color: '#fff',
        },
    })
}

/**
 * Parse error message from various error formats
 */
const parseErrorMessage = (error: unknown): string => {
    // Handle axios errors
    if (isAxiosError(error)) {
        const data = error.response?.data as ApiErrorResponse

        // Check for detail field (FastAPI standard)
        if (data?.detail) {
            // Handle string detail
            if (typeof data.detail === 'string') {
                return data.detail
            }
            // Handle validation errors (array of objects)
            if (Array.isArray(data.detail) && data.detail.length > 0) {
                return data.detail.map((err) => err.msg).join(', ')
            }
        }

        // Check for message field
        if (data?.message) {
            return data.message
        }

        // Check for error field
        if (data?.error) {
            return data.error
        }

        // HTTP status based messages
        if (error.response?.status === 401) {
            return 'Invalid credentials. Please check your email and password.'
        }

        if (error.response?.status === 403) {
            return 'You do not have permission to perform this action.'
        }

        if (error.response?.status === 404) {
            return 'The requested resource was not found.'
        }

        if (error.response?.status === 422) {
            return 'Validation error. Please check your input.'
        }

        if (error.response?.status === 500) {
            return 'Server error. Please try again later.'
        }

        if (error.response?.status === 503) {
            return 'Service temporarily unavailable. Please try again later.'
        }

        // Network errors
        if (error.code === 'ERR_NETWORK') {
            return 'Network error. Please check your connection.'
        }

        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return 'Request timeout. Please try again.'
        }

        // Generic axios error
        return error.message || 'An unexpected error occurred.'
    }

    // Handle Error objects
    if (error instanceof Error) {
        return error.message
    }

    // Handle string errors
    if (typeof error === 'string') {
        return error
    }

    // Fallback
    return 'An unexpected error occurred. Please try again.'
}

/**
 * Type guard for AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
    return typeof error === 'object' && error !== null && 'isAxiosError' in error && error.isAxiosError === true
}

/**
 * Show an error toast with automatic error parsing
 * Handles various error formats (axios, Error, string, etc.)
 */
export const showApiError = (error: unknown, fallbackMessage?: string, options?: ToastOptions) => {
    const message = parseErrorMessage(error)
    showError(fallbackMessage && message === 'An unexpected error occurred. Please try again.' ? fallbackMessage : message, options)
}

/**
 * Show a loading toast and return methods to update it
 */
export const showLoading = (message: string = 'Loading...') => {
    const toastId = toast.loading(message, {
        position: 'top-right',
    })

    return {
        success: (successMessage: string) => {
            toast.success(successMessage, { id: toastId })
        },
        error: (errorMessage: string) => {
            toast.error(errorMessage, { id: toastId })
        },
        dismiss: () => {
            toast.dismiss(toastId)
        },
    }
}

/**
 * Dismiss all toasts
 */
export const dismissAll = () => {
    toast.dismiss()
}

/**
 * Promise toast - automatically handles loading, success, and error states
 */
export const showPromiseToast = <T>(
    promise: Promise<T>,
    messages: {
        loading: string
        success: string | ((data: T) => string)
        error?: string | ((error: unknown) => string)
    },
    options?: ToastOptions,
): Promise<T> => {
    return toast.promise(
        promise,
        {
            loading: messages.loading,
            success: messages.success,
            error: messages.error || ((err) => parseErrorMessage(err)),
        },
        {
            position: options?.position ?? 'top-right',
            success: {
                duration: options?.duration ?? DEFAULT_DURATIONS.success,
            },
            error: {
                duration: options?.duration ?? DEFAULT_DURATIONS.error,
            },
        },
    )
}
