import React from 'react'
import { useSpools } from '../hooks'
import type { Spool } from '../types'

interface SpoolsTableProps {
    onRowSelect?: (spool: Spool | null) => void
    selectedSpoolId?: string | null
}

const SpoolsTable: React.FC<SpoolsTableProps> = ({ onRowSelect, selectedSpoolId }) => {
    const { data: spools, isLoading, error } = useSpools()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading spools...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error loading spools: {error.message}</div>
            </div>
        )
    }

    if (!spools || spools.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">No spools found. Add your first spool!</div>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Barcode</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Material</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Brand</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Color</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Weight (g)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Thickness (mm)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">Box</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {spools.map((spool) => (
                        <tr
                            key={spool.id}
                            onClick={() => onRowSelect?.(selectedSpoolId === spool.id ? null : spool)}
                            className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                                selectedSpoolId === spool.id ? 'bg-cyan-50 border-l-4 border-cyan-500' : ''
                            }`}
                        >
                            <td className="px-4 py-3 text-sm text-gray-900">{spool.barcode}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{spool.material.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{spool.brand.name}</td>
                            <td className="px-4 py-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded border border-gray-300"
                                        style={{ backgroundColor: spool.color.hex_code }}
                                        title={spool.color.hex_code}
                                    />
                                    <span className="text-gray-900">{spool.color.name}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{spool.weight}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{spool.thickness || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{spool.quantity}</td>
                            <td className="px-4 py-3 text-sm">
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        spool.status === 'in_stock'
                                            ? 'bg-green-100 text-green-800'
                                            : spool.status === 'in_use'
                                              ? 'bg-blue-100 text-blue-800'
                                              : spool.status === 'depleted'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                >
                                    {spool.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{spool.is_box ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default SpoolsTable
