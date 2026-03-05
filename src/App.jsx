import React, { useState } from 'react';
import { useOrders } from './hooks/useOrders';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import OrderCard from './components/OrderCard';
import Pagination from './components/Pagination';
import NewOrderForm from "./pages/NewOrderForm";// <-- Your new form component

function App() {
  // UI State: toggles between the grid and the form
  const [showForm, setShowForm] = useState(false);
  
  // Data State: connected directly to the Dynamics 365 Sandbox
  const { 
    orders, 
    loading,
    searchTerm, 
    setSearchTerm, 
    currentPage, 
    setCurrentPage, 
    totalItems, 
    itemsPerPage,
    createOrder // <-- Extracted the POST function
  } = useOrders();

  // The Loading Screen while the Proxy talks to Microsoft
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-black text-slate-800 tracking-tighter italic">
            Connecting to GrowPath Sandbox...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* SIDEBAR: Clicking Sales Orders forces the app back to the grid view */}
      <Sidebar onSalesClick={() => setShowForm(false)} />
      
      <main className="flex-1 p-8 lg:p-14 flex flex-col">
        {!showForm ? (
          /* --- VIEW 1: THE DYNAMICS 365 DATA GRID --- */
          <>
            <Toolbar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              onNewOrder={() => setShowForm(true)} 
            />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-10 flex-grow">
              {orders.map((order, index) => (
                <OrderCard key={index} order={order} />
              ))}
            </div>

            {totalItems > itemsPerPage && (
              <Pagination 
                totalItems={totalItems} 
                itemsPerPage={itemsPerPage} 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
              />
            )}

            {/* Empty State for Search */}
            {orders.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 mt-10">
                <p className="text-slate-400 font-bold italic tracking-wide">
                  No orders found matching "{searchTerm}"
                </p>
              </div>
            )}
          </>
        ) : (
          /* --- VIEW 2: THE NEW ORDER FORM --- */
          <div className="flex-grow flex items-center justify-center py-10">
            <NewOrderForm 
              onCancel={() => setShowForm(false)} 
              onSubmit={createOrder} 
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;