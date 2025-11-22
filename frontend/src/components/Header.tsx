import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export const Header: React.FC = () => {
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="mb-8">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-light text-gray-800 dark:text-gray-100">Welcome User</h1>
                    <div className="flex gap-4">
                        <button className="bg-gray-800 text-white px-8 py-2 text-sm font-medium hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 rounded-none">
                            Profile
                        </button>
                        <button className="bg-red-600 text-white px-8 py-2 text-sm font-medium hover:bg-red-700 transition-colors rounded-none">Exit</button>
                    </div>
                </div>

                {/* Theme toggle - positioned absolutely or just to the right? 
            The image doesn't show a theme toggle, but the requirement asked for it.
            I'll keep it subtle.
        */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? (
                        <Moon size={24} />
                    ) : (
                        <Sun
                            size={24}
                            className="text-white"
                        />
                    )}
                </button>
            </div>
            <hr className="border-gray-300 dark:border-gray-700 mt-6" />
        </div>
    )
}
