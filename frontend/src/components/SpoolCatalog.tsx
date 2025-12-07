import React, { useState } from 'react'
import { useSpools } from '../hooks'
import type { Spool } from '../types'
import { AddToInventoryModal } from './AddToInventoryModal'

interface SpoolCatalogProps {
    onSpoolSelect?: (spool: Spool) => void
    matchedSpools?: Spool[]
}

export const SpoolCatalog: React.FC<SpoolCatalogProps> = ({ onSpoolSelect, matchedSpools = [] }) => {
    const { data: spools = [], isLoading, error } = useSpools()
    const [selectedSpool, setSelectedSpool] = useState<Spool | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // If we have matched spools from barcode scan, show those; otherwise show all
    const displaySpools = matchedSpools.length > 0 ? matchedSpools : spools

    const handleAddToInventory = (spool: Spool) => {
        setSelectedSpool(spool)
        setIsModalOpen(true)
        onSpoolSelect?.(spool)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedSpool(null)
    }

    if (isLoading && matchedSpools.length === 0) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Loading spool catalog...</div>
            </div>
        )
    }

    if (error && matchedSpools.length === 0) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-red-400">Error loading catalog: {error.message}</div>
            </div>
        )
    }

    if (!displaySpools || displaySpools.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium mb-2">No spool types defined yet</p>
                    <p className="text-sm">Create your first spool archetype using the form on the left</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="mb-4">
                {matchedSpools.length > 0 ? (
                    <>
                        <h3 className="text-lg font-semibold text-teal-600 dark:text-teal-400 mb-1">
                            {matchedSpools.length} Match{matchedSpools.length > 1 ? 'es' : ''} Found
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click "Add to Inventory" to add a spool to your stock</p>
                    </>
                ) : (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Spool Catalog</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Select a spool type to add to your inventory</p>
                    </>
                )}
            </div>

            <div className={`grid gap-4 ${matchedSpools.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {displaySpools.map((spool) => (
                    <div
                        key={spool.id}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                    >
                        {/* Color indicator bar */}
                        <div
                            className="h-2 rounded-t-lg -mx-4 -mt-4 mb-3"
                            style={{ backgroundColor: spool.color.hex_code }}
                        />

                        {/* Spool info */}
                        <div className="space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{spool.brand.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {spool.material.name} • {spool.color.name}
                                    </p>
                                </div>
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                                    style={{ backgroundColor: spool.color.hex_code }}
                                    title={spool.color.name}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">{spool.base_weight}g</span>
                                {spool.thickness && (
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">{spool.thickness}mm</span>
                                )}
                                {spool.is_box && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-600 dark:text-blue-300">Box</span>}
                                {spool.spool_return && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-green-600 dark:text-green-300">Returnable</span>
                                )}
                            </div>

                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{spool.barcode}</p>

                            {spool.trade_name && <p className="text-xs text-gray-500 dark:text-gray-400 italic">{spool.trade_name.name}</p>}
                        </div>

                        {/* Add to inventory button */}
                        <button
                            onClick={() => handleAddToInventory(spool)}
                            className="mt-4 w-full py-2 px-4 bg-lime-500 hover:bg-lime-600 text-white text-sm font-medium rounded transition-colors cursor-pointer"
                        >
                            + Add to Inventory
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal for adding to inventory */}
            {selectedSpool && (
                <AddToInventoryModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    spool={selectedSpool}
                />
            )}
        </>
    )
}

export default SpoolCatalog
