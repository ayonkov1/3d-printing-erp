import { useState, useCallback } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { Header, ActionBar, AddNewForm, SpoolsTable } from './components'
import type { ActionType } from './components/ActionBar'
import type { Spool } from './types'

function App() {
    const [selectedAction, setSelectedAction] = useState<ActionType>('addnew')
    const [selectedSpools, setSelectedSpools] = useState<Spool[]>([])

    const handleRowSelect = useCallback((spools: Spool[]) => {
        setSelectedSpools(spools)
        console.log('App selected spools:', spools)
    }, [])

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    <Header />

                    <main>
                        <ActionBar
                            selectedAction={selectedAction}
                            onActionSelect={setSelectedAction}
                        />

                        <div className="mt-8">
                            {selectedAction === 'addnew' && (
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="w-full lg:w-1/3">
                                        <AddNewForm />
                                    </div>
                                    <div className="w-full lg:w-2/3">
                                        <SpoolsTable onRowSelect={handleRowSelect} />
                                    </div>
                                </div>
                            )}
                            {selectedAction !== 'addnew' && (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                    <p className="text-xl">Content for {selectedAction.toUpperCase()} not implemented yet.</p>
                                    {selectedSpools.length > 0 && (
                                        <div className="mt-4">
                                            <p>Selected Spools: {selectedSpools.length}</p>
                                            <ul className="text-sm mt-2">
                                                {selectedSpools.map((s) => (
                                                    <li key={s.id}>
                                                        {s.barcode} - {s.material.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
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
