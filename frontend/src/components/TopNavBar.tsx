import React from 'react'

const TopNavBar: React.FC = () => {
    return (
        <div className="bg-gray-800 px-6 py-8">
            <div className="flex flex-col items-center gap-4">
                <h1 className="text-3xl font-normal text-white">Welcome User</h1>
                <div className="flex gap-3">
                    <button className="px-6 py-2 bg-gray-700 text-white text-sm font-medium rounded hover:bg-gray-600 transition-colors">Profile</button>
                    <button className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors">Exit</button>
                </div>
            </div>
        </div>
    )
}

export default TopNavBar
