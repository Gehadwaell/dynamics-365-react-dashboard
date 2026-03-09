
/* eslint-disable no-undef */
// File: api/getToken.js
// This runs securely on Vercel's servers, NOT in the browser!

export default async function handler(req, res) {
  const tenantId = process.env.VITE_TENANT_ID;
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: process.env.VITE_CLIENT_ID,
    client_secret: process.env.VITE_CLIENT_SECRET,
    grant_type: 'client_credentials',
    scope: process.env.VITE_SCOPE
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    // Send the token securely back to your React app
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}