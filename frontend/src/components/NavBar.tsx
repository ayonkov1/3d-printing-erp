import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { Moon, Sun, MoreHorizontal, Plus, X, FileText, LogOut, Shield, LayoutDashboard, Warehouse } from 'lucide-react'
import type { ActionType } from '../types'

interface NavBarProps {
    title: string
    selectedAction?: ActionType
    onActionSelect?: (action: ActionType) => void
}

export const NavBar: React.FC<NavBarProps> = ({ title, selectedAction, onActionSelect }) => {
    const { theme, toggleTheme } = useTheme()
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const isInventoryPage = location.pathname === '/inventory'

    const handleActionClick = (actionId: ActionType) => {
        if (isInventoryPage && onActionSelect) {
            // On inventory page, just select the action
            onActionSelect(actionId)
        } else {
            // On other pages, navigate to inventory with that action
            navigate('/inventory', { state: { action: actionId } })
        }
    }

    const actions: { id: ActionType; label: string; icon: React.ReactNode; color: string }[] = [
        {
            id: 'use',
            label: 'USE',
            icon: (
                <MoreHorizontal
                    size={28}
                    className="text-white"
                />
            ),
            color: 'bg-amber-500',
        },
        {
            id: 'addnew',
            label: 'ADD NEW',
            icon: (
                <Plus
                    size={28}
                    className="text-white"
                />
            ),
            color: 'bg-lime-500',
        },
        {
            id: 'remove',
            label: 'REMOVE',
            icon: (
                <X
                    size={28}
                    className="text-white"
                />
            ),
            color: 'bg-red-600',
        },
        {
            id: 'data',
            label: 'DATA',
            icon: (
                <FileText
                    size={28}
                    className="text-white"
                />
            ),
            color: 'bg-purple-600',
        },
    ]

    const isCurrentPage = (path: string) => location.pathname === path

    return (
        <div className="mb-8">
            <div className="flex justify-between items-end">
                {/* Left side - Title and user controls */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-light text-gray-800 dark:text-gray-100">
                        {title === 'Dashboard' ? <>Welcome{user?.full_name ? `, ${user.full_name}` : ''}</> : title}
                        {user?.role && <span className="text-2xl text-gray-500 dark:text-gray-400 ml-2">[{user.role}]</span>}
                    </h1>
                    <div className="flex gap-4">
                        <button className="bg-gray-800 text-white px-8 py-2 text-sm font-medium hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 rounded-none h-10 flex items-center cursor-pointer">
                            Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-8 py-2 text-sm font-medium hover:bg-red-700 transition-colors rounded-none h-10 flex items-center gap-2 cursor-pointer"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="bg-gray-800 text-white px-8 py-2 text-sm font-medium hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 rounded-none h-10 flex items-center justify-center cursor-pointer"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon size={18} />
                            ) : (
                                <Sun
                                    size={18}
                                    className="text-white"
                                />
                            )}
                        </button>
                    </div>
                </div>

                {/* Right side - Navigation and action buttons */}
                <div className="flex items-end">
                    {/* Navigation buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className={`flex flex-col items-center justify-center w-24 h-24 rounded-none cursor-pointer bg-gray-800 hover:bg-gray-700 transition-all ${isCurrentPage('/dashboard') ? 'ring-4 ring-lime-500 z-10' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gradient-to-r from-purple-600 to-indigo-600">
                                <LayoutDashboard
                                    size={28}
                                    className="text-white"
                                />
                            </div>
                            <span className="text-white text-[10px] font-medium uppercase tracking-wider">Dashboard</span>
                        </button>

                        <button
                            onClick={() => navigate('/inventory')}
                            className={`flex flex-col items-center justify-center w-24 h-24 rounded-none cursor-pointer bg-gray-800 hover:bg-gray-700 transition-all ${isCurrentPage('/inventory') ? 'ring-4 ring-lime-500 z-10' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-lime-500">
                                <Warehouse
                                    size={28}
                                    className="text-white"
                                />
                            </div>
                            <span className="text-white text-[10px] font-medium uppercase tracking-wider">Inventory</span>
                        </button>

                        {/* Admin-only User Management Button */}
                        {user?.role === 'ADMIN' && (
                            <button
                                onClick={() => navigate('/users')}
                                className={`flex flex-col items-center justify-center w-24 h-24 rounded-none cursor-pointer bg-gray-800 hover:bg-gray-700 transition-all ${isCurrentPage('/users') ? 'ring-4 ring-lime-500 z-10' : ''}`}
                                title="User Management (Admin Only)"
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gradient-to-r from-red-600 to-orange-600">
                                    <Shield
                                        size={28}
                                        className="text-white"
                                    />
                                </div>
                                <span className="text-white text-[10px] font-medium uppercase tracking-wider">Users</span>
                            </button>
                        )}
                    </div>

                    {/* Vertical divider */}
                    <div className="h-24 w-px bg-gray-600 mx-6"></div>

                    {/* Action buttons */}
                    <div className="flex gap-4">
                        {actions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => isInventoryPage && handleActionClick(action.id)}
                                disabled={!isInventoryPage}
                                className={`
                                    flex flex-col items-center justify-center w-24 h-24 rounded-none transition-all
                                    ${isInventoryPage && action.id === selectedAction ? 'ring-4 ring-lime-500 z-10' : ''}
                                    ${isInventoryPage ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer' : 'bg-gray-800/50 cursor-not-allowed opacity-50'}
                                `}
                            >
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${action.color} ${!isInventoryPage ? 'opacity-50' : ''}`}
                                >
                                    {action.icon}
                                </div>
                                <span className="text-white text-[10px] font-medium uppercase tracking-wider">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300 dark:border-gray-700 mt-6" />
        </div>
    )
}

export default NavBar
