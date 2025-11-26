import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useCreateMaterial } from '../hooks'

interface AddMaterialModalProps {
    isOpen: boolean
    onClose: () => void
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const createMaterial = useCreateMaterial()

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    const handleClose = () => {
        setName('')
        setError('')
        onClose()
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            setError('Material name is required')
            return
        }

        createMaterial.mutate(
            { name: name.trim() },
            {
                onSuccess: () => {
                    toast.success(`Material "${name.trim()}" created successfully!`)
                    setName('')
                    setError('')
                    handleClose()
                },
                onError: (err) => {
                    toast.error(err.message || 'Failed to create material')
                    setError(err.message || 'Failed to create material')
                },
            },
        )
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose()
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Material</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-4"
                >
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material Name</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                setError('')
                            }}
                            placeholder="e.g., PLA, PETG, ABS..."
                            className="w-full border border-gray-400 px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 rounded"
                        />
                        {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMaterial.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-lime-500 hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed rounded cursor-pointer"
                        >
                            {createMaterial.isPending ? 'Creating...' : 'Create Material'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
