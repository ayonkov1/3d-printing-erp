import { useState, useEffect, useRef, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { Header, AddNewForm, SpoolCatalog, InventoryTable } from './components'
import type { ActionType } from './components/ActionBar'
import type { Spool } from './types'
import { useSpoolsByBarcode } from './hooks'

// Custom hook for debounced value
function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

function App() {
    const [selectedAction, setSelectedAction] = useState<ActionType>('addnew')
    const [barcode, setBarcode] = useState('')
    const barcodeInputRef = useRef<HTMLInputElement>(null)

    // Debounce barcode for 1 second before lookup
    const debouncedBarcode = useDebouncedValue(barcode, 1000)

    // Query for spool by barcode (only when we have a debounced value)
    const { data: matchedSpools = [], isLoading: isLookingUp } = useSpoolsByBarcode(debouncedBarcode)

    // Determine if form should be disabled (when we found matching spools)
    const isFormDisabled = matchedSpools.length > 0

    // Auto-focus barcode input when addnew tab is selected
    useEffect(() => {
        if (selectedAction === 'addnew' && barcodeInputRef.current) {
            barcodeInputRef.current.focus()
        }
    }, [selectedAction])

    // Clear handler
    const handleClear = useCallback(() => {
        setBarcode('')
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus()
        }
    }, [])

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
                                    {/* Barcode Scanner Input - Always visible and focused */}
                                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border-2 border-dashed border-lime-500">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    📦 Scan Barcode to Start
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        ref={barcodeInputRef}
                                                        type="text"
                                                        value={barcode}
                                                        onChange={(e) => setBarcode(e.target.value)}
                                                        placeholder="Scan or type barcode..."
                                                        className="flex-1 border-2 border-lime-500 px-4 py-3 text-lg bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 rounded"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleClear}
                                                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {isLookingUp && <span className="text-lime-500">Looking up...</span>}
                                                {!isLookingUp && debouncedBarcode && matchedSpools.length > 0 && (
                                                    <span className="text-green-500">
                                                        ✓ Found {matchedSpools.length} matching spool{matchedSpools.length > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                                {!isLookingUp && debouncedBarcode && matchedSpools.length === 0 && (
                                                    <span className="text-blue-500">New barcode - fill in details</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 1: Create new spool archetype form + Catalog */}
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="w-full lg:w-1/3">
                                            <AddNewForm
                                                disabled={isFormDisabled}
                                                barcode={barcode}
                                                onSuccess={handleClear}
                                            />
                                        </div>
                                        <div className="w-full lg:w-2/3">
                                            {/* Spool Catalog - shows available archetypes to add to inventory */}
                                            <SpoolCatalog matchedSpools={matchedSpools} />
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
