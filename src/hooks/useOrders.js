import { useState, useEffect, useCallback } from 'react';
import { getAccessToken } from '../services/authService';

export const useOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [lines, setLines] = useState([]);
  const [linesLoading, setLinesLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // --- 1. CORE FUNCTIONS ---

  const fetchOrderLines = useCallback(async (orderId) => {
    if (!orderId) return;
    setLinesLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `/api-data/data/SalesOrderLines?$filter=SalesOrderNumber eq '${orderId}'`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
      );
      const data = await res.json();
      
      if (data.value) {
        setLines(data.value.map(line => ({
          ItemNumber: line.ItemNumber,
          LineDescription: line.LineDescription || "No Description",
          OrderedSalesQuantity: line.OrderedSalesQuantity,
          SalesPrice: line.SalesPrice || 0
        })));
      } else {
        setLines([]);
      }
    } catch (err) {
      console.error("Fetch Lines Error:", err);
    } finally {
      setLinesLoading(false);
    }
  }, []);

  const createOrderLine = async (orderId, lineData) => {
    try {
      const token = await getAccessToken();
      
      // 🔥 THE FIX: Minimal payload. Let D365 auto-default the Site, Warehouse, and Unit!
      const payload = {
        dataAreaId: "usmf",
        SalesOrderNumber: orderId,
        ItemNumber: lineData.itemNumber,
        OrderedSalesQuantity: parseFloat(lineData.quantity)
      };

      const res = await fetch('/api-data/data/SalesOrderLines', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        await fetchOrderLines(orderId);
        return true;
      } else {
        // 🔥 DEEP ERROR LOGGING: If D365 rejects it, we will see the exact reason.
        const errorData = await res.json();
        const errorMessage = errorData?.error?.message || "Unknown D365 Business Logic Error";
        console.error("D365 Rejected the POST:", JSON.stringify(errorData, null, 2));
        alert(`D365 Rejection: ${errorMessage}`);
        return false;
      }
    } catch (err) {
      console.error("Line Creation Network Error:", err);
      alert("Network Error: Could not reach D365.");
      return false;
    }
  };

  const createOrder = async (data) => {
    try {
      const token = await getAccessToken();
      const res = await fetch('/api-data/data/SalesOrderHeadersV3', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dataAreaId: "usmf", 
          CurrencyCode: data.currencyCode, 
          OrderingCustomerAccountNumber: data.customerAccount 
        })
      });
      if (res.ok) {
        const result = await res.json();
        setAllOrders(prev => [{ 
          SalesOrderNumber: result.SalesOrderNumber, 
          SalesOrderName: "New Order", 
          SalesOrderStatus: "Open" 
        }, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // --- 2. INITIAL DATA FETCH ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = await getAccessToken();
        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        };
        
        const [oRes, cRes, cuRes] = await Promise.all([
          fetch('/api-data/data/SalesOrderHeadersV3', { headers }),
          fetch('/api-data/data/Customers?$select=CustomerAccount,NameAlias', { headers }),
          fetch('/api-data/data/Currencies?$select=CurrencyCode,Name', { headers })
        ]);

        const oData = await oRes.json();
        const cData = await cRes.json();
        const cuData = await cuRes.json();
        
        setAllOrders(oData.value || []);
        setCustomers(cData.value || []);
        setCurrencies(cuData.value || []);

        try {
          const pRes = await fetch('/api-data/data/ReleasedProductsV2?$select=ItemNumber,SearchName&$top=100', { headers });
          if (pRes.ok) {
            const pData = await pRes.json();
            const safeProducts = pData.value.map(p => ({
              ItemNumber: p.ItemNumber,
              ProductName: p.SearchName || p.ItemNumber 
            }));
            setProducts(safeProducts);
          }
        } catch (productErr) {
          console.error("Products Fetch Failed:", productErr);
        }

      } catch (err) {
        console.error("Main D365 Connection Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // --- 3. SEARCH & PAGINATION ---
  const filteredOrders = allOrders.map(item => ({
    id: item.SalesOrderNumber,
    customerAccount: item.OrderingCustomerAccountNumber || item.CustomerAccount,
    customerName: item.SalesOrderName || "Unknown",
    status: item.SalesOrderStatus 
  })).filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return {
    orders: paginatedOrders,
    totalItems: filteredOrders.length,
    customers,
    currencies,
    products,
    loading,
    lines,
    linesLoading,
    fetchOrderLines,
    createOrderLine,
    createOrder,
    searchTerm,
    setSearchTerm: (t) => { setSearchTerm(t); setCurrentPage(1); },
    currentPage,
    setCurrentPage,
    itemsPerPage
  };
};