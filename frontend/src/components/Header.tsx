import React from 'react'
import { NavBar } from './NavBar'
import type { ActionType } from '../types'

interface HeaderProps {
    selectedAction: ActionType
    onActionSelect: (action: ActionType) => void
}

export const Header: React.FC<HeaderProps> = ({ selectedAction, onActionSelect }) => {
    return (
        <NavBar
            title="Inventory"
            selectedAction={selectedAction}
            onActionSelect={onActionSelect}
        />
    )
}
