import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Plus, ChevronLeft, ChevronRight, X, Building2, ArrowRight } from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#f8fafc',
    borderRadius: '1rem',
    padding: '0.4rem',
    fontWeight: '700',
    border: 'none',
    boxShadow: 'none'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#334155',
    fontWeight: '600',
    cursor: 'pointer'
  }),
};

const PurchaseOrdersPage = ({
  orders,
  totalItems,
  vendors,
  currencies,
  createOrder,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  itemsPerPage
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newOrder, setNewOrder] = useState({
    vendorAccount: '',
    currencyCode: 'USD'
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!newOrder.vendorAccount) {
      toast.error("Please select a vendor.");
      return;
    }
    
    setIsSubmitting(true);
    const result = await createOrder(newOrder);
    setIsSubmitting(false);

    if (result) {
      setIsModalOpen(false);
      setNewOrder({ vendorAccount: '', currencyCode: 'USD' });
    }
  };

  const vendorOptions = (vendors || []).map(v => ({
    value: v.VendorAccountNumber,
    label: `${v.VendorAccountNumber} - ${v.VendorOrganizationName || 'Unknown Vendor'}`
  }));

  const currencyOptions = (currencies || []).map(c => ({
    value: c.CurrencyCode,
    label: c.CurrencyCode
  }));

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2 flex items-center gap-3">
            <FileText className="text-blue-600" size={36} />
            Purchase Orders
          </h1>
          <p className="text-slate-400 font-bold">Manage and track your vendor purchase orders.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-[1.2rem] font-black shadow-lg shadow-blue-600/20 flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={18} /> New PO
        </button>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-50 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search PO Number, Vendor Name, or Account..." 
            className="w-full bg-slate-50 rounded-[1.5rem] py-4 pl-14 pr-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-50 shadow-sm">
          <p className="text-slate-300 font-bold italic">No purchase orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {orders.map((po) => (
            <div 
              key={po.id} 
              onClick={() => navigate(`/purchase-orders/${po.id}`)}
              className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-100 group-hover:bg-blue-600 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">PO Number</p>
                  <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{po.id}</h3>
                </div>
                <div className="bg-blue-50 text-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
              </div>

              <div className="mb-6 flex-1">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Building2 size={12} /> Vendor
                </p>
                <p className="font-bold text-slate-600 line-clamp-2">{po.vendorName}</p>
                <p className="text-xs font-bold text-slate-400 mt-1">{po.vendorAccount}</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="bg-slate-50 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-slate-100 uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                  {po.status || 'Draft'}
                </span>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {totalItems > itemsPerPage && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">
            Showing {orders.length} of {totalItems}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl bg-white text-slate-400 shadow-sm hover:text-blue-600 hover:shadow-md disabled:opacity-40 disabled:hover:shadow-sm disabled:hover:text-slate-400 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl bg-white text-slate-400 shadow-sm hover:text-blue-600 hover:shadow-md disabled:opacity-40 disabled:hover:shadow-sm disabled:hover:text-slate-400 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200 relative">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black text-slate-800 mb-2">New Purchase Order</h2>
            <p className="text-sm font-bold text-slate-400 mb-8">Initialize a new PO by selecting a vendor.</p>
            
            <form onSubmit={handleCreatePO} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                  Vendor *
                </label>
                <Select 
                  options={vendorOptions} 
                  styles={selectStyles} 
                  placeholder="Search and select vendor..." 
                  isSearchable
                  value={vendorOptions.find(v => v.value === newOrder.vendorAccount) || null}
                  onChange={v => setNewOrder({...newOrder, vendorAccount: v ? v.value : ''})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                  Currency
                </label>
                <Select 
                  options={currencyOptions} 
                  styles={selectStyles} 
                  value={currencyOptions.find(c => c.value === newOrder.currencyCode) || null}
                  onChange={c => setNewOrder({...newOrder, currencyCode: c ? c.value : 'USD'})} 
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newOrder.vendorAccount} 
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-[1rem] font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Initializing...' : 'Create Order'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersPage;