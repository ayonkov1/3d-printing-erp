import React from 'react'
import type { ActionType } from '../types'

import ActionButtonBar from './ActionButtonBar'
import MainContent from './MainContent'

interface LayoutProps {
    children: React.ReactNode
    selectedAction: ActionType
    onActionSelect: (action: ActionType) => void
    hasSelectedRow?: boolean
}

const Layout: React.FC<LayoutProps> = ({ children, selectedAction, onActionSelect, hasSelectedRow = false }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-700">
            <ActionButtonBar
                selectedAction={selectedAction}
                onActionSelect={onActionSelect}
                hasSelectedRow={hasSelectedRow}
            />
            <MainContent>{children}</MainContent>
        </div>
    )
}

export default Layout
