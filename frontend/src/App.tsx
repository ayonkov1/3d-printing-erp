import { useState } from 'react'
import { Layout, SpoolsTable } from './components'
import type { ActionType, Spool } from './types'
import './App.css'

function App() {
    const [selectedAction, setSelectedAction] = useState<ActionType>('addnew')
    const [selectedSpool, setSelectedSpool] = useState<Spool | null>(null)

    const handleRowSelect = (spool: Spool | null) => {
        setSelectedSpool(spool)
    }

    return (
        <Layout
            selectedAction={selectedAction}
            onActionSelect={setSelectedAction}
            hasSelectedRow={!!selectedSpool}
        >
            {selectedAction === 'addnew' && (
                <div className="flex flex-col items-center gap-6">
                    {/* Table - Below */}
                    <div className="w-full">
                        <SpoolsTable
                            onRowSelect={handleRowSelect}
                            selectedSpoolId={selectedSpool?.id || null}
                        />
                    </div>
                </div>
            )}

            {selectedAction === 'use' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Use Material</h2>
                    {selectedSpool ? (
                        <div>
                            <p className="text-gray-600 mb-4">
                                Selected spool: <span className="font-medium">{selectedSpool.barcode}</span>
                            </p>
                            {/* Add use material form here */}
                            <p className="text-gray-500">Use material form will be implemented here</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">Select a spool from the table to use material</p>
                    )}
                </div>
            )}

            {selectedAction === 'topup' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Top Up Spool</h2>
                    {selectedSpool ? (
                        <div>
                            <p className="text-gray-600 mb-4">
                                Selected spool: <span className="font-medium">{selectedSpool.barcode}</span>
                            </p>
                            {/* Add top up form here */}
                            <p className="text-gray-500">Top up form will be implemented here</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">Select a spool from the table to top up</p>
                    )}
                </div>
            )}

            {selectedAction === 'remove' && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Remove Quantity</h2>
                    {selectedSpool ? (
                        <div>
                            <p className="text-gray-600 mb-4">
                                Selected spool: <span className="font-medium">{selectedSpool.barcode}</span>
                            </p>
                            {/* Add remove form here */}
                            <p className="text-gray-500">Remove quantity form will be implemented here</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">Select a spool from the table to remove quantity</p>
                    )}
                </div>
            )}

            {selectedAction === 'data' && (
                <div>
                    <SpoolsTable
                        onRowSelect={handleRowSelect}
                        selectedSpoolId={selectedSpool?.id || null}
                    />
                </div>
            )}
        </Layout>
    )
}

export default App
