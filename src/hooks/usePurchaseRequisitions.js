import { useState, useEffect, useCallback } from 'react';
import { getAccessToken } from '../services/authService';
import toast from 'react-hot-toast';

export const usePurchaseRequisitions = () => {
  const [allRequisitions, setAllRequisitions] = useState([]);
  const [sites, setSites] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reqLines, setReqLines] = useState([]);
  const [linesLoading, setLinesLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchRequisitionLines = useCallback(async (reqId) => {
    if (!reqId) return;
    setLinesLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `/api-data/data/PurchaseRequisitionLines?$filter=RequisitionNumber eq '${reqId}'`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error(`D365 Error: ${res.status}`);
      setReqLines((await res.json()).value || []);
    } catch (err) { console.error('Fetch Lines Error:', err); }
    finally { setLinesLoading(false); }
  }, []);

  const searchProducts = async (inputValue) => {
    try {
      const token = await getAccessToken();
      const filterClause = inputValue && inputValue.length >= 2 
        ? `&$filter=${encodeURIComponent(`ProductNumber eq '*${inputValue}*'`)}` 
        : '';
        
      const res = await fetch(
        `/api-data/data/ProductsV2?$select=ProductNumber,ProductName,ProductSubType${filterClause}&$top=20`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );
      return ((await res.json()).value || []).map(p => ({
        value:   p.ProductNumber,
        label:   `${p.ProductNumber} - ${p.ProductName || p.ProductNumber}`,
        subtype: p.ProductSubType,
      }));
    } catch { return []; }
  };

  const getProductVariants = async (itemNumber) => {
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `/api-data/data/ReleasedProductVariantsV2?$filter=ItemNumber eq '${itemNumber}'` +
        `&$select=ProductColorId,ProductSizeId,ProductStyleId`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );
      return (await res.json()).value || [];
    } catch { return []; }
  };

  const getItemPrice = useCallback(async (itemNumber) => {
    if (!itemNumber) return null;
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `/api-data/data/ReleasedProductsV2` +
        `?$filter=${encodeURIComponent(`ItemNumber eq '${itemNumber}'`)}` +
        `&$select=ItemNumber,PurchasePrice&$top=1`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );
      if (res.ok) {
        const price = (await res.json()).value?.[0]?.PurchasePrice;
        if (price != null && price > 0) return price;
      }
      return null;
    } catch (err) {
      return null;
    }
  }, []);

  const createRequisition = async (requisitionName) => {
    const loadingToast = toast.loading('Initializing Requisition...');
    try {
      const token = await getAccessToken();
      const payload = { RequisitionName: requisitionName };

      const res = await fetch('/api-data/data/PurchaseRequisitionHeaders', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newReq = await res.json();
        setAllRequisitions(prev => [newReq, ...prev]);
        toast.success('Requisition created!', { id: loadingToast });
        return newReq; 
      } else {
        const errorText = await res.text();
        toast.error('Failed to create header.', { id: loadingToast });
        return null;
      }
    } catch (err) { 
      toast.error('Network error.', { id: loadingToast });
      return null; 
    }
  };

  const createRequisitionLine = async (reqId, lineData) => {
    const loadingToast = toast.loading('Syncing line to D365...');
    try {
      const token     = await getAccessToken();
      const reqHeader = allRequisitions.find(r => r.RequisitionNumber === reqId) || {};
      const tomorrow  = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      const safeDate  = tomorrow.toISOString().split('.')[0] + 'Z';

      const payload = {
        BuyingLegalEntityId:       reqHeader.BuyingLegalEntityId || 'USMF',
        RequisitionNumber:         reqId,
        RequisitionLineNumber:     reqLines.length > 0 ? Math.max(...reqLines.map(l => l.RequisitionLineNumber)) + 1 : 1,
        RequestedPurchaseQuantity: parseFloat(lineData.quantity),
        PurchaseUnitSymbol:        lineData.unitId       || 'ea',
        CurrencyCode:              lineData.currencyCode || 'USD',
        RequestedDate:             safeDate,
        AccountingDate:            safeDate,
        ItemNumber:                lineData.itemNumber, // Strictly enforce Catalog Items
      };

      if (lineData.siteId)      payload.ReceivingSiteId      = lineData.siteId;
      if (lineData.warehouseId) payload.ReceivingWarehouseId = lineData.warehouseId;
      if (lineData.colorId)     payload.ProductColorId       = lineData.colorId;
      if (lineData.sizeId)      payload.ProductSizeId        = lineData.sizeId;
      if (lineData.styleId)     payload.ProductStyleId       = lineData.styleId;
      
      if (lineData.price) {
        payload.PurchasePrice = parseFloat(lineData.price);
        payload.LineAmount    = parseFloat(lineData.price) * parseFloat(lineData.quantity);
      }

      const res = await fetch('/api-data/data/PurchaseRequisitionLines', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (res.ok) { 
        await fetchRequisitionLines(reqId); 
        toast.success('Line added successfully!', { id: loadingToast });
        return true; 
      }

      toast.error('D365 Rejected the Line.', { id: loadingToast });
      return false;
    } catch { 
      toast.error('Network error.', { id: loadingToast });
      return false; 
    }
  };

  const deleteRequisitionLine = async (reqId, lineNumber) => {
    const loadingToast = toast.loading('Deleting line...');
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `/api-data/data/PurchaseRequisitionLines(RequisitionNumber='${reqId}',RequisitionLineNumber=${lineNumber})`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.ok) { 
        setReqLines(prev => prev.filter(line => line.RequisitionLineNumber !== lineNumber));
        toast.success('Line deleted!', { id: loadingToast });
        return true; 
      }
      
      const errorData = await res.json();
      const FAndOError = errorData?.error?.innererror?.message || errorData?.error?.message || 'Unknown D365 Error';
      
      toast.error(`D365 Blocked Deletion: ${FAndOError}`, { id: loadingToast, duration: 6000 });
      return false;

    } catch (err) { 
      toast.error('Network error.', { id: loadingToast });
      return false; 
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const token   = await getAccessToken();
        const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

        const [prRes, sRes, wRes, cRes] = await Promise.all([
          fetch('/api-data/data/PurchaseRequisitionHeaders?$orderby=RequisitionNumber desc&$top=100', { headers }),
          fetch('/api-data/data/OperationalSites', { headers }),
          fetch('/api-data/data/Warehouses',       { headers }),
          fetch('/api-data/data/Currencies',       { headers }),
        ]);

        if (prRes.ok)  setAllRequisitions((await prRes.json()).value  || []);
        if (sRes.ok)   setSites((await sRes.json()).value             || []);
        if (wRes.ok)   setWarehouses((await wRes.json()).value        || []);
        if (cRes.ok)   setCurrencies((await cRes.json()).value        || []);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = allRequisitions.filter(r =>
    (r.RequisitionNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.RequisitionName   || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    requisitions: filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    allRequisitions, totalItems: filtered.length,
    sites, warehouses, currencies,
    reqLines, loading, linesLoading,
    fetchRequisitionLines, createRequisition, createRequisitionLine, deleteRequisitionLine,
    searchProducts, getProductVariants, getItemPrice,
    searchTerm, setSearchTerm: (t) => { setSearchTerm(t); setCurrentPage(1); },
    currentPage, setCurrentPage, itemsPerPage,
  };
};