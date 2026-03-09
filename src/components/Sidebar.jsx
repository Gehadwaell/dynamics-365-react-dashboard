import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, HelpCircle, ShoppingCart } from 'lucide-react';
import logoImg from '../assets/logo.jpg'; 

const Sidebar = ({ onSalesClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSalesClick = () => {
    if (onSalesClick) onSalesClick();
    navigate('/');
  };

  // 🔥 EXCLUSIVE ACTIVE LOGIC: Only orange on the main list page
  const isHomeActive = location.pathname === '/';

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 p-6 flex flex-col justify-between shadow-sm sticky top-0 z-50">
      <div>
        {/* Logo Section */}
        <div 
          onClick={handleSalesClick} 
          className="flex flex-col items-center justify-center gap-2 mb-12 text-center cursor-pointer group"
        >
          <img 
            src={logoImg} 
            alt="Logo" 
            className="w-20 h-auto object-contain mb-1 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" 
          />
          <h1 className="text-2xl font-extrabold text-blue-800 tracking-tight transition-colors group-hover:text-blue-900">
            Grow<span className="text-orange-500 italic">Path</span>
          </h1>
          <div className="h-0.5 w-0 bg-orange-500 rounded-full group-hover:w-20 transition-all duration-500"></div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-2">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4 px-4 select-none">
            Main Menu
          </p>
          
          {/* SALES ORDER BUTTON 
              Active: Orange (Only on Home)
              Inactive: Blue Hover Effect
          */}
          <button 
            onClick={handleSalesClick}
            className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 border cursor-pointer active:scale-95 overflow-hidden relative ${
              isHomeActive 
                ? 'bg-orange-500 text-white border-orange-600 shadow-xl shadow-orange-100 translate-x-1' 
                : 'bg-transparent text-gray-400 border-transparent hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 hover:translate-x-1'
            }`}
          >
            {/* Icon Container with specific animations */}
            <div className={`p-2 rounded-lg transition-all duration-300 ${
              isHomeActive ? 'bg-orange-400' : 'bg-gray-50 group-hover:bg-blue-100 group-hover:rotate-12'
            }`}>
              <ShoppingCart 
                size={18} 
                className={`transition-colors duration-300 ${
                  isHomeActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'
                }`} 
              />
            </div>
            
            <span className="tracking-tight relative z-10">Sales Orders</span>
            
            {/* Subtle light effect on hover for non-active state */}
            {!isHomeActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-1 border-t border-gray-100 pt-6">
        <button className="group w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all font-bold text-sm cursor-pointer">
          <Settings size={18} className="group-hover:rotate-180 transition-transform duration-1000" />
          <span>Settings</span>
        </button>
        <button className="group w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-slate-50 hover:text-slate-900 rounded-2xl transition-all font-bold text-sm cursor-pointer">
          <HelpCircle size={18} />
          <span>Help & Support</span>
        </button>

        {/* User Card */}
        {/* <div className="mt-4 p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
           <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-[10px] font-black text-white shadow-sm">GW</div>
           <div>
              <p className="text-[11px] font-black text-slate-800 leading-none">Gehad Wael</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">BIS Administrator</p>
           </div>
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;