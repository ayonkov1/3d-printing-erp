import React from 'react';

export const AddNewForm: React.FC = () => {
  return (
    <div className="w-full max-w-4xl">
      <div className="flex gap-4 mb-6">
        <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 border border-gray-400 px-2 py-1">Quantity (same type)</label>
        </div>
        <input 
            type="number" 
            defaultValue={1}
            className="w-24 border border-gray-400 px-2 py-1 text-right"
        />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">BOX</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
        <label className="bg-gray-800 text-white px-4 py-2 text-sm">Material</label>
        <select className="border border-gray-400 px-2 py-2 w-full bg-transparent dark:text-white">
            <option></option>
        </select>
        <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600">Add new</button>
      </div>

      <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
        <label className="bg-gray-800 text-white px-4 py-2 text-sm">Brand</label>
        <select className="border border-gray-400 px-2 py-2 w-full bg-transparent dark:text-white">
            <option></option>
        </select>
        <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600">Add new</button>
      </div>

      <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
        <label className="bg-gray-800 text-white px-4 py-2 text-sm">Trade name</label>
        <select className="border border-gray-400 px-2 py-2 w-full bg-transparent dark:text-white">
            <option></option>
        </select>
        <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600">Add new</button>
      </div>

      <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
        <label className="border border-gray-400 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Weight</label>
        <div className="border border-gray-400 px-2 py-2 w-full flex justify-end items-center bg-white dark:bg-gray-800">
            <span className="text-gray-700 dark:text-gray-300">1000 g.</span>
        </div>
        <div></div>
      </div>

      <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
        <label className="bg-gray-800 text-white px-4 py-2 text-sm">Spool Weight</label>
        <select className="border border-gray-400 px-2 py-2 w-full bg-transparent dark:text-white">
            <option></option>
        </select>
        <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600">Add new</button>
      </div>

      <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
        <label className="bg-gray-800 text-white px-4 py-2 text-sm">Color group</label>
        <select className="border border-gray-400 px-2 py-2 w-full bg-transparent dark:text-white">
            <option></option>
        </select>
        <div></div>
      </div>

      <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
        <label className="bg-gray-800 text-white px-4 py-2 text-sm">Color</label>
        <select className="border border-gray-400 px-2 py-2 w-full bg-transparent dark:text-white">
            <option></option>
        </select>
        <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600">Add new</button>
      </div>

      <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
        <label className="bg-gray-800 text-white px-4 py-2 text-sm">Thickness - 1.75mm</label>
        <select className="border border-gray-400 px-2 py-2 w-full bg-transparent dark:text-white">
            <option></option>
        </select>
        <div></div>
      </div>

      <div className="flex items-center gap-4 mb-6 mt-6">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Spool Return</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="grid grid-cols-[200px_1fr_120px] gap-4 items-center mb-4">
        <label className="bg-gray-800 text-white px-4 py-2 text-sm">Category (Optional)</label>
        <select className="border border-gray-400 px-2 py-2 w-full bg-transparent dark:text-white">
            <option></option>
        </select>
        <button className="bg-lime-500 text-white px-4 py-2 text-sm font-medium hover:bg-lime-600">Add new</button>
      </div>

      <div className="mt-6">
        <button className="bg-lime-500 text-white px-6 py-2 text-sm font-medium hover:bg-lime-600 w-[200px]">
            New Property (Optional)
        </button>
      </div>
    </div>
  );
};
