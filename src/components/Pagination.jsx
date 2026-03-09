import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, setCurrentPage }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  /**
   * 🧠 PAGINATION WINDOW LOGIC
   * Generates an array like [1, '...', 4, 5, 6, '...', 312]
   */
  const getPages = () => {
    const pages = [];
    const range = 1; // How many pages to show on each side of the active page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i);
      } else if (i === currentPage - range - 1 || i === currentPage + range + 1) {
        // Only push '...' if it's not already there
        if (pages[pages.length - 1] !== '...') pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-10 py-6 bg-white rounded-[3rem] border border-gray-100 shadow-sm mt-12 mb-10 overflow-hidden">
      
      {/* 1. Left Section: Stats */}
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          Showing <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-slate-800">{totalItems}</span>
        </p>
      </div>

      {/* 2. Middle Section: Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-3 text-slate-400 hover:text-orange-500 disabled:opacity-20 transition-all cursor-pointer active:scale-90"
        >
          <ChevronLeft size={20} strokeWidth={3} />
        </button>

        <div className="flex items-center gap-1">
          {getPages().map((page, idx) => (
            page === '...' ? (
              <span key={`dots-${idx}`} className="px-2 text-slate-300">
                <MoreHorizontal size={16} />
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  currentPage === page 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-100 scale-110' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-3 text-slate-400 hover:text-orange-500 disabled:opacity-20 transition-all cursor-pointer active:scale-90"
        >
          <ChevronRight size={20} strokeWidth={3} />
        </button>
      </div>
      
      {/* 3. Right Section: Branding */}
      <div className="flex-1 text-right text-[9px] font-black text-slate-200 uppercase italic tracking-widest select-none">
        GrowPath ERP v2.0
      </div>
    </div>
  );
};

export default Pagination;