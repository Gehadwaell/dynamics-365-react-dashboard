import React, { useState } from 'react';

const NewOrderForm = ({ onCancel, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerAccount: '',
    customerName: '',
    invoiceAccount: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Call the function passed from App.jsx
    const success = await onSubmit(formData);
    
    setIsSubmitting(false);
    if (success) {
      onCancel(); // Close the form and go back to the list if successful
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 lg:p-14 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-gray-50 max-w-2xl w-full mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">Create Sales Order</h2>
        <p className="text-slate-400 font-medium">Enter the details to push a new record to Dynamics 365.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Account */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Customer Account *</label>
          <input 
            type="text" 
            name="customerAccount"
            required
            value={formData.customerAccount}
            onChange={handleChange}
            placeholder="e.g., US-001"
            className="w-full px-5 py-4 rounded-2xl bg-[#F8FAFC] border-none text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#0052FF] outline-none transition-all"
          />
        </div>

        {/* Customer Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
          <input 
            type="text" 
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="e.g., Falcon Retail"
            className="w-full px-5 py-4 rounded-2xl bg-[#F8FAFC] border-none text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#0052FF] outline-none transition-all"
          />
        </div>

        {/* Invoice Account */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Invoice Account</label>
          <input 
            type="text" 
            name="invoiceAccount"
            value={formData.invoiceAccount}
            onChange={handleChange}
            placeholder="Leave blank to use Customer Account"
            className="w-full px-5 py-4 rounded-2xl bg-[#F8FAFC] border-none text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#0052FF] outline-none transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-gray-50 hover:text-slate-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-[#0052FF] hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
          >
            {isSubmitting ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Submit Order"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOrderForm;