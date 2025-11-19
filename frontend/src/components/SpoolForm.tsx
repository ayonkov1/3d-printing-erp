import React, { useState } from 'react'
import { useCreateSpool, useBrands, useColors, useMaterials } from '../hooks'
import type { SpoolCreate } from '../types'

interface SpoolFormProps {
    onSuccess?: () => void
}

const SpoolForm: React.FC<SpoolFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState<SpoolCreate>({
        barcode: '',
        quantity: 1,
        is_box: false,
        weight: 1000,
        thickness: 1.75,
        spool_return: false,
        color_name: '',
        brand_name: '',
        material_name: '',
    })

    const { data: brands } = useBrands()
    const { data: colors } = useColors()
    const { data: materials } = useMaterials()
    const createSpool = useCreateSpool()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createSpool.mutateAsync(formData)
            // Reset form
            setFormData({
                barcode: '',
                quantity: 1,
                is_box: false,
                weight: 1000,
                thickness: 1.75,
                spool_return: false,
                color_name: '',
                brand_name: '',
                material_name: '',
            })
            onSuccess?.()
        } catch (error) {
            console.error('Failed to create spool:', error)
        }
    }

    const handleColorChange = (colorName: string) => {
        const selectedColor = colors?.find((c) => c.name === colorName)
        setFormData({
            ...formData,
            color_name: colorName,
            color_hex_code: selectedColor?.hex_code,
        })
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            {/* Quantity and Barcode */}
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Quantity (same type)"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                />
                <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-20 px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    min="1"
                />
            </div>

            {/* Box Toggle */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">BOX</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.is_box}
                        onChange={(e) => setFormData({ ...formData, is_box: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                </label>
            </div>

            {/* Material */}
            <div className="flex gap-2">
                <select
                    value={formData.material_name}
                    onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                >
                    <option value="">Material</option>
                    {materials?.map((material) => (
                        <option
                            key={material.id}
                            value={material.name}
                        >
                            {material.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className="px-4 py-2 bg-lime-500 text-white font-medium rounded hover:bg-lime-600 transition-colors"
                >
                    Add new
                </button>
            </div>

            {/* Brand */}
            <div className="flex gap-2">
                <select
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                >
                    <option value="">Brand</option>
                    {brands?.map((brand) => (
                        <option
                            key={brand.id}
                            value={brand.name}
                        >
                            {brand.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className="px-4 py-2 bg-lime-500 text-white font-medium rounded hover:bg-lime-600 transition-colors"
                >
                    Add new
                </button>
            </div>

            {/* Trade name (barcode field) */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Trade name"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                />
                <button
                    type="button"
                    className="px-4 py-2 bg-lime-500 text-white font-medium rounded hover:bg-lime-600 transition-colors"
                >
                    Add new
                </button>
            </div>

            {/* Weight */}
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Weight"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    readOnly
                    value="Weight"
                />
                <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 1000 })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    step="0.1"
                />
            </div>

            {/* Spool Weight */}
            <div className="flex gap-2">
                <select className="flex-1 px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option>Spool Weight</option>
                </select>
                <button
                    type="button"
                    className="px-4 py-2 bg-lime-500 text-white font-medium rounded hover:bg-lime-600 transition-colors"
                >
                    Add new
                </button>
            </div>

            {/* Color group */}
            <select className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option>Color group</option>
            </select>

            {/* Color */}
            <div className="flex gap-2">
                <select
                    value={formData.color_name}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                >
                    <option value="">Color</option>
                    {colors?.map((color) => (
                        <option
                            key={color.id}
                            value={color.name}
                        >
                            {color.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className="px-4 py-2 bg-lime-500 text-white font-medium rounded hover:bg-lime-600 transition-colors"
                >
                    Add new
                </button>
            </div>

            {/* Thickness */}
            <select
                value={formData.thickness || ''}
                onChange={(e) => setFormData({ ...formData, thickness: parseFloat(e.target.value) || null })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
                <option value="">Thickness - 1.75mm</option>
                <option value="1.75">1.75mm</option>
                <option value="2.85">2.85mm</option>
                <option value="3.00">3.00mm</option>
            </select>

            {/* Spool Return Toggle */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Spool Return</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.spool_return}
                        onChange={(e) => setFormData({ ...formData, spool_return: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                </label>
            </div>

            {/* Category (Optional) */}
            <div className="flex gap-2">
                <select className="flex-1 px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option>Category (Optional)</option>
                </select>
                <button
                    type="button"
                    className="px-4 py-2 bg-lime-500 text-white font-medium rounded hover:bg-lime-600 transition-colors"
                >
                    Add new
                </button>
            </div>

            {/* New Property (Optional) */}
            <button
                type="button"
                className="w-full px-4 py-2 bg-lime-500 text-white font-medium rounded hover:bg-lime-600 transition-colors"
            >
                New Property (Optional)
            </button>

            {/* Submit Button - hidden, form submits via action bar */}
        </form>
    )
}

export default SpoolForm
