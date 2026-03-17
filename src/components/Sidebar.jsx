import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, HelpCircle, ShoppingCart, Menu, X, ClipboardList, FileText } from 'lucide-react'; 
import logoImg from '../assets/logo.jpg'; 

const Sidebar = ({ onSalesClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSalesClick = () => {
    if (onSalesClick) onSalesClick();
    navigate('/');
    setIsOpen(false); 
  };

  const handlePurchaseReqClick = () => {
    navigate('/purchase-requisitions');
    setIsOpen(false);
  };

  // ADDED: Navigation handler for Purchase Orders
  const handlePurchaseOrderClick = () => {
    navigate('/purchase-orders');
    setIsOpen(false);
  };

  const isHomeActive = location.pathname === '/';
  const isPurchaseReqActive = location.pathname.includes('/purchase-requisitions');
  const isPurchaseOrderActive = location.pathname.includes('/purchase-orders');

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-5 z-[70] p-2.5 bg-white border border-gray-100 rounded-xl shadow-lg text-blue-800 transition-transform active:scale-90 cursor-pointer"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-[65]
        w-64 h-screen bg-white border-r border-gray-100 p-6 flex flex-col shadow-sm
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="flex-1 overflow-y-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          <div 
            onClick={handleSalesClick} 
            className="flex flex-col items-center justify-center gap-2 mb-12 text-center cursor-pointer group"
          >
            <img 
              src={logoImg} 
              alt="Logo" 
              className="w-16 h-auto object-contain mb-1 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" 
            />
            <h1 className="text-xl font-extrabold text-blue-800 tracking-tight transition-colors group-hover:text-blue-900">
              Grow<span className="text-orange-500 italic">Path</span>
            </h1>
            <div className="h-0.5 w-0 bg-orange-500 rounded-full group-hover:w-20 transition-all duration-500"></div>
          </div>

          <nav className="space-y-3">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 px-2 select-none">
              Main Menu
            </p>
            
            {/* Sales Orders */}
            <button 
              onClick={handleSalesClick}
              className={`group w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-2xl font-bold transition-all duration-300 border cursor-pointer active:scale-95 overflow-hidden relative ${
                isHomeActive 
                  ? 'bg-orange-500 text-white border-orange-600 shadow-xl shadow-orange-100' 
                  : 'bg-transparent text-gray-400 border-transparent hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100'
              }`}
            >
              <div className={`shrink-0 flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                isHomeActive ? 'bg-orange-400' : 'bg-gray-50 group-hover:bg-blue-100 group-hover:rotate-12'
              }`}>
                <ShoppingCart size={18} className={isHomeActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} />
              </div>
              <span className="tracking-tight relative z-10 text-sm whitespace-nowrap">Sales Orders</span>
            </button>

            {/* Purchase Requisitions */}
            <button 
              onClick={handlePurchaseReqClick}
              className={`group w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-2xl font-bold transition-all duration-300 border cursor-pointer active:scale-95 overflow-hidden relative ${
                isPurchaseReqActive 
                  ? 'bg-orange-500 text-white border-orange-600 shadow-xl shadow-orange-100' 
                  : 'bg-transparent text-gray-400 border-transparent hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100'
              }`}
            >
              <div className={`shrink-0 flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                isPurchaseReqActive ? 'bg-orange-400' : 'bg-gray-50 group-hover:bg-blue-100 group-hover:rotate-12'
              }`}>
                <ClipboardList size={18} className={isPurchaseReqActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} />
              </div>
              <span className="tracking-tight relative z-10 text-sm whitespace-nowrap">Purchase Requisitions</span>
            </button>

            {/* ADDED: Purchase Orders */}
            <button 
              onClick={handlePurchaseOrderClick}
              className={`group w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-2xl font-bold transition-all duration-300 border cursor-pointer active:scale-95 overflow-hidden relative ${
                isPurchaseOrderActive 
                  ? 'bg-orange-500 text-white border-orange-600 shadow-xl shadow-orange-100' 
                  : 'bg-transparent text-gray-400 border-transparent hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100'
              }`}
            >
              <div className={`shrink-0 flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                isPurchaseOrderActive ? 'bg-orange-400' : 'bg-gray-50 group-hover:bg-blue-100 group-hover:rotate-12'
              }`}>
                <FileText size={18} className={isPurchaseOrderActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} />
              </div>
              <span className="tracking-tight relative z-10 text-sm whitespace-nowrap">Purchase Orders</span>
            </button>

          </nav>
        </div>

        <div className="space-y-1 border-t border-gray-100 pt-6 mt-auto">
          <button className="group w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-bold text-xs cursor-pointer">
            <Settings size={16} className="group-hover:rotate-180 transition-transform duration-1000" />
            <span>Settings</span>
          </button>
          <button className="group w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-bold text-xs cursor-pointer">
            <HelpCircle size={16} />
            <span>Help & Support</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;