import React from 'react'

interface MainContentProps {
    children: React.ReactNode
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
    return (
        <div className="flex-1 overflow-auto bg-gray-700">
            <div className="max-w-4xl mx-auto p-6">{children}</div>
        </div>
    )
}

export default MainContent
