import React from 'react'
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, getSortedRowModel, type SortingState } from '@tanstack/react-table'
import { useInventory, useUpdateInventory, useDeleteInventory } from '../hooks'
import type { Inventory } from '../types'
import toast from 'react-hot-toast'
import { Printer, Package, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

const columnHelper = createColumnHelper<Inventory>()

// Utility function to format relative time
const formatRelativeTime = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now.getTime() - date.getTime()

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const month = 30 * day
    const year = 365 * day

    if (diffInMs < minute) {
        return 'Just now'
    } else if (diffInMs < hour) {
        const mins = Math.floor(diffInMs / minute)
        return `${mins} min`
    } else if (diffInMs < day) {
        const hours = Math.floor(diffInMs / hour)
        return `${hours} H`
    } else if (diffInMs < month) {
        const days = Math.floor(diffInMs / day)
        return `${days} D`
    } else if (diffInMs < year) {
        const months = Math.floor(diffInMs / month)
        return `${months} M`
    } else {
        const years = Math.floor(diffInMs / year)
        return `${years} Y`
    }
}

export const InventoryTable: React.FC = () => {
    const { data: inventory = [], isLoading, error } = useInventory()
    const updateInventory = useUpdateInventory()
    const deleteInventory = useDeleteInventory()
    const [sorting, setSorting] = React.useState<SortingState>([
        {
            id: 'created_at',
            desc: true, // Newest first
        },
    ])

    const handleMarkInUse = (item: Inventory) => {
        updateInventory.mutate(
            { id: item.id, data: { is_in_use: true, status_name: 'in_use' } },
            {
                onSuccess: () => toast.success('Marked as in use'),
                onError: (err) => toast.error(`Error: ${err.message}`),
            },
        )
    }

    const handleMarkInStock = (item: Inventory) => {
        updateInventory.mutate(
            { id: item.id, data: { is_in_use: false, status_name: 'in_stock' } },
            {
                onSuccess: () => toast.success('Marked as in stock'),
                onError: (err) => toast.error(`Error: ${err.message}`),
            },
        )
    }

    const handleDelete = (item: Inventory) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <span>Remove this item from inventory?</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id)
                                deleteInventory.mutate(item.id, {
                                    onSuccess: () => toast.success('Removed from inventory'),
                                    onError: (err) => toast.error(`Error: ${err.message}`),
                                })
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            { duration: 10000 },
        )
    }

    const columns = [
        columnHelper.accessor('created_at', {
            header: 'Added',
            cell: (info) => {
                const createdAt = info.getValue()
                return (
                    <div className="text-left text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{formatRelativeTime(createdAt)}</span>
                    </div>
                )
            },
            sortingFn: (a, b) => {
                const dateA = new Date(a.original.created_at)
                const dateB = new Date(b.original.created_at)
                return dateA.getTime() - dateB.getTime()
            },
        }),
        columnHelper.accessor((row) => row.spool.brand.name, {
            id: 'brand',
            header: 'Brand',
            cell: (info) => <div className="text-left font-medium">{info.getValue()}</div>,
        }),
        columnHelper.accessor((row) => row.spool.material.name, {
            id: 'material',
            header: 'Material',
            cell: (info) => <div className="text-left">{info.getValue()}</div>,
        }),
        columnHelper.accessor((row) => row.spool.color, {
            id: 'color',
            header: 'Color',
            cell: (info) => {
                const color = info.getValue()
                return (
                    <div className="flex items-center gap-2 text-left">
                        <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.hex_code }}
                        />
                        <span>{color.name}</span>
                    </div>
                )
            },
        }),
        columnHelper.accessor('weight', {
            header: 'Weight',
            cell: (info) => {
                const weight = info.getValue()
                const baseWeight = info.row.original.spool.base_weight
                const percentage = Math.round((weight / baseWeight) * 100)
                return (
                    <div className="text-right">
                        <span className="font-medium">{weight}g</span>
                        <span className="text-gray-400 text-sm ml-1">({percentage}%)</span>
                    </div>
                )
            },
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => {
                const status = info.getValue()
                const statusColors: Record<string, string> = {
                    in_stock: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                    in_use: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                    depleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                    ordered: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                }
                return (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status.name] || 'bg-gray-100 text-gray-800'}`}>
                        {status.name.replace('_', ' ')}
                    </span>
                )
            },
        }),
        columnHelper.accessor('is_in_use', {
            header: 'In Printer',
            cell: (info) => (
                <div className="text-center">
                    {info.getValue() ? (
                        <span className="text-teal-600 dark:text-teal-400 flex items-center justify-center gap-1">
                            <Printer size={14} /> Yes
                        </span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            ),
        }),
        columnHelper.accessor('custom_properties', {
            header: 'Notes',
            cell: (info) => <div className="text-left text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate">{info.getValue() || '-'}</div>,
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const item = row.original
                return (
                    <div className="flex items-center gap-1">
                        {item.is_in_use ? (
                            <button
                                onClick={() => handleMarkInStock(item)}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors cursor-pointer flex items-center gap-1 w-16 justify-center"
                                title="Return to stock"
                            >
                                <Package size={12} /> Stock
                            </button>
                        ) : (
                            <button
                                onClick={() => handleMarkInUse(item)}
                                className="px-2 py-1 text-xs bg-teal-100 dark:bg-teal-900 hover:bg-teal-200 dark:hover:bg-teal-800 text-teal-700 dark:text-teal-300 rounded transition-colors cursor-pointer flex items-center gap-1 w-16 justify-center"
                                title="Mark as in use"
                            >
                                <Printer size={12} /> Use
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(item)}
                            className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded transition-colors cursor-pointer flex items-center gap-1"
                            title="Remove from inventory"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                )
            },
        }),
    ]

    const table = useReactTable({
        data: inventory,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Loading inventory...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-red-400">Error loading inventory: {error.message}</div>
            </div>
        )
    }

    if (!inventory || inventory.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium mb-2">No items in inventory</p>
                    <p className="text-sm">Add spools from the catalog above to start tracking your inventory</p>
                </div>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr
                            key={headerGroup.id}
                            className="border-b border-gray-200 dark:border-gray-700"
                        >
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                                >
                                    {header.isPlaceholder ? null : (
                                        <div
                                            className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-800 dark:hover:text-gray-200' : ''}`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && (
                                                <span className="flex flex-col">
                                                    {header.column.getIsSorted() === 'asc' && (
                                                        <ChevronUp
                                                            size={12}
                                                            className="text-lime-600"
                                                        />
                                                    )}
                                                    {header.column.getIsSorted() === 'desc' && (
                                                        <ChevronDown
                                                            size={12}
                                                            className="text-lime-600"
                                                        />
                                                    )}
                                                    {!header.column.getIsSorted() && (
                                                        <div className="flex flex-col opacity-30">
                                                            <ChevronUp
                                                                size={10}
                                                                className="-mb-1"
                                                            />
                                                            <ChevronDown size={10} />
                                                        </div>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="px-4 py-3 text-gray-900 dark:text-gray-100"
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default InventoryTable
