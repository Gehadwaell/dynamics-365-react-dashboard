// api/proxy.js
// Vercel serverless function — handles all /api-data/* requests.
// Forwards them to D365 with the Bearer token injected server-side.

export default async function handler(req, res) {
  // 🔥 FIX 1: Removed VITE_ prefix for absolute server-side security
  const {
    TENANT_ID,
    CLIENT_ID,
    CLIENT_SECRET,
    D365_URL,
  } = process.env;

  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !D365_URL) {
    return res.status(500).json({ error: 'Server misconfiguration: missing environment variables' });
  }

  // --- Step 1: Get a fresh D365 token ---
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/token`;
  const resource = D365_URL.replace(/\/$/, '');

  let accessToken;
  try {
    const tokenRes = await fetch(tokenUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        resource,
      }).toString(),
    });
    
    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Token fetch failed:', err);
      return res.status(502).json({ error: 'Failed to get D365 token', details: err });
    }
    
    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
  } catch (err) {
    return res.status(500).json({ error: 'Token request error', details: err.message });
  }

  // --- Step 2: Build the D365 target URL ---
  const path = req.url.replace(/^\/api-data/, '');
  const targetUrl = `${resource}${path}`;

  // --- Step 3: Forward the request to D365 ---
  const forwardHeaders = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept':        'application/json',
    'Content-Type':  'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version':    '4.0',
  };

  if (req.headers['if-match']) {
    forwardHeaders['If-Match'] = req.headers['if-match'];
  }

  let d365Res;
  try {
    d365Res = await fetch(targetUrl, {
      method:  req.method,
      headers: forwardHeaders,
      // 🔥 FIX 2: Added a failsafe to ensure empty bodies don't break POST/PATCH requests
      body:    ['POST', 'PUT', 'PATCH'].includes(req.method) && req.body && Object.keys(req.body).length > 0
        ? JSON.stringify(req.body)
        : undefined,
    });
  } catch (err) {
    return res.status(502).json({ error: 'D365 request failed', details: err.message });
  }

  // --- Step 4: Stream the D365 response back ---
  const responseText = await d365Res.text();

  res.status(d365Res.status);
  res.setHeader('Content-Type', d365Res.headers.get('content-type') || 'application/json');
  res.send(responseText);
}