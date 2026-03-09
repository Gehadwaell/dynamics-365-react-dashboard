import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useOrders } from './hooks/useOrders';
import Sidebar from './components/Sidebar';
import OrderListPage from './pages/OrderListPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

function App() {
  const [showForm, setShowForm] = useState(false);
  const { 
    orders, totalItems, customers, currencies, products, loading,
    lines, linesLoading, fetchOrderLines, createOrderLine,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, itemsPerPage,
    createOrder 
  } = useOrders();

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-xl font-black text-blue-900 tracking-tighter italic">GrowPath Connecting...</p>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans">
      <Sidebar onSalesClick={() => setShowForm(false)} />
      <main className="flex-1 p-8 lg:p-14 flex flex-col overflow-x-hidden">
        <Routes>
          <Route path="/" element={
            <OrderListPage 
              showForm={showForm} setShowForm={setShowForm}
              orders={orders} totalItems={totalItems}
              searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              currentPage={currentPage} setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage} customers={customers}
              currencies={currencies} createOrder={createOrder}
            />
          } />
          <Route path="/order/:id" element={
            <OrderDetailsPage 
              orders={orders} lines={lines} products={products}
              linesLoading={linesLoading} fetchOrderLines={fetchOrderLines} 
              createOrderLine={createOrderLine} 
            />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;