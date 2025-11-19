import React from 'react'
import { MoreHorizontal, ChevronUp, Plus, X, Database } from 'lucide-react'
import type { ActionType, ActionButton } from '../types'

interface ActionButtonBarProps {
    selectedAction: ActionType
    onActionSelect: (action: ActionType) => void
    hasSelectedRow?: boolean
}

const ActionButtonBar: React.FC<ActionButtonBarProps> = ({ selectedAction, onActionSelect, hasSelectedRow = false }) => {
    const actionButtons: ActionButton[] = [
        {
            id: 'use',
            label: 'USE',
            icon: <MoreHorizontal className="w-8 h-8" />,
            color: 'text-white',
            bgColor: 'bg-amber-500',
            disabled: !hasSelectedRow,
        },
        {
            id: 'topup',
            label: 'TOP UP',
            icon: <ChevronUp className="w-8 h-8" />,
            color: 'text-white',
            bgColor: 'bg-lime-600',
            disabled: !hasSelectedRow,
        },
        {
            id: 'addnew',
            label: 'ADD NEW',
            icon: <Plus className="w-8 h-8" />,
            color: 'text-white',
            bgColor: 'bg-cyan-500',
            disabled: false,
        },
        {
            id: 'remove',
            label: 'REMOVE',
            icon: <X className="w-8 h-8" />,
            color: 'text-white',
            bgColor: 'bg-red-600',
            disabled: !hasSelectedRow,
        },
        {
            id: 'data',
            label: 'DATA',
            icon: <Database className="w-8 h-8" />,
            color: 'text-white',
            bgColor: 'bg-purple-600',
            disabled: false,
        },
    ]

    return (
        <div className="bg-gray-800 px-6 py-8">
            <div className="flex justify-center items-center gap-6">
                {actionButtons.map((button) => {
                    const isSelected = selectedAction === button.id
                    const isDisabled = button.disabled

                    return (
                        <button
                            key={button.id}
                            onClick={() => !isDisabled && onActionSelect(button.id)}
                            disabled={isDisabled}
                            className={`flex flex-col items-center gap-3 transition-all ${
                                isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
                            }`}
                        >
                            <div
                                className={`w-24 h-24 rounded-full flex items-center justify-center ${button.bgColor} ${
                                    isSelected ? 'ring-4 ring-lime-400 ring-offset-2' : ''
                                } ${button.color} shadow-lg ${!isDisabled && 'hover:shadow-xl'}`}
                            >
                                {button.icon}
                            </div>
                            <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">{button.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default ActionButtonBar
