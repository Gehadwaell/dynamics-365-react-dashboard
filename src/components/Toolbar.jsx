import React from 'react';
import { Search, Plus } from 'lucide-react';

const Toolbar = ({ searchTerm, setSearchTerm, onNewOrder }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
      
      {/* 1. THE HEADER & SEARCH COMBO */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1">
        {/* Page Title */}
        <h1 className="text-3xl font-black text-gray-900 tracking-tight whitespace-nowrap">
          Sales Orders
        </h1>

        {/* Improved Search Box */}
        <div className="relative w-full max-w-lg group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors duration-300">
            <Search size={18} className="text-gray-400 group-focus-within:text-blue-600" />
          </div>
          <input
            type="text"
            placeholder="Search Orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-2xl 
                       focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block p-4 pl-12 
                       shadow-sm hover:border-gray-300 transition-all duration-300 outline-none
                       placeholder:text-gray-400 font-medium"
          />

        </div>
      </div>

      {/* 2. THE ACTION BUTTON */}
      <button 
        onClick={onNewOrder}
        className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg 
                   shadow-blue-500/20 px-8 py-4 h-auto rounded-2xl flex items-center gap-3 
                   transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 
                   active:scale-95 group"
      >
        <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="font-bold tracking-wide">New Order</span>
      </button>

    </div>
  );
};

export default Toolbar;