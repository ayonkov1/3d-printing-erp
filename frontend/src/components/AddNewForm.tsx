import React from 'react'

export const AddNewForm: React.FC = () => {
    return (
        <div className="w-full max-w-4xl">
            <div className="flex gap-4 mb-6">
                <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 border border-gray-400 px-2 py-2 bg-white dark:bg-gray-800">
                        Quantity (same type)
                    </label>
                </div>
                <input
                    type="number"
                    defaultValue={1}
                    className="w-24 border border-gray-400 px-2 py-1 text-right bg-white dark:bg-gray-800 dark:text-white"
                />
            </div>

            <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">BOX</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white border border-gray-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                </label>
            </div>

            <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
                <label className="bg-gray-800 text-white px-4 py-2 text-sm h-10 flex items-center">Material</label>
                <select className="border border-gray-400 px-2 py-2 w-full bg-white dark:bg-gray-800 dark:text-white h-10">
                    <option></option>
                </select>
                <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 h-10">Add new</button>
            </div>

            <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
                <label className="bg-gray-800 text-white px-4 py-2 text-sm h-10 flex items-center">Brand</label>
                <select className="border border-gray-400 px-2 py-2 w-full bg-white dark:bg-gray-800 dark:text-white h-10">
                    <option></option>
                </select>
                <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 h-10">Add new</button>
            </div>

            <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
                <label className="bg-gray-800 text-white px-4 py-2 text-sm h-10 flex items-center">Trade name</label>
                <select className="border border-gray-400 px-2 py-2 w-full bg-white dark:bg-gray-800 dark:text-white h-10">
                    <option></option>
                </select>
                <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 h-10">Add new</button>
            </div>

            <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
                <label className="border border-gray-400 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 h-10 flex items-center bg-white dark:bg-gray-800">
                    Weight
                </label>
                <div className="border border-gray-400 px-2 py-2 w-full flex justify-end items-center bg-white dark:bg-gray-800 h-10">
                    <span className="text-gray-700 dark:text-gray-300">1000 g.</span>
                </div>
                <div></div>
            </div>

            <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
                <label className="bg-gray-800 text-white px-4 py-2 text-sm h-10 flex items-center">Spool Weight</label>
                <select className="border border-gray-400 px-2 py-2 w-full bg-white dark:bg-gray-800 dark:text-white h-10">
                    <option></option>
                </select>
                <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 h-10">Add new</button>
            </div>

            <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
                <label className="bg-gray-800 text-white px-4 py-2 text-sm h-10 flex items-center">Color group</label>
                <select className="border border-gray-400 px-2 py-2 w-full bg-white dark:bg-gray-800 dark:text-white h-10">
                    <option></option>
                </select>
                <div></div>
            </div>

            <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
                <label className="bg-gray-800 text-white px-4 py-2 text-sm h-10 flex items-center">Color</label>
                <select className="border border-gray-400 px-2 py-2 w-full bg-white dark:bg-gray-800 dark:text-white h-10">
                    <option></option>
                </select>
                <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 h-10">Add new</button>
            </div>

            <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
                <label className="bg-gray-800 text-white px-4 py-2 text-sm h-10 flex items-center">Thickness - 1.75mm</label>
                <select className="border border-gray-400 px-2 py-2 w-full bg-white dark:bg-gray-800 dark:text-white h-10">
                    <option></option>
                </select>
                <div></div>
            </div>

            <div className="flex items-center gap-4 mb-6 mt-6">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Spool Return</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white border border-gray-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                </label>
            </div>

            <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
                <label className="bg-gray-800 text-white px-4 py-2 text-sm h-10 flex items-center">Category (Optional)</label>
                <select className="border border-gray-400 px-2 py-2 w-full bg-white dark:bg-gray-800 dark:text-white h-10">
                    <option></option>
                </select>
                <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600 h-10">Add new</button>
            </div>

            <div className="mt-6">
                <button className="bg-lime-500 text-white px-6 py-2 text-sm font-medium hover:bg-lime-600 w-[200px] h-10">New Property (Optional)</button>
            </div>
        </div>
    )
}
