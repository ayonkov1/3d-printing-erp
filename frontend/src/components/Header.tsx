import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { Moon, Sun, MoreHorizontal, Plus, X, FileText, LogOut } from 'lucide-react'
import type { ActionType } from '../types'

interface HeaderProps {
    selectedAction: ActionType
    onActionSelect: (action: ActionType) => void
}

export const Header: React.FC<HeaderProps> = ({ selectedAction, onActionSelect }) => {
    const { theme, toggleTheme } = useTheme()
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
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
            color: 'bg-teal-600',
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

    return (
        <div className="mb-8">
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-light text-gray-800 dark:text-gray-100">
                        Welcome{user?.full_name ? `, ${user.full_name}` : ''}
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

                <div className="flex gap-4">
                    {actions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => onActionSelect(action.id)}
                            className={`
                                flex flex-col items-center justify-center w-24 h-24 rounded-none cursor-pointer
                                ${action.id === 'addnew' && selectedAction === 'addnew' ? 'ring-4 ring-lime-500 z-10' : ''}
                                bg-gray-800 hover:bg-gray-700 transition-all
                            `}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${action.color}`}>{action.icon}</div>
                            <span className="text-white text-[10px] font-medium uppercase tracking-wider">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <hr className="border-gray-300 dark:border-gray-700 mt-6" />
        </div>
    )
}
