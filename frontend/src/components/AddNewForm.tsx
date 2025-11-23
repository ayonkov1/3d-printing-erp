import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useBrands, useColors, useMaterials, useCreateSpool } from '../hooks'
import type { SpoolCreate } from '../types'

export const AddNewForm: React.FC = () => {
    const [customWeight, setCustomWeight] = useState(false)
    const [customThickness, setCustomThickness] = useState(false)
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SpoolCreate>({
        defaultValues: {
            quantity: 1,
            weight: 1000,
            thickness: 1.75,
            is_box: false,
            spool_return: false,
            status: 'in_stock',
        },
    })

    const { data: brands = [] } = useBrands()
    const { data: colors = [] } = useColors()
    const { data: materials = [] } = useMaterials()
    const createSpool = useCreateSpool()

    const currentWeight = watch('weight')
    const currentThickness = watch('thickness')

    const onSubmit = (data: SpoolCreate) => {
        // Find the selected color to get its hex code
        const selectedColor = colors.find((c) => c.name === data.color_name)

        // Generate a random barcode if not provided (temporary solution)
        const payload = {
            ...data,
            barcode: data.barcode || `AUTO-${Math.random().toString(36).substring(7).toUpperCase()}`,
            // Ensure numbers are numbers
            quantity: Number(data.quantity),
            weight: Number(data.weight),
            thickness: Number(data.thickness),
            color_hex_code: selectedColor?.hex_code || '#000000',
            status: data.status || 'in_stock',
        }

        createSpool.mutate(payload, {
            onSuccess: () => {
                reset()
                setCustomWeight(false)
                setCustomThickness(false)
                alert('Spool created successfully!')
            },
            onError: (error) => {
                alert(`Error creating spool: ${error.message}`)
            },
        })
    }

    const handleWeightSelect = (weight: number | 'custom') => {
        if (weight === 'custom') {
            setCustomWeight(true)
            setValue('weight', 0)
        } else {
            setCustomWeight(false)
            setValue('weight', weight)
        }
    }

    const handleThicknessSelect = (thickness: number | 'custom') => {
        if (thickness === 'custom') {
            setCustomThickness(true)
            setValue('thickness', 0)
        } else {
            setCustomThickness(false)
            setValue('thickness', thickness)
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-4xl space-y-4"
        >
            {/* Barcode Field (Added as it is required by backend) */}
            <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barcode</label>
                <input
                    type="text"
                    {...register('barcode')}
                    placeholder="Scan or enter barcode (optional, auto-generated if empty)"
                    className="w-full border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                />
            </div>

            {/* Quantity & Box */}
            <div className="flex items-end gap-6">
                <div className="flex flex-col w-32">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                    <input
                        type="number"
                        {...register('quantity')}
                        className="w-full border border-gray-400 px-3 py-2 text-right bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                </div>

                <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">BOX</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            {...register('is_box')}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white border border-gray-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                    </label>
                </div>
            </div>

            {/* Material */}
            <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material</label>
                <div className="flex gap-2">
                    <select
                        {...register('material_name', { required: 'Material is required' })}
                        className="flex-1 border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                    >
                        <option value="">Select Material</option>
                        {materials.map((m) => (
                            <option
                                key={m.id}
                                value={m.name}
                            >
                                {m.name}
                            </option>
                        ))}
                        {/* Predefined materials if list is empty or as extras */}
                        {!materials.length && (
                            <>
                                <option value="PLA">PLA</option>
                                <option value="PETG">PETG</option>
                                <option value="ABS">ABS</option>
                                <option value="TPU">TPU</option>
                                <option value="ASA">ASA</option>
                            </>
                        )}
                    </select>
                    <button
                        type="button"
                        className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap"
                    >
                        Add new
                    </button>
                </div>
                {errors.material_name && <span className="text-red-500 text-xs mt-1">{errors.material_name.message}</span>}
            </div>

            {/* Brand */}
            <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                <div className="flex gap-2">
                    <select
                        {...register('brand_name', { required: 'Brand is required' })}
                        className="flex-1 border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                    >
                        <option value="">Select Brand</option>
                        {brands.map((b) => (
                            <option
                                key={b.id}
                                value={b.name}
                            >
                                {b.name}
                            </option>
                        ))}
                        {!brands.length && (
                            <>
                                <option value="Bambu">Bambu</option>
                                <option value="Prusament">Prusament</option>
                                <option value="Sunlu">Sunlu</option>
                                <option value="eSun">eSun</option>
                            </>
                        )}
                    </select>
                    <button
                        type="button"
                        className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap"
                    >
                        Add new
                    </button>
                </div>
                {errors.brand_name && <span className="text-red-500 text-xs mt-1">{errors.brand_name.message}</span>}
            </div>

            {/* Trade Name */}
            <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trade name</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Optional"
                        className="flex-1 border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                    <button
                        type="button"
                        className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap"
                    >
                        Add new
                    </button>
                </div>
            </div>

            {/* Weight */}
            <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                <div className="flex gap-2">
                    {[1000, 750, 500].map((w) => (
                        <button
                            key={w}
                            type="button"
                            onClick={() => handleWeightSelect(w)}
                            className={`px-4 py-2 text-sm font-medium border ${
                                !customWeight && currentWeight === w
                                    ? 'bg-lime-500 text-white border-lime-500'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {w}g
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleWeightSelect('custom')}
                        className={`px-4 py-2 text-sm font-medium border ${
                            customWeight
                                ? 'bg-lime-500 text-white border-lime-500'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Custom
                    </button>

                    {customWeight && (
                        <div className="flex items-center border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 ml-2 flex-1">
                            <input
                                type="number"
                                {...register('weight', { required: 'Weight is required' })}
                                className="flex-1 bg-transparent text-right dark:text-white focus:outline-none w-full"
                                placeholder="Enter weight"
                            />
                            <span className="ml-2 text-gray-500 dark:text-gray-400">g.</span>
                        </div>
                    )}
                </div>
                {errors.weight && <span className="text-red-500 text-xs mt-1">{errors.weight.message}</span>}
            </div>

            {/* Spool Weight */}
            <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spool Weight</label>
                <div className="flex gap-2">
                    <select className="flex-1 border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500">
                        <option value="">Select Spool Weight</option>
                        <option value="200">200g</option>
                        <option value="250">250g</option>
                    </select>
                    <button
                        type="button"
                        className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap"
                    >
                        Add new
                    </button>
                </div>
            </div>

            {/* Color Group */}
            <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color group</label>
                <select className="w-full border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500">
                    <option value="">Select Color Group</option>
                </select>
            </div>

            {/* Color */}
            <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <div className="flex gap-2">
                    <select
                        {...register('color_name', { required: 'Color is required' })}
                        className="flex-1 border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                    >
                        <option value="">Select Color</option>
                        {colors.map((c) => (
                            <option
                                key={c.id}
                                value={c.name}
                            >
                                {c.name}
                            </option>
                        ))}
                        {!colors.length && (
                            <>
                                <option value="White">White</option>
                                <option value="Black">Black</option>
                                <option value="Red">Red</option>
                                <option value="Blue">Blue</option>
                            </>
                        )}
                    </select>
                    <button
                        type="button"
                        className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap"
                    >
                        Add new
                    </button>
                </div>
                {errors.color_name && <span className="text-red-500 text-xs mt-1">{errors.color_name.message}</span>}
            </div>

            {/* Thickness */}
            <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thickness</label>
                <div className="flex gap-2">
                    {[1.75, 2.85].map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => handleThicknessSelect(t)}
                            className={`px-4 py-2 text-sm font-medium border ${
                                !customThickness && currentThickness === t
                                    ? 'bg-lime-500 text-white border-lime-500'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            {t}mm
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleThicknessSelect('custom')}
                        className={`px-4 py-2 text-sm font-medium border ${
                            customThickness
                                ? 'bg-lime-500 text-white border-lime-500'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        Custom
                    </button>

                    {customThickness && (
                        <div className="flex items-center border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 ml-2 flex-1">
                            <input
                                type="number"
                                step="0.01"
                                {...register('thickness', { required: 'Thickness is required' })}
                                className="flex-1 bg-transparent text-right dark:text-white focus:outline-none w-full"
                                placeholder="Enter thickness"
                            />
                            <span className="ml-2 text-gray-500 dark:text-gray-400">mm</span>
                        </div>
                    )}
                </div>
                {errors.thickness && <span className="text-red-500 text-xs mt-1">{errors.thickness.message}</span>}
            </div>

            {/* Spool Return */}
            <div className="flex items-center gap-3 mt-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Spool Return</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        {...register('spool_return')}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white border border-gray-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                </label>
            </div>

            {/* Category */}
            <div className="flex flex-col w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category (Optional)</label>
                <div className="flex gap-2">
                    <select className="flex-1 border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500">
                        <option value="">Select Category</option>
                    </select>
                    <button
                        type="button"
                        className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap"
                    >
                        Add new
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={createSpool.isPending}
                    className="w-full bg-lime-500 text-white px-6 py-3 text-sm font-medium hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {createSpool.isPending ? 'Creating...' : 'CREATE SPOOL'}
                </button>
            </div>

            <div className="pt-2">
                <button
                    type="button"
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 w-full"
                >
                    New Property (Optional)
                </button>
            </div>
        </form>
    )
}
