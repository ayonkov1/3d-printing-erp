import React from 'react'
import { MoreHorizontal, ChevronUp, Plus, X, FileText } from 'lucide-react'

export type ActionType = 'use' | 'topup' | 'addnew' | 'remove' | 'data'

interface ActionBarProps {
    selectedAction: ActionType
    onActionSelect: (action: ActionType) => void
}

export const ActionBar: React.FC<ActionBarProps> = ({ selectedAction, onActionSelect }) => {
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
            id: 'topup',
            label: 'TOP UP',
            icon: (
                <ChevronUp
                    size={28}
                    className="text-white"
                />
            ),
            color: 'bg-lime-600',
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
        <div className="flex gap-4 justify-end">
            {actions.map((action) => (
                <button
                    key={action.id}
                    onClick={() => onActionSelect(action.id)}
                    className={`
            flex flex-col items-center justify-center w-24 h-24 rounded-none
            ${action.id === 'addnew' && selectedAction === 'addnew' ? 'ring-4 ring-lime-500 z-10' : ''}
            bg-gray-800 hover:bg-gray-700 transition-all
          `}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${action.color}`}>{action.icon}</div>
                    <span className="text-white text-[10px] font-medium uppercase tracking-wider">{action.label}</span>
                </button>
            ))}
        </div>
    )
}
