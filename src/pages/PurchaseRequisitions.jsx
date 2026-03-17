import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Loader2, ClipboardList, ChevronLeft, 
  ChevronRight, FileText, Check, X, ArrowRight, Building2, MapPin
} from 'lucide-react';

const PurchaseRequisitions = ({ 
  requisitions = [], 
  loading, 
  createRequisition, 
  searchTerm, 
  setSearchTerm, 
  currentPage, 
  setCurrentPage, 
  totalItems = 0, 
  itemsPerPage = 8 
}) => {
  const navigate = useNavigate();
  
  // Modals & Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReqName, setNewReqName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Safety check for pagination logic
  const safeRequisitions = Array.isArray(requisitions) ? requisitions : [];
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateHeader = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await createRequisition({ name: newReqName });
    if (success) {
      setNewReqName('');
      setShowCreateModal(false);
      showToast('Requisition created successfully!');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen relative overflow-hidden font-sans">
      
      {/* --- SUCCESS TOAST --- */}
      <div className={`fixed bottom-10 right-10 z-[300] transition-all duration-500 transform ${toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-200/50 flex items-center gap-4 font-black">
          <div className="bg-emerald-600 p-2 rounded-full"><Check size={20} /></div>
          {toastMessage}
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            Purchase Requisitions
          </h1>
          <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-[0.2em]">Procurement Management System</p>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[1.8rem] font-black shadow-xl shadow-blue-100 flex items-center gap-3 transition-all active:scale-95 group"
        >
          <div className="bg-blue-500 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
            <Plus size={18} strokeWidth={3} />
          </div>
          <span>Create Request</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
          <Search size={24} />
        </div>
        <input 
          type="text"
          placeholder="Search by ID or Name..."
          className="w-full pl-16 pr-6 py-6 bg-white border-2 border-transparent rounded-[2rem] shadow-sm focus:border-blue-600 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-200 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <Loader2 className="animate-spin text-blue-600" size={48} strokeWidth={3} />
            <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse"></div>
          </div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing with Dynamics 365</p>
        </div>
      ) : safeRequisitions.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm animate-in fade-in duration-1000">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="text-slate-200" size={40} />
          </div>
          <p className="text-slate-400 font-black text-xl tracking-tight">No requisitions found</p>
          <button onClick={() => setSearchTerm('')} className="text-blue-600 font-black text-sm mt-4 hover:underline">Clear all filters</button>
        </div>
      ) : (
        <>
          {/* Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {safeRequisitions.map((req, index) => {
              const reqId = req.PurchaseRequisitionNumber || req.RequisitionNumber || req.RequisitionId || "N/A";
              return (
                <div 
                  key={reqId + index}
                  onClick={() => navigate(`/purchase-requisitions/${reqId}`)}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-blue-200/30 hover:-translate-y-2 transition-all group cursor-pointer flex flex-col h-[300px] relative overflow-hidden"
                >
                  {/* Decorative Icon Background */}
                  <div className="absolute -right-4 -top-4 text-slate-50 group-hover:text-blue-50 transition-colors pointer-events-none">
                    <FileText size={140} strokeWidth={0.5} />
                  </div>

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <Building2 size={24} strokeWidth={2.5} />
                    </div>
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-full tracking-widest ${
                      req.RequisitionStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {req.RequisitionStatus || 'Draft'}
                    </span>
                  </div>
                  
                  <div className="relative z-10 mb-4">
                    <h3 className="text-xl font-black text-slate-800 mb-1 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {req.RequisitionName || "Unnamed Request"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MapPin size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{req.BuyingLegalEntityId || 'USMF'} Context</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Header ID</span>
                      <span className="text-sm font-black text-slate-900 tracking-tight">{reqId}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <ArrowRight size={18} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Logic */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm active:scale-90 cursor-pointer"
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Navigation</span>
                <span className="font-black text-slate-900 text-lg">
                  {currentPage} <span className="text-slate-300 mx-2">/</span> {totalPages}
                </span>
              </div>
              
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm active:scale-90 cursor-pointer"
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
            </div>
          )}
        </>
      )}

      {/* --- CREATE MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-3 bg-blue-600"></div>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">New Request</h2>
                <p className="text-slate-400 font-bold mt-2">Initialize a procurement requisition.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-slate-900 transition-colors cursor-pointer">
                <X size={32} />
              </button>
            </div>
            
            <form onSubmit={handleCreateHeader}>
              <div className="mb-12">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 ml-2">Request Description</label>
                <input 
                  autoFocus required type="text"
                  placeholder="e.g. IT Equipment 2026"
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent rounded-[2rem] focus:border-blue-600 focus:bg-white outline-none transition-all font-black text-slate-800 text-xl shadow-inner"
                  value={newReqName}
                  onChange={(e) => setNewReqName(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-6 font-black text-slate-400 hover:text-slate-600 text-lg transition-colors cursor-pointer">Discard</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !newReqName} 
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-black transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 text-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Create Header'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequisitions;