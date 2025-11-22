import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-light text-gray-800 dark:text-gray-100">Welcome User</h1>
        <div className="flex gap-4 mt-4">
            <button className="bg-gray-800 text-white px-6 py-2 text-sm font-medium hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
                Profile
            </button>
            <button className="bg-red-600 text-white px-6 py-2 text-sm font-medium hover:bg-red-700 transition-colors">
                Exit
            </button>
        </div>
      </div>
      
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} className="text-white" />}
      </button>
    </header>
  );
};
