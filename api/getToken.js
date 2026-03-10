
/* eslint-disable no-undef */
export default async function handler(req, res) {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', process.env.VITE_CLIENT_ID);
  params.append('client_secret', process.env.VITE_CLIENT_SECRET);
  params.append('resource', 'https://growpath.sandbox.operations.eu.dynamics.com');

  try {
    const response = await fetch(`https://login.microsoftonline.com/${process.env.VITE_TENANT_ID}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch token' });
  }
}