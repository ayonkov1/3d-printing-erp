import { FC, Fragment, useEffect, useState } from 'react'
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, getSortedRowModel, type SortingState } from '@tanstack/react-table'
import { useInventory, useUpdateInventory, useDeleteInventory } from '../hooks'
import type { Inventory } from '../types'
import toast from 'react-hot-toast'
import { Printer, Package, Trash2, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'

const columnHelper = createColumnHelper<Inventory>()
const GROUP_BY_STORAGE_KEY = 'inventory-group-by'

type GroupBy = 'brand' | 'material' | 'color' | 'status' | 'none'

const groupByOptions: { value: GroupBy; label: string }[] = [
    { value: 'brand', label: 'Brand' },
    { value: 'material', label: 'Material' },
    { value: 'color', label: 'Color' },
    { value: 'status', label: 'Status' },
    { value: 'none', label: 'No grouping' },
]

const parseApiDate = (dateString: string): Date => {
    const hasTimezone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(dateString)
    return new Date(hasTimezone ? dateString : `${dateString}Z`)
}

const formatAddedAt = (dateString: string): string =>
    new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(parseApiDate(dateString))

const formatElapsedTime = (dateString: string, currentTime: number): string => {
    const elapsedMinutes = Math.max(0, Math.floor((currentTime - parseApiDate(dateString).getTime()) / 60_000))

    if (elapsedMinutes < 1) return 'Less than a minute ago'
    if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`

    const elapsedHours = Math.floor(elapsedMinutes / 60)
    if (elapsedHours < 24) return `${elapsedHours} h ago`

    const elapsedDays = Math.floor(elapsedHours / 24)
    return `${elapsedDays} d ago`
}

export const InventoryTable: FC = () => {
    const { data: inventory = [], isLoading, error } = useInventory()
    const updateInventory = useUpdateInventory()
    const deleteInventory = useDeleteInventory()
    const [showAddedTimestamp, setShowAddedTimestamp] = useState<Set<string>>(new Set())
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
    const [groupBy, setGroupBy] = useState<GroupBy>(() => {
        const savedGroupBy = localStorage.getItem(GROUP_BY_STORAGE_KEY)
        return groupByOptions.some((option) => option.value === savedGroupBy) ? (savedGroupBy as GroupBy) : 'brand'
    })
    const [currentTime, setCurrentTime] = useState(() => Date.now())
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'created_at',
            desc: true, // Newest first
        },
    ])

    useEffect(() => {
        const interval = window.setInterval(() => setCurrentTime(Date.now()), 1_000)
        return () => window.clearInterval(interval)
    }, [])

    useEffect(() => {
        localStorage.setItem(GROUP_BY_STORAGE_KEY, groupBy)
        setCollapsedGroups(new Set())
    }, [groupBy])

    const toggleItemSelection = (itemId: string) => {
        setSelectedItemIds((current) => {
            const next = new Set(current)
            if (next.has(itemId)) next.delete(itemId)
            else next.add(itemId)
            return next
        })
    }

    const setItemsSelected = (itemIds: string[], selected: boolean) => {
        setSelectedItemIds((current) => {
            const next = new Set(current)
            itemIds.forEach((itemId) => (selected ? next.add(itemId) : next.delete(itemId)))
            return next
        })
    }

    const handleBulkDelete = () => {
        const itemIds = [...selectedItemIds]
        toast(
            (notification) => (
                <div className="flex flex-col gap-2">
                    <span>
                        Remove {itemIds.length} selected item{itemIds.length === 1 ? '' : 's'} from inventory?
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                toast.dismiss(notification.id)
                                try {
                                    await Promise.all(itemIds.map((itemId) => deleteInventory.mutateAsync(itemId)))
                                    setSelectedItemIds(new Set())
                                    toast.success(`Removed ${itemIds.length} item${itemIds.length === 1 ? '' : 's'}`)
                                } catch {
                                    toast.error('Some selected items could not be removed')
                                }
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => toast.dismiss(notification.id)}
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
                                    onSuccess: () => {
                                        setSelectedItemIds((current) => {
                                            const next = new Set(current)
                                            next.delete(item.id)
                                            return next
                                        })
                                        toast.success('Removed from inventory')
                                    },
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
        columnHelper.display({
            id: 'select',
            header: () => {
                const allSelected = inventory.length > 0 && inventory.every((item) => selectedItemIds.has(item.id))
                return (
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() =>
                            setItemsSelected(
                                inventory.map((item) => item.id),
                                !allSelected,
                            )
                        }
                        aria-label="Select all inventory items"
                        className="h-4 w-4 accent-lime-600 cursor-pointer"
                    />
                )
            },
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={selectedItemIds.has(row.original.id)}
                    onChange={() => toggleItemSelection(row.original.id)}
                    onClick={(event) => event.stopPropagation()}
                    aria-label="Select inventory item"
                    className="h-4 w-4 accent-lime-600 cursor-pointer"
                />
            ),
        }),
        columnHelper.accessor('created_at', {
            header: 'Added',
            size: 192,
            minSize: 192,
            maxSize: 192,
            cell: (info) => {
                const createdAt = info.getValue()
                const itemId = info.row.original.id
                const showTimestamp = showAddedTimestamp.has(itemId)
                return (
                    <div className="w-48 text-left text-sm">
                        <button
                            type="button"
                            onClick={() =>
                                setShowAddedTimestamp((current) => {
                                    const next = new Set(current)
                                    if (next.has(itemId)) next.delete(itemId)
                                    else next.add(itemId)
                                    return next
                                })
                            }
                            className="whitespace-nowrap text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
                            title={showTimestamp ? 'Show elapsed time' : 'Show date and time'}
                        >
                            {showTimestamp ? formatAddedAt(createdAt) : formatElapsedTime(createdAt, currentTime)}
                        </button>
                    </div>
                )
            },
            sortingFn: (a, b) => {
                const dateA = parseApiDate(a.original.created_at)
                const dateB = parseApiDate(b.original.created_at)
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
        columnHelper.accessor((row) => row.spool.color.name, {
            id: 'color',
            header: 'Color',
            cell: (info) => {
                const color = info.row.original.spool.color
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
        columnHelper.accessor((row) => row.status.name, {
            id: 'status',
            header: 'Status',
            cell: (info) => {
                const status = info.row.original.status
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
        // columnHelper.accessor('custom_properties', {
        //     header: 'Notes',
        //     cell: (info) => <div className="text-left text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate">{info.getValue() || '-'}</div>,
        // }),
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

    const sortedRows = table.getSortedRowModel().rows
    const groups = new Map<string, typeof sortedRows>()
    sortedRows.forEach((row) => {
        const groupName =
            groupBy === 'brand'
                ? row.original.spool.brand.name
                : groupBy === 'material'
                  ? row.original.spool.material.name
                  : groupBy === 'color'
                    ? row.original.spool.color.name
                    : groupBy === 'status'
                      ? row.original.status.name.replace('_', ' ')
                      : 'All inventory'
        groups.set(groupName, [...(groups.get(groupName) ?? []), row])
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
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Group by
                    <select
                        value={groupBy}
                        onChange={(event) => setGroupBy(event.target.value as GroupBy)}
                        className="border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                        {groupByOptions.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={deleteInventory.isPending || selectedItemIds.size <= 0}
                    className="flex items-center gap-2 bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Trash2 size={15} /> Delete {selectedItemIds.size} selected
                </button>
            </div>
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
                        {[...groups.entries()]
                            .sort(([firstGroupName], [secondGroupName]) => firstGroupName.localeCompare(secondGroupName))
                            .map(([groupName, rows]) => {
                                const groupItemIds = rows.map((row) => row.original.id)
                                const isGroupSelected = groupItemIds.every((itemId) => selectedItemIds.has(itemId))
                                const isCollapsed = collapsedGroups.has(groupName)
                                return (
                                    <Fragment key={groupName}>
                                        {groupBy !== 'none' && (
                                            <tr className="border-y border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                                                <td
                                                    colSpan={columns.length}
                                                    className="px-4 py-2"
                                                >
                                                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                        <input
                                                            type="checkbox"
                                                            checked={isGroupSelected}
                                                            onChange={() => setItemsSelected(groupItemIds, !isGroupSelected)}
                                                            aria-label={`Select all ${groupName} inventory items`}
                                                            className="h-4 w-4 accent-lime-600 cursor-pointer"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setCollapsedGroups((current) => {
                                                                    const next = new Set(current)
                                                                    if (next.has(groupName)) next.delete(groupName)
                                                                    else next.add(groupName)
                                                                    return next
                                                                })
                                                            }
                                                            className="flex items-center gap-2 transition-colors hover:text-lime-700 dark:hover:text-lime-400"
                                                        >
                                                            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                                                            {groupName}
                                                            <span className="font-normal text-gray-500 dark:text-gray-400">{rows.length}</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {!isCollapsed &&
                                            rows.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    onClick={(event) => {
                                                        if (!(event.target as HTMLElement).closest('button, input, a, select, textarea')) {
                                                            toggleItemSelection(row.original.id)
                                                        }
                                                    }}
                                                    className={`border-b border-gray-100 transition-all duration-300 ease-out dark:border-gray-800 ${
                                                        selectedItemIds.has(row.original.id)
                                                            ? 'bg-lime-50 dark:bg-lime-950/30'
                                                            : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                                                    } cursor-pointer`}
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
                                    </Fragment>
                                )
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default InventoryTable
