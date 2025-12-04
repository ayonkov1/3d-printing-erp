import React from 'react'
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, type RowSelectionState } from '@tanstack/react-table'
import { useSpools } from '../hooks'
import type { Spool } from '../types'

interface SpoolsTableProps {
    onRowSelect?: (spools: Spool[]) => void
}

const columnHelper = createColumnHelper<Spool>()

const SpoolsTable: React.FC<SpoolsTableProps> = ({ onRowSelect }) => {
    const { data: spools = [], isLoading, error } = useSpools()
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

    const columns = [
        columnHelper.display({
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                    className="w-4 h-4 cursor-pointer"
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                    className="w-4 h-4 cursor-pointer"
                />
            ),
        }),
        columnHelper.accessor('barcode', {
            header: 'Barcode',
            cell: (info) => <div className="text-left">{info.getValue()}</div>,
        }),
        columnHelper.accessor((row) => row.material.name, {
            id: 'material',
            header: 'Material',
            cell: (info) => <div className="text-left">{info.getValue()}</div>,
        }),
        columnHelper.accessor((row) => row.brand.name, {
            id: 'brand',
            header: 'Brand',
            cell: (info) => <div className="text-left">{info.getValue()}</div>,
        }),
        columnHelper.accessor('color', {
            header: 'Color',
            cell: (info) => {
                const color = info.getValue()
                return (
                    <div className="flex items-center gap-2 text-left">
                        <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: color.hex_code }}
                        />
                        <span>{color.name}</span>
                    </div>
                )
            },
        }),
        columnHelper.accessor('base_weight', {
            header: 'Base Weight (g)',
            cell: (info) => <div className="text-right">{info.getValue()}</div>,
        }),
        columnHelper.accessor('thickness', {
            header: 'Thickness (mm)',
            cell: (info) => <div className="text-right">{info.getValue() || '-'}</div>,
        }),
        columnHelper.accessor('spool_return', {
            header: 'Returnable',
            cell: (info) => <div className="text-center">{info.getValue() ? '✓' : '-'}</div>,
        }),
        columnHelper.accessor('is_box', {
            header: 'Box',
            cell: (info) => <div className="text-left">{info.getValue() ? 'Yes' : 'No'}</div>,
        }),
    ]

    const table = useReactTable({
        data: spools,
        columns,
        state: {
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
    })

    React.useEffect(() => {
        const selectedRowsData = table.getSelectedRowModel().rows.map((row) => row.original)

        if (onRowSelect) {
            onRowSelect(selectedRowsData)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowSelection, onRowSelect])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-300">Loading spools...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-400">Error loading spools: {error.message}</div>
            </div>
        )
    }

    if (!spools || spools.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-300">No spools found. Add your first spool!</div>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto h-full">
            <table className="min-w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600"
                                >
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr
                            key={row.id}
                            className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${row.getIsSelected() ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                            onClick={row.getToggleSelectedHandler()}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className="px-4 py-3 text-sm"
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

export default SpoolsTable
