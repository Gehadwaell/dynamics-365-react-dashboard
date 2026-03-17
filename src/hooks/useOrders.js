import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast'; 

export const useOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [sites, setSites] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [lines, setLines] = useState([]);
  const [linesLoading, setLinesLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  // --- 1. CORE FUNCTIONS ---

  const fetchOrderLines = useCallback(async (orderId) => {
    if (!orderId) return;
    setLinesLoading(true);
    try {
      const res = await fetch(
        `/api-data/data/SalesOrderLines?$filter=SalesOrderNumber eq '${orderId}'&$select=ItemNumber,LineDescription,OrderedSalesQuantity,SalesPrice,ShippingSiteId,ShippingWarehouseId,ProductColorId,ProductSizeId,ProductStyleId`,
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await res.json();
      setLines(data.value || []);
    } catch (err) {
      console.error("Fetch Lines Error:", err);
    } finally {
      setLinesLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (inputValue) => {
    try {
      let url = `/api-data/data/ProductsV2?$select=ProductNumber,ProductName,ProductSubType&$top=20`;
      
      if (inputValue && inputValue.trim().length > 0) {
        const filterStr = `ProductNumber eq '*${inputValue.trim()}*'`;
        url += `&$filter=${encodeURIComponent(filterStr)}`;
      }
        
      const res = await fetch(url, { 
        headers: { 'Accept': 'application/json' } 
      });
      
      if (!res.ok) return [];

      const data = await res.json();
      return (data.value || []).map(p => ({
        value: p.ProductNumber,
        label: `${p.ProductNumber} - ${p.ProductName || p.ProductNumber}`,
        subtype: p.ProductSubType
      }));
    } catch (err) {
      return [];
    }
  }, []); 

  const getProductVariants = async (itemNumber) => {
    try {
      const res = await fetch(
        `/api-data/data/ReleasedProductVariantsV2?$filter=ItemNumber eq '${itemNumber}'&$select=ProductColorId,ProductSizeId,ProductStyleId`,
        { headers: { 'Accept': 'application/json' } }
      );
      const data = await res.json();
      return data.value || [];
    } catch (err) {
      return [];
    }
  };

  const createOrderLine = async (orderId, lineData) => {
    const loadingToast = toast.loading('Adding Sales Line...'); 
    try {
      const payload = {
        dataAreaId: "usmf",
        SalesOrderNumber: orderId,
        ItemNumber: lineData.itemNumber,
        OrderedSalesQuantity: parseFloat(lineData.quantity)
      };

      if (lineData.siteId) payload.ShippingSiteId = lineData.siteId;
      if (lineData.warehouseId) payload.ShippingWarehouseId = lineData.warehouseId;
      if (lineData.colorId) payload.ProductColorId = lineData.colorId;
      if (lineData.sizeId) payload.ProductSizeId = lineData.sizeId;
      if (lineData.styleId) payload.ProductStyleId = lineData.styleId;
      if (lineData.price) payload.SalesPrice = parseFloat(lineData.price);

      const res = await fetch('/api-data/data/SalesOrderLines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        await fetchOrderLines(orderId);
        toast.success('Line added successfully!', { id: loadingToast }); 
        return true;
      } else {
        const errorData = await res.json();
        toast.error(`D365 Rejection: ${errorData?.error?.message}`, { id: loadingToast, duration: 6000 }); 
        return false;
      }
    } catch (err) {
      toast.error('Network error.', { id: loadingToast }); 
      return false;
    }
  };

  const createOrder = async (orderData) => {
    const loadingToast = toast.loading('Creating Sales Order...'); 
    try {
      const payload = {
        dataAreaId: "usmf",
        OrderingCustomerAccountNumber: orderData.customerAccount,
        CurrencyCode: orderData.currencyCode || 'USD'
      };

      const res = await fetch('/api-data/data/SalesOrderHeadersV3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        
        const selectedCustomer = customers.find(c => c.CustomerAccount === orderData.customerAccount);
        const customerName = selectedCustomer ? selectedCustomer.NameAlias : "New Order";

        setAllOrders(prev => [{ 
          SalesOrderNumber: result.SalesOrderNumber, 
          SalesOrderName: customerName, 
          SalesOrderStatus: "Open",
          OrderingCustomerAccountNumber: payload.OrderingCustomerAccountNumber
        }, ...prev]);

        setCurrentPage(1); 
        toast.success('Sales Order created!', { id: loadingToast }); 
        return true;
      } else {
        const errorData = await res.json();
        toast.error(`Failed to create order: ${errorData?.error?.message}`, { id: loadingToast, duration: 6000 }); 
        return false;
      }
    } catch (err) {
      toast.error('Network error.', { id: loadingToast }); 
      return false;
    }
  };

  // --- 2. INITIAL DATA FETCH ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const headers = { 'Accept': 'application/json' };
        
        const [oRes, sRes, wRes, cRes, cuRes] = await Promise.all([
          fetch("/api-data/data/SalesOrderHeadersV3?cross-company=true&$filter=dataAreaId eq 'usmf'&$select=SalesOrderNumber,SalesOrderName,SalesOrderStatus,OrderingCustomerAccountNumber,OrderCreationDateTime&$orderby=OrderCreationDateTime desc&$top=100", { headers }),
          fetch('/api-data/data/OperationalSites?$select=SiteId,SiteName', { headers }),
          fetch('/api-data/data/Warehouses?$select=WarehouseId,WarehouseName,OperationalSiteId', { headers }),
          fetch('/api-data/data/Customers?$select=CustomerAccount,NameAlias', { headers }), 
          fetch('/api-data/data/Currencies?$select=CurrencyCode,Name', { headers })        
        ]);

        const oData = await oRes.json();
        const sData = await sRes.json();
        const wData = await wRes.json();
        const cData = await cRes.json();
        const cuData = await cuRes.json();
        
        setAllOrders(oData.value || []);
        setSites(sData.value || []);
        setWarehouses(wData.value || []);
        setCustomers(cData.value || []);
        setCurrencies(cuData.value || []);

      } catch (err) {
        console.error("D365 Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // --- 3. SEARCH & PAGINATION LOGIC ---
  const filteredOrders = allOrders.map(item => ({
    id: item.SalesOrderNumber,
    customerAccount: item.OrderingCustomerAccountNumber,
    customerName: item.SalesOrderName || "Unknown",
    status: item.SalesOrderStatus 
  })).filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerAccount.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return {
    orders: paginatedOrders, 
    totalItems: filteredOrders.length, 
    sites, warehouses, customers, currencies, lines, 
    loading, linesLoading, 
    fetchOrderLines, createOrderLine, createOrder, searchProducts, getProductVariants, 
    searchTerm, setSearchTerm: (t) => { setSearchTerm(t); setCurrentPage(1); },
    currentPage, setCurrentPage, itemsPerPage
  };
};