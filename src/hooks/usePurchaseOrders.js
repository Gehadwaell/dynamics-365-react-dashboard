import { useState, useEffect, useCallback } from 'react';
import { getAccessToken } from '../services/authService';
import toast from 'react-hot-toast';

export const usePurchaseOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [sites, setSites] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [lines, setLines] = useState([]);
  const [linesLoading, setLinesLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const fetchOrderLines = useCallback(async (orderId) => {
    if (!orderId) return;
    setLinesLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `/api-data/data/PurchaseOrderLinesV2?$filter=PurchaseOrderNumber eq '${orderId}'&$select=LineNumber,ItemNumber,LineDescription,OrderedPurchaseQuantity,PurchasePrice,ReceivingSiteId,ReceivingWarehouseId,ProductColorId,ProductSizeId,ProductStyleId`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
      );
      const data = await res.json();
      setLines(data.value || []);
    } catch (err) {
      console.error("Fetch PO Lines Error:", err);
    } finally {
      setLinesLoading(false);
    }
  }, []);

const searchProducts = async (inputValue) => {
    try {
      const token = await getAccessToken();
      
      // If they typed something, filter it. If not, just grab the first 20 items.
      const filterClause = inputValue && inputValue.length >= 2 
        ? `&$filter=${encodeURIComponent(`ProductNumber eq '*${inputValue}*'`)}` 
        : '';
      
      const res = await fetch(
        `/api-data/data/ProductsV2?$select=ProductNumber,ProductName,ProductSubType${filterClause}&$top=20`, 
        { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
      );
      const data = await res.json();
      return (data.value || []).map(p => ({
        value: p.ProductNumber,
        label: `${p.ProductNumber} - ${p.ProductName || p.ProductNumber}`,
        subtype: p.ProductSubType
      }));
    } catch (err) { return []; }
  };

  const getProductVariants = async (itemNumber) => {
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `/api-data/data/ReleasedProductVariantsV2?$filter=ItemNumber eq '${itemNumber}'&$select=ProductColorId,ProductSizeId,ProductStyleId`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
      );
      const data = await res.json();
      return data.value || [];
    } catch (err) { return []; }
  };

  const getItemPrice = useCallback(async (itemNumber) => {
    if (!itemNumber) return null;
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `/api-data/data/ReleasedProductsV2?$filter=${encodeURIComponent(`ItemNumber eq '${itemNumber}'`)}&$select=ItemNumber,PurchasePrice&$top=1`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );
      if (res.ok) {
        const price = (await res.json()).value?.[0]?.PurchasePrice;
        if (price != null && price > 0) return price;
      }
      return null;
    } catch (err) { return null; }
  }, []);

  const createOrder = async (orderData) => {
    const loadingToast = toast.loading('Initializing Purchase Order...');
    try {
      const token = await getAccessToken();
      const payload = {
        dataAreaId: "usmf",
        OrderVendorAccountNumber: orderData.vendorAccount,
        CurrencyCode: orderData.currencyCode || 'USD'
      };

      const res = await fetch('/api-data/data/PurchaseOrderHeadersV2', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        const selectedVendor = vendors.find(v => v.VendorAccountNumber === orderData.vendorAccount);
        const vendorName = selectedVendor ? selectedVendor.VendorOrganizationName : "New Vendor PO";

        setAllOrders(prev => [{ 
          PurchaseOrderNumber: result.PurchaseOrderNumber, 
          PurchaseOrderName: vendorName, 
          PurchaseOrderStatus: "OpenOrder",
          OrderVendorAccountNumber: payload.OrderVendorAccountNumber,
          AccountingDate: new Date().toISOString()
        }, ...prev]);

        setCurrentPage(1); 
        toast.success('Purchase Order created successfully!', { id: loadingToast });
        return result;
      } else {
        const errorText = await res.text();
        toast.error('Failed to create PO Header.', { id: loadingToast });
        return null;
      }
    } catch (err) { 
      toast.error('Network error.', { id: loadingToast });
      return null; 
    }
  };

  const createOrderLine = async (orderId, lineData) => {
    const loadingToast = toast.loading('Syncing line to D365...');
    try {
      const token = await getAccessToken();
      const nextLineNumber = lines.length > 0 ? Math.max(...lines.map(l => l.LineNumber || 0)) + 1 : 1;

      const payload = {
        dataAreaId: "usmf",
        PurchaseOrderNumber: orderId,
        LineNumber: nextLineNumber,
        OrderedPurchaseQuantity: parseFloat(lineData.quantity),
        ItemNumber: lineData.itemNumber, 
      };

      if (lineData.siteId) payload.ReceivingSiteId = lineData.siteId;
      if (lineData.warehouseId) payload.ReceivingWarehouseId = lineData.warehouseId;
      if (lineData.colorId) payload.ProductColorId = lineData.colorId;
      if (lineData.sizeId) payload.ProductSizeId = lineData.sizeId;
      if (lineData.styleId) payload.ProductStyleId = lineData.styleId;
      
      if (lineData.price) {
        payload.PurchasePrice = parseFloat(lineData.price);
        payload.LineAmount = parseFloat(lineData.price) * parseFloat(lineData.quantity);
      }

      const res = await fetch('/api-data/data/PurchaseOrderLinesV2', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setLines(prev => [...prev, payload]);
        toast.success('Line added successfully!', { id: loadingToast });
        return true;
      } else {
        const errorText = await res.text();
        toast.error('D365 Rejected the Line.', { id: loadingToast });
        return false;
      }
    } catch (err) { 
      toast.error('Network error.', { id: loadingToast });
      return false; 
    }
  };

  const deleteOrderLine = async (orderId, lineNumber) => {
    const loadingToast = toast.loading('Deleting line...');
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `/api-data/data/PurchaseOrderLinesV2(dataAreaId='usmf',PurchaseOrderNumber='${orderId}',LineNumber=${lineNumber})`, 
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.ok) {
        setLines(prev => prev.filter(line => line.LineNumber !== lineNumber));
        toast.success('Line deleted!', { id: loadingToast });
        return true;
      }
      toast.error('Failed to delete line.', { id: loadingToast });
      return false;
    } catch (err) { 
      toast.error('Network error.', { id: loadingToast });
      return false; 
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = await getAccessToken();
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
        
        const [poRes, sRes, wRes, vRes, cuRes] = await Promise.all([
          fetch("/api-data/data/PurchaseOrderHeadersV2?cross-company=true&$filter=dataAreaId eq 'usmf'&$select=PurchaseOrderNumber,PurchaseOrderName,PurchaseOrderStatus,OrderVendorAccountNumber,AccountingDate&$orderby=AccountingDate desc,PurchaseOrderNumber desc&$top=100", { headers }),
          fetch('/api-data/data/OperationalSites?$select=SiteId,SiteName', { headers }),
          fetch('/api-data/data/Warehouses?$select=WarehouseId,WarehouseName,OperationalSiteId', { headers }),
          fetch('/api-data/data/VendorsV2?$select=VendorAccountNumber,VendorOrganizationName', { headers }), 
          fetch('/api-data/data/Currencies?$select=CurrencyCode', { headers })        
        ]);

        if (poRes.ok) setAllOrders((await poRes.json()).value || []);
        if (sRes.ok) setSites((await sRes.json()).value || []);
        if (wRes.ok) setWarehouses((await wRes.json()).value || []);
        if (vRes.ok) setVendors((await vRes.json()).value || []);
        if (cuRes.ok) setCurrencies((await cuRes.json()).value || []);

      } catch (err) {
        console.error("D365 Data Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const filteredOrders = allOrders.map(item => ({
    id: item.PurchaseOrderNumber,
    vendorAccount: item.OrderVendorAccountNumber,
    vendorName: item.PurchaseOrderName || "Unknown Vendor",
    status: item.PurchaseOrderStatus,
    date: item.AccountingDate || ""
  })).filter(o => 
    (o.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.vendorAccount || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    return dateB - dateA; 
  });

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return {
    orders: paginatedOrders, 
    totalItems: filteredOrders.length, 
    allOrders, sites, warehouses, vendors, currencies, lines, 
    loading, linesLoading, 
    fetchOrderLines, createOrderLine, deleteOrderLine, createOrder, 
    searchProducts, getProductVariants, getItemPrice, 
    searchTerm, setSearchTerm: (t) => { setSearchTerm(t); setCurrentPage(1); },
    currentPage, setCurrentPage, itemsPerPage
  };
};