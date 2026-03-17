// src/services/purchaseService.js
import { getAccessToken } from './authService';

const D365_BASE_URL = "https://usnconeboxax1aos.cloud.onebox.dynamics.com";

export const purchaseService = {
  // 1. Fetch all Purchase Requisitions (Like your Sales Order list)
  getRequisitions: async () => {
    const token = await getAccessToken();
    const response = await fetch(
      `${D365_BASE_URL}/data/PurchaseRequisitionHeaders?$orderby=RequisitionName desc&$top=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    if (!response.ok) throw new Error('Failed to fetch Purchase Requisitions');
    const data = await response.json();
    return data.value;
  },

  // 2. Create a New Purchase Requisition Header
  createRequisition: async (requisitionData) => {
    const token = await getAccessToken();
    const response = await fetch(`${D365_BASE_URL}/data/PurchaseRequisitionHeaders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        RequisitionName: requisitionData.name,
        BuyingLegalEntityId: "USMF", // Standard default
        PreparerPersonnelNumber: "000020" // We'll use a default admin number for now
      })
    });
    if (!response.ok) throw new Error('Failed to create Requisition');
    return await response.json();
  }
};