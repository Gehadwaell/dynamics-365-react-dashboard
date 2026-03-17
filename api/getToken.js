// File: api/getToken.js

export default async function handler(req, res) {
  try {
    const tenantId = process.env.TENANT_ID;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const resource = process.env.RESOURCE; // e.g., https://growpath.sandbox.operations.eu.dynamics.com

    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/token`;
    
    // Format the payload exactly how Microsoft requires it
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('resource', resource);
    params.append('grant_type', 'client_credentials');

    // Make the secure request to Microsoft using native fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Microsoft Auth Error:", errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    
    // Send the token safely back to your React frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("Token Fetch Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}