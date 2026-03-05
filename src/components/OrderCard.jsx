import React from 'react';

const OrderCard = ({ order }) => {
  return (
    <div className="group relative bg-white rounded-[2.5rem] p-9 shadow-sm border border-gray-50 
                    hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-blue-100 
                    transition-all duration-500 ease-out hover:-translate-y-2">
      
      {/* 1. HEADER: Increased spacing between ID and Badges */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter group-hover:text-blue-600 transition-colors">
          {order.id}
        </h2>
        
        <div className="flex gap-2">
          {order.status.map((tag) => (
            tag !== "None" && (
              <span 
                key={tag}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${
                  tag === 'Backorder' ? 'bg-[#FF8A00]' : 'bg-[#0052FF]'
                }`}
              >
                {tag}
              </span>
            )
          ))}
        </div>
      </div>

      {/* 2. DATA GRID: Improved scanning hierarchy */}
      <div className="grid grid-cols-2 gap-y-8 gap-x-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Account</p>
          <p className="text-md font-bold text-slate-800">{order.customerAccount}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Name</p>
          <p className="text-md font-bold text-slate-800">{order.customerName}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Type</p>
          <p className="text-md font-bold text-slate-800">{order.orderType}</p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Account</p>
          <p className="text-md font-bold text-slate-800">{order.invoiceAccount}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;