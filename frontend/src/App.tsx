import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { Header, AddNewForm, SpoolCatalog, InventoryTable } from './components'
import type { ActionType } from './components/ActionBar'

function App() {
    const [selectedAction, setSelectedAction] = useState<ActionType>('addnew')

    return (
        <ThemeProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                    success: {
                        style: {
                            background: '#22c55e',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#22c55e',
                        },
                    },
                    error: {
                        style: {
                            background: '#ef4444',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#ef4444',
                        },
                    },
                }}
            />
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="w-full px-8 py-6">
                    <Header
                        selectedAction={selectedAction}
                        onActionSelect={setSelectedAction}
                    />

                    <main>
                        <div className="mt-8">
                            {selectedAction === 'addnew' && (
                                <div className="space-y-8">
                                    {/* Row 1: Create new spool archetype form */}
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="w-full lg:w-1/3">
                                            <AddNewForm />
                                        </div>
                                        <div className="w-full lg:w-2/3">
                                            {/* Spool Catalog - shows available archetypes to add to inventory */}
                                            <SpoolCatalog />
                                        </div>
                                    </div>

                                    {/* Row 2: Inventory Table - shows physical spools in inventory */}
                                    <div className="w-full">
                                        <InventoryTable />
                                    </div>
                                </div>
                            )}
                            {selectedAction !== 'addnew' && (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                    <p className="text-xl">Content for {selectedAction.toUpperCase()} not implemented yet.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </ThemeProvider>
    )
}

export default App
