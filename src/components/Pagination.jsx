import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, setCurrentPage }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    /* We changed 'justify-between' to 'justify-center' to put the buttons in the middle */
    <div className="flex items-center justify-center gap-4 mt-12 px-10 py-6 bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
      
      <div className="flex items-center gap-3">
        {/* Previous Button */}
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-3 rounded-xl border border-gray-50 text-slate-300 hover:bg-gray-50 disabled:opacity-20 transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Current Page Number - Using your Blue theme */}
        <div className="bg-[#0052FF] text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-blue-100">
          {currentPage}
        </div>

        {/* Next Button */}
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-3 rounded-xl border border-gray-50 text-slate-300 hover:bg-gray-50 disabled:opacity-20 transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
    </div>
  );
};

export default Pagination;