import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useOrders } from './hooks/useOrders';
import { usePurchaseRequisitions } from './hooks/usePurchaseRequisitions';
import { usePurchaseOrders } from './hooks/usePurchaseOrders';
import Sidebar from './components/Sidebar';
import OrderListPage from './pages/OrderListPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import PurchaseRequisitions from './pages/PurchaseRequisitions';
import RequisitionDetailsPage from './pages/RequisitionDetailsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PurchaseOrderDetailsPage from './pages/PurchaseOrderDetailsPage';

function App() {
  const [showForm, setShowForm] = useState(false);
  const salesHook = useOrders();
  const prHook = usePurchaseRequisitions();
  const poHook = usePurchaseOrders();

  if (salesHook.loading || prHook.loading || poHook.loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* ADDED: The Toaster renders our beautiful modern popups! */}
      <Toaster position="bottom-right" reverseOrder={false} />

      <Sidebar onSalesClick={() => setShowForm(false)} />
      <main className="flex-1 p-8 lg:p-14 flex flex-col overflow-x-hidden">
        <Routes>
          <Route path="/" element={
            <OrderListPage {...salesHook} showForm={showForm} setShowForm={setShowForm} />
          } />
          <Route path="/order/:id" element={
            <OrderDetailsPage {...salesHook} />
          } />

          <Route path="/purchase-requisitions" element={
            <PurchaseRequisitions {...prHook} />
          } />
          <Route path="/purchase-requisitions/:id" element={
            <RequisitionDetailsPage {...prHook} />
          } />

          <Route path="/purchase-orders" element={
            <PurchaseOrdersPage {...poHook} />
          } />
          <Route path="/purchase-orders/:id" element={
            <PurchaseOrderDetailsPage {...poHook} />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;