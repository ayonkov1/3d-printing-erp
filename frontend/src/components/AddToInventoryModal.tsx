import React, { useState } from 'react'
import toast from 'react-hot-toast'
import type { Spool } from '../types'
import { useAddToInventory } from '../hooks'

interface AddToInventoryModalProps {
    isOpen: boolean
    onClose: () => void
    spool: Spool
}

export const AddToInventoryModal: React.FC<AddToInventoryModalProps> = ({ isOpen, onClose, spool }) => {
    const [quantity, setQuantity] = useState(1)
    const [useCustomWeight, setUseCustomWeight] = useState(false)
    const [customWeight, setCustomWeight] = useState(spool.base_weight)
    const [notes, setNotes] = useState('')

    const addToInventory = useAddToInventory()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Add specified quantity of this spool to inventory
        const promises = Array.from({ length: quantity }, () =>
            addToInventory.mutateAsync({
                spool_id: spool.id,
                weight: useCustomWeight ? customWeight : undefined,
                status_name: 'in_stock',
                custom_properties: notes || undefined,
            }),
        )

        try {
            await Promise.all(promises)
            toast.success(`Added ${quantity} ${spool.brand.name} ${spool.material.name} ${spool.color.name} to inventory!`)
            onClose()
            // Reset form
            setQuantity(1)
            setUseCustomWeight(false)
            setCustomWeight(spool.base_weight)
            setNotes('')
        } catch (error) {
            toast.error(`Failed to add to inventory: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add to Inventory</h2>

                {/* Spool summary */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                    <div
                        className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: spool.color.hex_code }}
                    />
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {spool.brand.name} {spool.material.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {spool.color.name} • {spool.base_weight}g • {spool.barcode}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity to add</label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-20 text-center border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Custom weight toggle */}
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useCustomWeight}
                                onChange={(e) => setUseCustomWeight(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Custom starting weight (not full spool)</span>
                        </label>

                        {useCustomWeight && (
                            <div className="mt-2 flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max={spool.base_weight}
                                    value={customWeight}
                                    onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 0)}
                                    className="w-32 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <span className="text-gray-500 dark:text-gray-400">g</span>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Purchased from Amazon"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addToInventory.isPending}
                            className="px-4 py-2 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-300 text-white font-medium rounded transition-colors cursor-pointer"
                        >
                            {addToInventory.isPending ? 'Adding...' : `Add ${quantity} to Inventory`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddToInventoryModal
