import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/order/${order.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-[3rem] p-8 border border-gray-100 hover:shadow-2xl hover:shadow-orange-900/5 transition-all cursor-pointer active:scale-[0.98] flex flex-col justify-between relative overflow-hidden h-full"
    >
      {/* 🚀 FIXED HOVER ARROW: Smaller (w-8 h-8) and positioned lower (top-8 right-2) */}
      <div className="absolute top-8 right-2 p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 scale-50 group-hover:scale-100">
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-black shadow-lg shadow-orange-100 text-sm">
          →
        </div>
      </div>

      <div>
        {/* Header: Order ID & Status Badge */}
        <div className="flex justify-between items-start mb-8 pr-12"> 
          {/* Pr-12 creates space for the arrow so it doesn't overlap text when hovering */}
          <div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Sales Order</span>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter group-hover:text-blue-900 transition-colors">
              {order.id}
            </h3>
          </div>
          
          {/* Status Badge - Blue to match your sidebar standard */}
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-tighter border border-blue-100 flex-shrink-0 ml-4">
            {order.status}
          </span>
        </div>

        {/* Body: Customer Information */}
        <div className="space-y-5">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Account</p>
            <p className="font-black text-slate-700">{order.customerAccount}</p>
          </div>
          
          <div className="px-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Name</p>
            <p className="font-bold text-slate-800 truncate">{order.customerName}</p>
          </div>
        </div>
      </div>

      {/* Footer: Metadata */}
      <div className="mt-8 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Order Type</p>
          <p className="text-xs font-bold text-slate-500">{order.orderType}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Invoice Account</p>
          <p className="text-xs font-bold text-slate-500 truncate">{order.invoiceAccount}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;