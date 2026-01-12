/**
 * Toast Notification System - Usage Examples
 *
 * Import from lib:
 * import { showSuccess, showError, showWarning, showInfo, showApiError, showPromiseToast } from '../lib/toast'
 */

// ========================================
// Basic Toast Notifications
// ========================================

// Success
showSuccess('Operation completed successfully!')
showSuccess('User updated!', { duration: 4000 })

// Error
showError('Something went wrong!')
showError('Failed to save data', { duration: 6000, position: 'top-center' })

// Warning
showWarning('This action cannot be undone')
showWarning('Low storage space', { duration: 5000 })

// Info
showInfo('New features available!')
showInfo('System maintenance scheduled', { position: 'bottom-right' })

// ========================================
// API Error Handling
// ========================================

// Automatically parse and display API errors
try {
    await api.someEndpoint()
} catch (error) {
    showApiError(error) // Automatically handles axios errors, status codes, etc.
}

// With custom fallback message
try {
    await api.deleteUser(userId)
} catch (error) {
    showApiError(error, 'Failed to delete user')
}

// ========================================
// Promise Toast
// ========================================

// Automatically show loading/success/error states
showPromiseToast(api.updateProfile(data), {
    loading: 'Updating profile...',
    success: 'Profile updated successfully!',
    error: 'Failed to update profile',
})

// With dynamic success message
showPromiseToast(api.createItem(newItem), {
    loading: 'Creating item...',
    success: (data) => `Created ${data.name} successfully!`,
    error: (err) => `Failed: ${err.message}`,
})

// ========================================
// Loading Toast (Manual Control)
// ========================================

const loading = showLoading('Processing...')

try {
    await someAsyncOperation()
    loading.success('Done!')
} catch (error) {
    loading.error('Failed!')
}

// Or dismiss without message
loading.dismiss()

// ========================================
// Common Patterns
// ========================================

// Login
try {
    const response = await authApi.login(credentials)
    showSuccess(`Welcome back, ${response.user.name}!`)
} catch (error) {
    showApiError(error, 'Invalid credentials')
}

// Form submission
const handleSubmit = async (data) => {
    try {
        await api.submit(data)
        showSuccess('Form submitted successfully!')
    } catch (error) {
        showApiError(error, 'Failed to submit form')
    }
}

// Delete confirmation
const handleDelete = async (id) => {
    showWarning('Item will be deleted permanently')

    try {
        await api.delete(id)
        showSuccess('Item deleted')
    } catch (error) {
        showApiError(error, 'Failed to delete item')
    }
}

// Network check
if (!navigator.onLine) {
    showError('No internet connection')
}

export {}
