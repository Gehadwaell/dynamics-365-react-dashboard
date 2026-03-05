import { useState, useEffect } from 'react';
import { getAccessToken } from '../services/authService';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // 1. FETCH ORDERS (GET)
  useEffect(() => {
    const loadDynamicsData = async () => {
      try {
        const token = await getAccessToken();
        
        const response = await fetch('/api-data/data/SalesOrderHeaders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();
        
        if (result && result.value) {
          const mappedOrders = result.value.map(item => ({
            id: item.SalesOrderNumber,
            customerAccount: item.OrderingCustomerAccountNumber,
            customerName: item.SalesOrderName || "Unknown Customer",
            orderType: "Sales", 
            invoiceAccount: item.InvoiceCustomerAccountNumber,
            status: [item.SalesOrderStatus] 
          }));
          setOrders(mappedOrders);
        }
      } catch (err) {
        console.error("Dynamics Integration Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDynamicsData();
  }, []);

  // 2. CREATE NEW ORDER (POST)
  const createOrder = async (newOrderData) => {
    try {
      const token = await getAccessToken();
      
      const dynamicsPayload = {
        OrderingCustomerAccountNumber: newOrderData.customerAccount,
        SalesOrderName: newOrderData.customerName,
        InvoiceCustomerAccountNumber: newOrderData.invoiceAccount || newOrderData.customerAccount,
        // Often required by Dynamics for new records; adjust if your mentor provided a specific company ID
        dataAreaId: "usmf", 
      };

      const response = await fetch('/api-data/data/SalesOrderHeaders', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(dynamicsPayload)
      });

      if (!response.ok) {
        const errorText = await response.json();
        console.error("Failed to push to Dynamics:", errorText);
        alert("Failed to create order. Check your browser console for Dynamics validation errors.");
        return false;
      }

      const result = await response.json();
      
      // Add the successful response to our local state instantly
      const newlyCreatedOrder = {
        id: result.SalesOrderNumber,
        customerAccount: result.OrderingCustomerAccountNumber,
        customerName: result.SalesOrderName,
        orderType: "Sales",
        invoiceAccount: result.InvoiceCustomerAccountNumber,
        status: [result.SalesOrderStatus || "Open"]
      };

      setOrders([newlyCreatedOrder, ...orders]);
      return true;

    } catch (err) {
      console.error("Creation Error:", err);
      return false;
    }
  };

  // 3. SEARCH & PAGINATION LOGIC
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); 
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // 4. EXPORT EVERYTHING TO THE APP
  return {
    orders: currentOrders,
    loading,
    searchTerm,
    setSearchTerm: handleSearch,
    currentPage,
    setCurrentPage,
    totalItems: filteredOrders.length,
    itemsPerPage,
    createOrder
  };
};