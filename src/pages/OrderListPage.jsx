import React from 'react';
import Toolbar from '../components/Toolbar';
import OrderCard from '../components/OrderCard';
import Pagination from '../components/Pagination';
import NewOrderForm from './NewOrderForm';

const OrderListPage = ({ 
  showForm, setShowForm, orders, totalItems, 
  searchTerm, setSearchTerm, currentPage, 
  setCurrentPage, itemsPerPage, customers, 
  currencies, createOrder 
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {!showForm ? (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <Toolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} onNewOrder={() => setShowForm(true)} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
          <Pagination totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center py-6 animate-in zoom-in duration-300">
          <div className="w-full max-w-4xl">
            <button onClick={() => setShowForm(false)} className="mb-6 text-slate-400 font-bold hover:text-orange-500">← Back</button>
            <NewOrderForm onCancel={() => setShowForm(false)} onSubmit={createOrder} customers={customers} currencies={currencies} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderListPage;