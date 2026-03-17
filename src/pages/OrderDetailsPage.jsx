import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Plus, ArrowLeft, Loader2, Lock } from 'lucide-react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async'; 
import toast from 'react-hot-toast'; // <--- ADDED TOAST IMPORT

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: state.isDisabled ? '#f1f5f9' : '#f8fafc',
    borderColor: state.isFocused ? '#2563eb' : 'transparent',
    borderWidth: '2px',
    borderRadius: '1.2rem',
    padding: '0.3rem',
    boxShadow: 'none',
    fontWeight: '700',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    opacity: state.isDisabled ? 0.6 : 1,
    '&:hover': { borderColor: state.isDisabled ? 'transparent' : (state.isFocused ? '#2563eb' : '#e2e8f0') }
  }),
  menu: (base) => ({ ...base, borderRadius: '1rem', overflow: 'hidden', zIndex: 50 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#334155',
    fontWeight: '600',
    cursor: 'pointer'
  })
};

const OrderDetailsPage = ({ orders, lines, sites, warehouses, linesLoading, fetchOrderLines, createOrderLine, searchProducts, getProductVariants }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔥 New state to hold the valid variants dynamically
  const [availableVariants, setAvailableVariants] = useState([]);
  const [isVariantsLoading, setIsVariantsLoading] = useState(false);

  const [newLine, setNewLine] = useState({ 
    itemNumber: '', subtype: '', quantity: 1, price: '', siteId: '', warehouseId: '', colorId: '', sizeId: '', styleId: '' 
  });

  const order = orders.find(o => o.id === id);

  useEffect(() => { 
    if (id && fetchOrderLines) fetchOrderLines(id); 
  }, [id, fetchOrderLines]);

  const handleAddLine = async (e) => {
    e.preventDefault();
    if (!newLine.itemNumber) {
      toast.error('Please select a product.'); // <--- ADDED TOAST ERROR
      return;
    }
    setIsSubmitting(true);
    const success = await createOrderLine(id, newLine);
    if (success) {
      setIsModalOpen(false);
      setNewLine({ itemNumber: '', subtype: '', quantity: 1, price: '', siteId: '', warehouseId: '', colorId: '', sizeId: '', styleId: '' });
      setAvailableVariants([]);
    }
    setIsSubmitting(false);
  };

  const availableWarehouses = (warehouses || []).filter(w => w.OperationalSiteId === newLine.siteId);

  // 🔥 Dynamically build unique options based on D365 variants
  const colorOptions = [...new Set(availableVariants.map(v => v.ProductColorId).filter(Boolean))].map(c => ({ value: c, label: c }));
  const sizeOptions = [...new Set(availableVariants.map(v => v.ProductSizeId).filter(Boolean))].map(s => ({ value: s, label: s }));
  const styleOptions = [...new Set(availableVariants.map(v => v.ProductStyleId).filter(Boolean))].map(st => ({ value: st, label: st }));

  if (!order) return <div className="p-20 text-center font-black text-slate-400 italic">Syncing with D365...</div>;

  const isLocked = order.status && (order.status.toLowerCase().includes('invoice') || order.status.toLowerCase().includes('cancel'));
  const siteOptions = (sites || []).map(s => ({ value: s.SiteId, label: `${s.SiteId} - ${s.SiteName}` }));
  const warehouseOptions = availableWarehouses.map(w => ({ value: w.WarehouseId, label: `${w.WarehouseId} - ${w.WarehouseName}` }));

  return (
    <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ... [KEEP ALL YOUR EXISTING HEADER & TABLE HTML HERE] ... */}
      <div className="flex justify-between items-center mb-10">
        <button onClick={() => navigate('/')} className="group flex items-center gap-4 text-slate-400 font-bold hover:text-blue-600 transition-all">
          <div className="w-10 h-10 border-2 border-slate-100 rounded-full flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
            <ArrowLeft size={16} />
          </div>
          Back to Sales Orders
        </button>
        {isLocked ? (
          <div className="bg-slate-100 text-slate-400 px-8 py-3.5 rounded-[1.5rem] font-black flex items-center gap-2 cursor-not-allowed select-none">
            <Lock size={18} /> Locked ({order.status})
          </div>
        ) : (
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-3.5 rounded-[1.5rem] font-black shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2 hover:bg-blue-700">
            <Plus size={18} strokeWidth={3} /> Add Line Item
          </button>
        )}
      </div>

      <div className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-sm mb-12 relative overflow-hidden">
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[14rem] font-black text-slate-50 tracking-tighter select-none pointer-events-none z-0">ERP</div>
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

      <div className="mb-6 px-4 flex justify-between items-end">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Order Line Items</h2>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Linked Records: {lines.length}</p>
      </div>

      <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-50 shadow-sm">
        {linesLoading ? (
          <div className="p-24 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white border-b border-slate-50">
                <tr>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Item ID</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Description</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Color/Size/Style</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Site / WH</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Qty</th>
                  <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {lines.length > 0 ? lines.map((line, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-8 font-black text-slate-800">{line.ItemNumber}</td>
                    <td className="px-8 py-8 text-slate-500 font-medium">{line.LineDescription || "---"}</td>
                    <td className="px-8 py-8 text-slate-500 text-sm font-medium">{line.ProductColorId || '-'} / {line.ProductSizeId || '-'} / {line.ProductStyleId || '-'}</td>
                    <td className="px-8 py-8 font-bold text-slate-700">{line.ShippingSiteId || 'Auto'} / {line.ShippingWarehouseId || 'Auto'}</td>
                    <td className="px-8 py-8 font-black text-slate-800">{line.OrderedSalesQuantity}</td>
                    <td className="px-8 py-8 font-black text-slate-800">${(line.SalesPrice || 0).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="py-24 text-center font-bold text-slate-300 italic">No lines found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && !isLocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/40 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
              <Package className="text-blue-600" /> New Sales Line
            </h2>
            
            <form onSubmit={handleAddLine} className="space-y-6">
              
  <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-2">Product *</label>
                <AsyncSelect 
                  loadOptions={searchProducts}
                  defaultOptions={true} 
                  cacheOptions // <--- 🔥 ADD THIS PROPERTY
                  styles={selectStyles}
                  placeholder="Type to search D365..."
                  isClearable
                  onChange={async (selected) => {
                    const item = selected ? selected.value : '';
                    const stype = selected ? selected.subtype : '';
                    setNewLine({ ...newLine, itemNumber: item, subtype: stype, colorId: '', sizeId: '', styleId: '' });
                    
                    if (stype && stype.toLowerCase().includes('master')) {
                      setIsVariantsLoading(true);
                      const variants = await getProductVariants(item);
                      setAvailableVariants(variants);
                      setIsVariantsLoading(false);
                    } else {
                      setAvailableVariants([]);
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-2">Site</label>
                  <Select 
                    options={siteOptions} styles={selectStyles} placeholder="Auto / Search..." isClearable isSearchable
                    value={siteOptions.find(s => s.value === newLine.siteId) || null} 
                    onChange={(selected) => setNewLine({...newLine, siteId: selected ? selected.value : '', warehouseId: ''})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-2">Warehouse</label>
                  <Select 
                    options={warehouseOptions} styles={selectStyles} placeholder={newLine.siteId ? "Search..." : "Select Site First"} isDisabled={!newLine.siteId} isClearable isSearchable
                    value={warehouseOptions.find(w => w.value === newLine.warehouseId) || null}
                    onChange={(selected) => setNewLine({...newLine, warehouseId: selected ? selected.value : ''})}
                  />
                </div>
              </div>

              {/* 🔥 SMART PRODUCT DIMENSIONS DROPDOWNS */}
              {(() => {
                const hasDimensions = Boolean(newLine.subtype && newLine.subtype.toLowerCase().includes('master'));

                return (
                  <div className="grid grid-cols-3 gap-4">
                    {/* COLOR */}
                    <div>
                      <label className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-2 ml-2 ${hasDimensions ? 'text-slate-400' : 'text-slate-300'}`}>Color</label>
                      <Select 
                        options={colorOptions} styles={selectStyles}
                        placeholder={hasDimensions ? (isVariantsLoading ? "Loading..." : "Select Color") : "N/A"}
                        isDisabled={!hasDimensions || isVariantsLoading || colorOptions.length === 0}
                        isClearable
                        value={colorOptions.find(c => c.value === newLine.colorId) || null}
                        onChange={(s) => setNewLine({...newLine, colorId: s ? s.value : ''})}
                      />
                    </div>
                    {/* SIZE */}
                    <div>
                      <label className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-2 ml-2 ${hasDimensions ? 'text-slate-400' : 'text-slate-300'}`}>Size</label>
                      <Select 
                        options={sizeOptions} styles={selectStyles}
                        placeholder={hasDimensions ? (isVariantsLoading ? "Loading..." : "Select Size") : "N/A"}
                        isDisabled={!hasDimensions || isVariantsLoading || sizeOptions.length === 0}
                        isClearable
                        value={sizeOptions.find(s => s.value === newLine.sizeId) || null}
                        onChange={(s) => setNewLine({...newLine, sizeId: s ? s.value : ''})}
                      />
                    </div>
                    {/* STYLE */}
                    <div>
                      <label className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-2 ml-2 ${hasDimensions ? 'text-slate-400' : 'text-slate-300'}`}>Style</label>
                      <Select 
                        options={styleOptions} styles={selectStyles}
                        placeholder={hasDimensions ? (isVariantsLoading ? "Loading..." : "Select Style") : "N/A"}
                        isDisabled={!hasDimensions || isVariantsLoading || styleOptions.length === 0}
                        isClearable
                        value={styleOptions.find(st => st.value === newLine.styleId) || null}
                        onChange={(s) => setNewLine({...newLine, styleId: s ? s.value : ''})}
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-2">Quantity *</label>
                  <input type="number" min="1" required className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] p-4 font-bold text-slate-700 focus:border-blue-600 outline-none" value={newLine.quantity} onChange={(e) => setNewLine({...newLine, quantity: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 ml-2">Unit Price</label>
                  <input type="number" step="0.01" min="0" placeholder="Auto-Calculate" className="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] p-4 font-bold text-slate-700 focus:border-blue-600 outline-none placeholder:font-normal placeholder:text-slate-300" value={newLine.price} onChange={(e) => setNewLine({...newLine, price: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting || !newLine.itemNumber} className="flex-[2] bg-blue-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-blue-200 disabled:opacity-50 transition-all active:scale-95">
                  {isSubmitting ? 'Pushing to D365...' : 'Confirm Line'}
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
      <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${isLocked ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{value}</span>
    ) : (
      <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
    )}
  </div>
);

export default OrderDetailsPage;