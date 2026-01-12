import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users as UsersIcon, Shield, UserX, UserCheck, Loader2 } from 'lucide-react'
import { usersApi } from '../api/users'
import type { User } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { showSuccess, showError, showApiError, showWarning } from '../lib/toast'

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'USER', 'VIEWER'] as const
const ROLE_COLORS = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    MANAGER: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    USER: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
}

export function UsersManagementPage() {
    const { user: currentUser } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // Strict authorization check - only admins can access this page
    useEffect(() => {
        if (!currentUser || currentUser.role !== 'ADMIN') {
            showError('Unauthorized: Admin access required')
            navigate('/')
        }
    }, [currentUser, navigate])

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            const data = await usersApi.listUsers()
            setUsers(data)
        } catch (error) {
            showApiError(error, 'Failed to load users')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (currentUser?.role === 'ADMIN') {
            fetchUsers()
        }
    }, [currentUser])

    const handleRoleChange = async (userId: string, newRole: (typeof ROLE_OPTIONS)[number]) => {
        if (userId === currentUser?.id) {
            showWarning('Cannot modify your own role for security reasons')
            return
        }

        const user = users.find((u) => u.id === userId)
        if (!user) return

        const confirmMessage = `Are you sure you want to change ${user.email}'s role from ${user.role} to ${newRole}?`
        if (!window.confirm(confirmMessage)) return

        try {
            setActionLoading(userId)
            const updatedUser = await usersApi.updateUserRole(userId, newRole)
            setUsers(users.map((u) => (u.id === userId ? updatedUser : u)))
            showSuccess(`Role updated to ${newRole} for ${user.email}`)
        } catch (error) {
            showApiError(error, 'Failed to update user role')
        } finally {
            setActionLoading(null)
        }
    }

    const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
        if (userId === currentUser?.id) {
            showWarning('Cannot modify your own account status for security reasons')
            return
        }

        const user = users.find((u) => u.id === userId)
        if (!user) return

        const action = currentStatus ? 'deactivate' : 'activate'
        const confirmMessage = `Are you sure you want to ${action} ${user.email}?`
        if (!window.confirm(confirmMessage)) return

        try {
            setActionLoading(userId)
            const updatedUser = await usersApi.updateUserStatus(userId, !currentStatus)
            setUsers(users.map((u) => (u.id === userId ? updatedUser : u)))
            showSuccess(`User ${action}d successfully`)
        } catch (error) {
            showApiError(error, `Failed to ${action} user`)
        } finally {
            setActionLoading(null)
        }
    }

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-red-600" />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Manage user roles and access permissions (Admin Only)</p>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    </div>
                ) : (
                    /* Users Table */
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">User</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Email</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Role</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                                                user.id === currentUser?.id ? 'bg-blue-50 dark:bg-blue-950' : ''
                                            }`}
                                        >
                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                        {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {user.full_name || 'No name'}
                                                            {user.id === currentUser?.id && (
                                                                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{user.email}</td>

                                            {/* Role Selector */}
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value as (typeof ROLE_OPTIONS)[number])}
                                                    disabled={user.id === currentUser?.id || actionLoading === user.id}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                                                        ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]
                                                    } border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {ROLE_OPTIONS.map((role) => (
                                                        <option
                                                            key={role}
                                                            value={role}
                                                        >
                                                            {role}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        user.is_active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}
                                                >
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleStatusToggle(user.id, user.is_active)}
                                                    disabled={user.id === currentUser?.id || actionLoading === user.id}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                        user.is_active
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                                                            : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                                                    }`}
                                                >
                                                    {actionLoading === user.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : user.is_active ? (
                                                        <>
                                                            <UserX className="w-4 h-4" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck className="w-4 h-4" />
                                                            Activate
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {users.length === 0 && !isLoading && (
                            <div className="py-20 text-center">
                                <UsersIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No users found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Security Notes:</h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                        <li>You cannot modify your own role or account status for security reasons</li>
                        <li>All role changes require confirmation</li>
                        <li>Deactivated users cannot log in to the system</li>
                        <li>All actions are logged and require ADMIN permission</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
