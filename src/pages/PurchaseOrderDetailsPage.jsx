import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Plus, ArrowLeft, Loader2, Building2, Trash2 } from 'lucide-react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import toast from 'react-hot-toast';

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: state.isDisabled ? '#f1f5f9' : '#f8fafc',
    borderRadius: '1rem', padding: '0.4rem', fontWeight: '700',
    border: 'none', boxShadow: 'none', opacity: state.isDisabled ? 0.6 : 1,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#334155',
    fontWeight: '600', cursor: 'pointer',
  }),
};

const EMPTY_LINE = {
  itemNumber: '', quantity: 1, price: '',
  siteId: '', warehouseId: '', colorId: '', sizeId: '', styleId: '',
  unitId: 'ea', currencyCode: 'USD',
};

const PurchaseOrderDetailsPage = ({
  allOrders, lines, fetchOrderLines,
  createOrderLine, deleteOrderLine,
  searchProducts, getProductVariants, getItemPrice,
  sites, warehouses, currencies,
}) => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [isModalOpen,       setIsModalOpen]       = useState(false);
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [isFetchingPrice,   setIsFetchingPrice]   = useState(false);
  const [priceFilled,       setPriceFilled]       = useState(false);
  const [availableVariants, setAvailableVariants] = useState([]);
  const [newLine,           setNewLine]           = useState(EMPTY_LINE);
  
  // ADDED: State to control the Delete Confirmation Modal
  const [lineToDelete, setLineToDelete] = useState(null);

  const order = (allOrders || []).find(o => o.PurchaseOrderNumber === id);
  
  const totalValue  = (lines || []).reduce(
    (s, l) => s + ((l.PurchasePrice || 0) * (l.OrderedPurchaseQuantity || 0)), 0
  );

  useEffect(() => { 
    if (id) fetchOrderLines(id); 
  }, [id, fetchOrderLines]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewLine(EMPTY_LINE);
    setAvailableVariants([]);
    setIsFetchingPrice(false);
    setPriceFilled(false);
  };

  const handleProductSelect = async (s) => {
    setAvailableVariants([]);
    setPriceFilled(false);
    setNewLine(prev => ({
      ...prev,
      itemNumber: s?.value || '',
      subtype:    s?.subtype || '',
      price:      '',
    }));

    if (!s?.value) return;

    setIsFetchingPrice(true);
    const price = await getItemPrice(s.value);
    setIsFetchingPrice(false);

    if (price !== null && price > 0) {
      setNewLine(prev => ({ ...prev, price }));
      setPriceFilled(true);
    }

    if (s?.subtype?.toLowerCase().includes('master')) {
      setAvailableVariants(await getProductVariants(s.value));
    }
  };

  const handleAddLine = async (e) => {
    e.preventDefault();
    if (!newLine.itemNumber) {
      toast.error('Please select a catalog item.');
      return;
    }
    setIsSubmitting(true);
    const ok = await createOrderLine(id, newLine);
    if (ok) handleModalClose();
    setIsSubmitting(false);
  };

  const siteOptions = (sites || []).map(s => ({ value: s.SiteId, label: `${s.SiteId} - ${s.SiteName}` }));
  const warehouseOptions = (warehouses || [])
    .filter(w => w.OperationalSiteId === newLine.siteId)
    .map(w => ({ value: w.WarehouseId, label: `${w.WarehouseId} - ${w.WarehouseName || 'Unnamed'}` }));
  const currencyOptions = (currencies || []).map(c => ({ value: c.CurrencyCode, label: c.CurrencyCode }));
  const unitOptions = [
    { value: 'ea', label: 'ea' }, { value: 'Pcs', label: 'Pcs' }, { value: 'Box', label: 'Box' },
  ];
  const colorOptions = [...new Set(availableVariants.map(v => v.ProductColorId).filter(Boolean))].map(c => ({ value: c, label: c }));
  const sizeOptions  = [...new Set(availableVariants.map(v => v.ProductSizeId).filter(Boolean))].map(s => ({ value: s, label: s }));
  const styleOptions = [...new Set(availableVariants.map(v => v.ProductStyleId).filter(Boolean))].map(st => ({ value: st, label: st }));

  const canSubmit    = !isSubmitting && !!newLine.itemNumber;
  const linePreview  = parseFloat(newLine.quantity || 0) * parseFloat(newLine.price || 0);

  if (!order) return (
    <div className="p-20 text-center font-black text-slate-400 italic flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-blue-600" /> Syncing PO...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex justify-between items-center mb-10">
        <button onClick={() => navigate('/purchase-orders')}
          className="flex items-center gap-4 text-slate-400 font-bold hover:text-blue-600">
          <ArrowLeft size={16} /> Back to POs
        </button>
        <button onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-3.5 rounded-[1.2rem] font-black shadow-lg flex items-center gap-2">
          <Plus size={18} /> Add Line
        </button>
      </div>

      <div className="bg-white rounded-[2rem] p-10 border border-slate-50 shadow-sm mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <Stat label="PO Number" value={order.PurchaseOrderNumber} />
          <Stat label="Total Value"  value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} highlight />
          <Stat label="Vendor Name"  value={order.PurchaseOrderName || 'Unknown Vendor'} icon={<Building2 size={14} />} />
          <Stat label="Status"       value={order.PurchaseOrderStatus || 'Draft'} isStatus />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-50 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6">Item</th>
              <th className="px-8 py-6">Receiving Location</th>
              <th className="px-8 py-6">Unit Price</th>
              <th className="px-8 py-6">Qty</th>
              <th className="px-8 py-6">Line Total</th>
              <th className="px-8 py-6 text-center">Del</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {lines.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-slate-300 font-bold italic">
                  No lines yet — click Add PO Line to get started.
                </td>
              </tr>
            )}
            {lines.map((line, i) => {
              const lineTotal = (line.PurchasePrice || 0) * (line.OrderedPurchaseQuantity || 0);
              return (
                <tr key={i} className="hover:bg-blue-50/20">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800">{line.ItemNumber || '—'}</p>
                    <p className="text-[10px] font-bold text-slate-400">
                      {[line.ProductColorId, line.ProductSizeId, line.ProductStyleId].filter(Boolean).join(' / ') || '—'}
                    </p>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-600">
                    {line.ReceivingSiteId || '—'} / {line.ReceivingWarehouseId || '—'}
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-700">
                    ${Number(line.PurchasePrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6 font-black text-slate-800">
                    {line.OrderedPurchaseQuantity}
                    <span className="text-[10px] text-slate-400 font-bold ml-1">ea</span>
                  </td>
                  <td className="px-8 py-6 font-black text-blue-600">
                    ${Number(lineTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6 text-center">
                    {/* ADDED: Opens the Custom Delete Modal instead of instantly deleting */}
                    <button onClick={() => setLineToDelete(line.LineNumber)}
                      className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {lines.length > 0 && (
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan={4} className="px-8 py-5 text-right font-black text-slate-400 text-xs uppercase tracking-widest">
                  Grand Total
                </td>
                <td className="px-8 py-5 font-black text-blue-600 text-lg">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <FileText className="text-blue-600" /> Confirm PO Line
            </h2>

            <form onSubmit={handleAddLine} className="space-y-6">

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Product (Catalog) *
                </label>
<AsyncSelect
                  loadOptions={searchProducts}
                  defaultOptions={true} 
                  styles={selectStyles}
                  placeholder="Search D365 Catalog…"
                  isClearable
                  onChange={handleProductSelect}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Receiving Site</label>
                  <Select options={siteOptions} styles={selectStyles}
                    onChange={s => setNewLine(prev => ({ ...prev, siteId: s?.value || '', warehouseId: '' }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Receiving Warehouse</label>
                  <Select options={warehouseOptions} styles={selectStyles} isDisabled={!newLine.siteId}
                    onChange={w => setNewLine(prev => ({ ...prev, warehouseId: w?.value || '' }))} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Color', opts: colorOptions, key: 'colorId'  },
                  { label: 'Size',  opts: sizeOptions,  key: 'sizeId'   },
                  { label: 'Style', opts: styleOptions, key: 'styleId'  },
                ].map(({ label, opts, key }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">{label}</label>
                    <Select options={opts} styles={selectStyles} placeholder="N/A" isDisabled={!opts.length}
                      onChange={v => setNewLine(prev => ({ ...prev, [key]: v?.value || '' }))} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Quantity *</label>
                  <input type="number" required min="0.001" step="any"
                   className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-300 rounded-[1rem] p-4 font-bold outline-none focus:ring-2 focus:ring-blue-600"
                    value={newLine.quantity}
                    onChange={e => setNewLine(prev => ({ ...prev, quantity: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1">
                    Purchase Price
                    {isFetchingPrice && (
                      <span className="flex items-center gap-1 text-[9px] text-blue-400 font-bold normal-case">
                        <Loader2 size={9} className="animate-spin" /> fetching…
                      </span>
                    )}
                    {!isFetchingPrice && priceFilled && newLine.price && (
                      <span className="text-[9px] text-emerald-500 font-bold normal-case">auto-filled</span>
                    )}
                  </label>
                  <input type="number" step="0.01" min="0"
                    className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-300 rounded-[1rem] p-4 font-bold outline-none focus:ring-2 focus:ring-blue-600"
                    value={newLine.price}
                    placeholder="0.00"
                    onChange={e => { setNewLine(prev => ({ ...prev, price: e.target.value })); setPriceFilled(false); }} />
                </div>
              </div>

              {newLine.quantity && newLine.price && linePreview > 0 && (
                <div className="bg-blue-50 rounded-[1rem] px-5 py-3 flex justify-between items-center">
                  <span className="text-[11px] font-black text-blue-400 uppercase tracking-wide">Line Total</span>
                  <span className="font-black text-blue-600 text-lg">
                    ${linePreview.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={handleModalClose}
                  className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                <button type="submit" disabled={!canSubmit}
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-[1rem] font-bold shadow-xl
                             active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Syncing…' : 'Confirm Line'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADDED: Custom Delete Confirmation Modal */}
      {lineToDelete !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-6">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Delete Line?</h3>
            <p className="text-sm font-bold text-slate-400 mb-8">
              Are you sure you want to remove this item from the Purchase Order? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setLineToDelete(null)}
                className="flex-1 py-3 font-bold text-slate-500 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  await deleteOrderLine(id, lineToDelete);
                  setLineToDelete(null);
                }}
                className="flex-1 py-3 font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const Stat = ({ label, value, isStatus, highlight, icon }) => (
  <div>
    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">{icon} {label}</p>
    {isStatus
      ? <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black border border-blue-100 uppercase tracking-widest">{value}</span>
      : <p className={`text-xl font-black ${highlight ? 'text-blue-600' : 'text-slate-800'}`}>{value}</p>
    }
  </div>
);

export default PurchaseOrderDetailsPage;