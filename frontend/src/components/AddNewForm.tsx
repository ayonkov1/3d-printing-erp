import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useBrands, useColors, useMaterials, useCreateSpool } from '../hooks'
import type { SpoolCreate } from '../types'
import { AddMaterialModal } from './AddMaterialModal'
import { AddBrandModal } from './AddBrandModal'
import { AddColorModal } from './AddColorModal'
import { CustomSelect, type SelectOption } from './CustomSelect'

export const AddNewForm: React.FC = () => {
    const [customWeight, setCustomWeight] = useState(false)
    const [customThickness, setCustomThickness] = useState(false)
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
    const [isColorModalOpen, setIsColorModalOpen] = useState(false)
    const [spoolWeight, setSpoolWeight] = useState('')
    const [colorGroup, setColorGroup] = useState('')
    const [category, setCategory] = useState('')
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<SpoolCreate>({
        defaultValues: {
            base_weight: 1000,
            thickness: 1.75,
            is_box: false,
            spool_return: false,
        },
    })

    const { data: brands = [] } = useBrands()
    const { data: colors = [] } = useColors()
    const { data: materials = [] } = useMaterials()
    const createSpool = useCreateSpool()

    // Transform data into SelectOption format for CustomSelect
    const materialOptions: SelectOption[] = materials.length
        ? materials.map((m) => ({ id: m.id, name: m.name }))
        : [
              { id: 'pla', name: 'PLA' },
              { id: 'petg', name: 'PETG' },
              { id: 'abs', name: 'ABS' },
              { id: 'tpu', name: 'TPU' },
              { id: 'asa', name: 'ASA' },
          ]

    const brandOptions: SelectOption[] = brands.length
        ? brands.map((b) => ({ id: b.id, name: b.name }))
        : [
              { id: 'bambu', name: 'Bambu' },
              { id: 'prusament', name: 'Prusament' },
              { id: 'sunlu', name: 'Sunlu' },
              { id: 'esun', name: 'eSun' },
          ]

    const colorOptions: SelectOption[] = colors.length
        ? colors.map((c) => ({ id: c.id, name: c.name, color: c.hex_code }))
        : [
              { id: 'white', name: 'White', color: '#FFFFFF' },
              { id: 'black', name: 'Black', color: '#000000' },
              { id: 'red', name: 'Red', color: '#FF0000' },
              { id: 'blue', name: 'Blue', color: '#0000FF' },
          ]

    const spoolWeightOptions: SelectOption[] = [
        { id: '200', name: '200g' },
        { id: '250', name: '250g' },
    ]

    const colorGroupOptions: SelectOption[] = [
        { id: 'neutral', name: 'Neutral' },
        { id: 'warm', name: 'Warm' },
        { id: 'cool', name: 'Cool' },
        { id: 'metallic', name: 'Metallic' },
    ]

    const categoryOptions: SelectOption[] = [
        { id: 'functional', name: 'Functional' },
        { id: 'decorative', name: 'Decorative' },
        { id: 'engineering', name: 'Engineering' },
        { id: 'prototype', name: 'Prototype' },
    ]

    const currentWeight = watch('base_weight')
    const currentThickness = watch('thickness')

    const onSubmit = (data: SpoolCreate) => {
        // Find the selected color to get its hex code
        const selectedColor = colors.find((c) => c.name === data.color_name)

        // Generate a random barcode if not provided (temporary solution)
        const payload: SpoolCreate = {
            ...data,
            barcode: data.barcode || `AUTO-${Math.random().toString(36).substring(7).toUpperCase()}`,
            // Ensure numbers are numbers, handle null/undefined thickness
            base_weight: Number(data.base_weight),
            thickness: data.thickness ? Number(data.thickness) : null,
            color_hex_code: selectedColor?.hex_code || '#000000',
            // Only include trade_name and category_name if they have values
            trade_name: data.trade_name || undefined,
            category_name: data.category_name || undefined,
        }

        createSpool.mutate(payload, {
            onSuccess: () => {
                reset()
                setCustomWeight(false)
                setCustomThickness(false)
                toast.success('Spool created successfully!')
            },
            onError: (error) => {
                toast.error(`Error creating spool: ${error.message}`)
            },
        })
    }

    const handleWeightSelect = (weight: number | 'custom') => {
        if (weight === 'custom') {
            setCustomWeight(true)
            setValue('base_weight', 0)
        } else {
            setCustomWeight(false)
            setValue('base_weight', weight)
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
        <>
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

                {/* Box & Spool Return */}
                <div className="flex items-end gap-6">
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

                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">SPOOL RETURN</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('spool_return')}
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
                        <Controller
                            name="material_name"
                            control={control}
                            rules={{ required: 'Material is required' }}
                            render={({ field }) => (
                                <CustomSelect
                                    options={materialOptions}
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="Select Material"
                                    error={errors.material_name?.message}
                                />
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setIsMaterialModalOpen(true)}
                            className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap cursor-pointer"
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
                        <Controller
                            name="brand_name"
                            control={control}
                            rules={{ required: 'Brand is required' }}
                            render={({ field }) => (
                                <CustomSelect
                                    options={brandOptions}
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="Select Brand"
                                    error={errors.brand_name?.message}
                                />
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setIsBrandModalOpen(true)}
                            className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap cursor-pointer"
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
                            {...register('trade_name')}
                            placeholder="Optional (e.g., PolyLite, Galaxy Black)"
                            className="flex-1 border border-gray-400 px-3 py-2 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500"
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="flex flex-col w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <div className="flex gap-2">
                        <CustomSelect
                            options={categoryOptions}
                            value={category}
                            onChange={(val) => {
                                setCategory(val)
                                setValue('category_name', val || undefined)
                            }}
                            placeholder="Select Category (Optional)"
                        />
                    </div>
                </div>

                {/* Base Weight */}
                <div className="flex flex-col w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Weight</label>
                    <div className="flex gap-2">
                        {[1000, 750, 500].map((w) => (
                            <button
                                key={w}
                                type="button"
                                onClick={() => handleWeightSelect(w)}
                                className={`px-4 py-2 text-sm font-medium border cursor-pointer ${
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
                            className={`px-4 py-2 text-sm font-medium border cursor-pointer ${
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
                                    {...register('base_weight', { required: 'Base weight is required' })}
                                    className="flex-1 bg-transparent text-right dark:text-white focus:outline-none w-full"
                                    placeholder="Enter weight"
                                />
                                <span className="ml-2 text-gray-500 dark:text-gray-400">g.</span>
                            </div>
                        )}
                    </div>
                    {errors.base_weight && <span className="text-red-500 text-xs mt-1">{errors.base_weight.message}</span>}
                </div>

                {/* Spool Weight */}
                <div className="flex flex-col w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spool Weight</label>
                    <div className="flex gap-2">
                        <CustomSelect
                            options={spoolWeightOptions}
                            value={spoolWeight}
                            onChange={setSpoolWeight}
                            placeholder="Select Spool Weight"
                        />
                        <button
                            type="button"
                            className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap cursor-pointer"
                        >
                            Add new
                        </button>
                    </div>
                </div>

                {/* Color Group */}
                <div className="flex flex-col w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color group</label>
                    <CustomSelect
                        options={colorGroupOptions}
                        value={colorGroup}
                        onChange={setColorGroup}
                        placeholder="Select Color Group"
                    />
                </div>

                {/* Color */}
                <div className="flex flex-col w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                    <div className="flex gap-2">
                        <Controller
                            name="color_name"
                            control={control}
                            rules={{ required: 'Color is required' }}
                            render={({ field }) => (
                                <CustomSelect
                                    options={colorOptions}
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="Select Color"
                                    error={errors.color_name?.message}
                                    showColorDot
                                />
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setIsColorModalOpen(true)}
                            className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap cursor-pointer"
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
                                className={`px-4 py-2 text-sm font-medium border cursor-pointer ${
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
                            className={`px-4 py-2 text-sm font-medium border cursor-pointer ${
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
                        <CustomSelect
                            options={categoryOptions}
                            value={category}
                            onChange={setCategory}
                            placeholder="Select Category"
                        />
                        <button
                            type="button"
                            className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 whitespace-nowrap cursor-pointer"
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
                        className="w-full bg-lime-500 text-white px-6 py-3 text-sm font-medium hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {createSpool.isPending ? 'Creating...' : 'CREATE SPOOL'}
                    </button>
                </div>

                <div className="pt-2">
                    <button
                        type="button"
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 w-full cursor-pointer"
                    >
                        New Property (Optional)
                    </button>
                </div>
            </form>

            {/* Add Material Modal - outside form to prevent form submission issues */}
            <AddMaterialModal
                isOpen={isMaterialModalOpen}
                onClose={() => setIsMaterialModalOpen(false)}
            />

            {/* Add Brand Modal */}
            <AddBrandModal
                isOpen={isBrandModalOpen}
                onClose={() => setIsBrandModalOpen(false)}
            />

            {/* Add Color Modal */}
            <AddColorModal
                isOpen={isColorModalOpen}
                onClose={() => setIsColorModalOpen(false)}
            />
        </>
    )
}
