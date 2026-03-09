import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Plus, ArrowLeft, Loader2, ChevronDown, Lock } from 'lucide-react';

const OrderDetailsPage = ({ orders, lines, products, linesLoading, fetchOrderLines, createOrderLine }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLine, setNewLine] = useState({ itemNumber: '', quantity: 1 });

  const order = orders.find(o => o.id === id);

  useEffect(() => { 
    if (id && fetchOrderLines) fetchOrderLines(id); 
  }, [id, fetchOrderLines]);

  const handleAddLine = async (e) => {
    e.preventDefault();
    if (!newLine.itemNumber) return;
    setIsSubmitting(true);
    const success = await createOrderLine(id, newLine);
    if (success) {
      setIsModalOpen(false);
      setNewLine({ itemNumber: '', quantity: 1 });
    }
    setIsSubmitting(false);
  };

  if (!order) return <div className="p-20 text-center font-black text-slate-400 italic">Syncing with D365...</div>;

  // Locks the form if the order is already invoiced in Dynamics
  const isLocked = order.status && (
    order.status.toLowerCase().includes('invoice') || 
    order.status.toLowerCase().includes('cancel')
  );

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- ACTION BAR --- */}
      <div className="flex justify-between items-center mb-10">
        <button 
          onClick={() => navigate('/')} 
          className="group flex items-center gap-4 text-slate-400 font-bold hover:text-blue-600 transition-all"
        >
          <div className="w-10 h-10 border-2 border-slate-100 rounded-full flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
            <ArrowLeft size={16} />
          </div>
          Back to Sales Orders
        </button>
        
        {isLocked ? (
          <div className="bg-slate-100 text-slate-400 px-8 py-3.5 rounded-[1.5rem] font-black flex items-center gap-2 cursor-not-allowed select-none" title="Invoiced orders cannot be modified">
            <Lock size={18} /> Locked ({order.status})
          </div>
        ) : (
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 text-white px-8 py-3.5 rounded-[1.5rem] font-black shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={18} strokeWidth={3} /> Add Line Item
          </button>
        )}
      </div>

      {/* --- HEADER CARD --- */}
      <div className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-sm mb-12 relative overflow-hidden">
        {/* Giant ERP Watermark */}
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[14rem] font-black text-slate-50 tracking-tighter select-none pointer-events-none z-0">
          ERP
        </div>
        
        <div className="relative z-10">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Header Information</p>
          <h1 className="text-7xl font-black text-slate-800 tracking-tighter mb-10">{order.id}</h1>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <Stat label="Customer Account" value={order.customerAccount} />
            <Stat label="Customer Name" value={order.customerName} />
            <Stat label="Invoice Account" value={order.invoiceAccount || order.customerAccount} />
            <Stat label="Status" value={order.status} isStatus isLocked={isLocked} />
          </div>
        </div>
      </div>

      {/* --- LINES TABLE SECTION --- */}
      <div className="mb-6 px-4 flex justify-between items-end">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Order Line Items</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Linked Records: {lines.length}</p>
      </div>

      <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-50 shadow-sm">
        {linesLoading ? (
          <div className="p-24 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-50">
              <tr>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Item ID</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Description</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Quantity</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Unit Price</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lines.length > 0 ? lines.map((line, i) => {
                const qty = line.OrderedSalesQuantity || 0;
                const price = line.SalesPrice || 0;
                const netAmount = qty * price;

                return (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-10 py-8 font-black text-slate-800">{line.ItemNumber}</td>
                    <td className="px-10 py-8 text-slate-500 font-medium">{line.LineDescription || "No Description"}</td>
                    <td className="px-10 py-8 font-black text-slate-800">
                      {qty} <span className="text-xs font-bold text-slate-400 ml-1">ea</span>
                    </td>
                    <td className="px-10 py-8 font-black text-slate-800">${price.toLocaleString()}</td>
                    <td className="px-10 py-8 text-right font-black text-blue-600 text-lg">
                      ${netAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="py-24 text-center font-bold text-slate-300 italic">No lines found for this order.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- ADD LINE MODAL --- */}
      {isModalOpen && !isLocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/40 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-12 animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
              <Package className="text-blue-600" /> New Sales Line
            </h2>
            <form onSubmit={handleAddLine} className="space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-2">Product</label>
                <div className="relative">
                  <select 
                    required value={newLine.itemNumber}
                    onChange={(e) => setNewLine({...newLine, itemNumber: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] p-4 font-bold text-slate-700 appearance-none focus:border-blue-600 outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select Item ID...</option>
                    {products.map((p) => (
                      <option key={p.ItemNumber} value={p.ItemNumber}>{p.ItemNumber} - {p.ProductName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-2">Quantity</label>
                <input type="number" min="1" required className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] p-4 font-bold text-slate-700 focus:border-blue-600 outline-none" value={newLine.quantity} onChange={(e) => setNewLine({...newLine, quantity: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-blue-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-blue-200 disabled:opacity-50 transition-all active:scale-95">
                  {isSubmitting ? 'Pushing...' : 'Confirm Line'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value, isStatus, isLocked }) => (
  <div className="z-10 relative">
    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">{label}</p>
    {isStatus ? (
      <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${
        isLocked ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'
      }`}>
        {value}
      </span>
    ) : (
      <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
    )}
  </div>
);

export default OrderDetailsPage;