import React from 'react';
import { Settings, HelpCircle, ShoppingCart } from 'lucide-react';
import logoImg from '../assets/logo.jpg'; 

const Sidebar = ({ onSalesClick }) => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-6 flex flex-col justify-between shadow-sm sticky top-0">
      
      <div>
        {/* Logo Section - Centered */}
        <div className="flex flex-col items-center justify-center gap-2 mb-12 text-center">
          <img 
            src={logoImg} 
            alt="Logo" 
            className="w-24 h-auto object-contain mb-2" 
          />
          <h1 className="text-2xl font-extrabold text-blue-800 tracking-tight">
            Grow<span className="text-orange-500 italic">Path</span>
          </h1>
        </div>

        {/* Navigation Section */}
        <nav>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
            Main Menu
          </p>
          
          {/* SALES ORDER BUTTON - Now with Orange Hover */}
          <button 
            onClick={onSalesClick}
            className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 bg-blue-50 text-blue-700 border border-blue-100 hover:bg-orange-500 hover:text-white hover:border-orange-600 hover:shadow-lg"
          >
            <ShoppingCart 
              size={20} 
              className="text-blue-600 group-hover:text-white transition-colors duration-300" 
            />
            <span>Sales Orders</span>
          </button>
        </nav>
      </div>

      {/* Bottom Section - Settings & Support Restored */}
      <div className="space-y-2 border-t border-gray-100 pt-6">
        
        {/* Settings with Spinning Gear Hover */}
        <button className="group w-full flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all font-medium">
          <Settings 
            size={18} 
            className="group-hover:rotate-90 transition-transform duration-500" 
          />
          <span>Settings</span>
        </button>

        {/* Help & Support */}
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all font-medium">
          <HelpCircle size={18} />
          <span>Help & Support</span>
        </button>
        

      </div>
      
    </aside>
  );
};

export default Sidebar;