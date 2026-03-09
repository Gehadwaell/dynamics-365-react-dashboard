import React, { useState } from 'react';

const NewOrderForm = ({ onCancel, onSubmit, customers, currencies }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerAccount: '',
    currencyCode: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit(formData);
    setIsSubmitting(false);
    if (success) onCancel(); 
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 lg:p-14 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-gray-50 max-w-2xl w-full mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Create Sales Order</h2>
        <p className="text-slate-400 font-medium">Auto-generates ID and links to Sandbox Master Data.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Customer *</label>
          <select 
            name="customerAccount"
            required
            value={formData.customerAccount}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-2xl bg-[#F8FAFC] border-none text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#0052FF] outline-none cursor-pointer"
          >
            <option value="" disabled>Select a Customer...</option>
            {customers.map((cust, idx) => (
              <option key={idx} value={cust.CustomerAccount}>
                {cust.CustomerAccount} - {cust.NameAlias || "No Name"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Currency *</label>
          <select 
            name="currencyCode"
            required
            value={formData.currencyCode}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-2xl bg-[#F8FAFC] border-none text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#0052FF] outline-none cursor-pointer"
          >
            <option value="" disabled>Select Currency...</option>
            {currencies.map((curr, idx) => (
              <option key={idx} value={curr.CurrencyCode}>
                {curr.CurrencyCode} - {curr.Name || ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#0052FF] hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all">
            {isSubmitting ? "Processing..." : "Submit Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOrderForm;