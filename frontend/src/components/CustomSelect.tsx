import { useState, useRef, useEffect } from 'react'

export interface SelectOption {
    id: string | number
    name: string
    color?: string // Optional color for color dots
}

interface CustomSelectProps {
    options: SelectOption[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    error?: string
    showColorDot?: boolean
}

export const CustomSelect = ({ options, value, onChange, placeholder = 'Select an option', error, showColorDot = false }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find((opt) => opt.name === value)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    const handleSelect = (optionName: string) => {
        onChange(optionName)
        setIsOpen(false)
    }

    return (
        <div
            ref={containerRef}
            className="relative flex-1"
        >
            {/* Selected value button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-left flex items-center justify-between ${
                    error ? 'border-red-500' : ''
                }`}
            >
                <span className="flex items-center gap-2">
                    {selectedOption ? (
                        <>
                            {showColorDot && selectedOption.color && (
                                <span
                                    className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shrink-0"
                                    style={{ backgroundColor: selectedOption.color }}
                                />
                            )}
                            <span>{selectedOption.name}</span>
                        </>
                    ) : (
                        <span className="text-gray-500">{placeholder}</span>
                    )}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-400 shadow-lg max-h-60 overflow-auto">
                    {/* Empty option */}
                    <button
                        type="button"
                        onClick={() => handleSelect('')}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    >
                        {placeholder}
                    </button>

                    {/* Options */}
                    {options.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelect(option.name)}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                                value === option.name ? 'bg-lime-50 dark:bg-lime-900/20' : ''
                            }`}
                        >
                            {showColorDot && option.color && (
                                <span
                                    className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shrink-0"
                                    style={{ backgroundColor: option.color }}
                                />
                            )}
                            <span className="dark:text-white">{option.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
