// api/proxy.js
// Vercel serverless function — handles all /api-data/* requests.
// Forwards them to D365 with the Bearer token injected server-side.
// This replaces the simple vercel.json rewrite which cannot inject headers.

export default async function handler(req, res) {
  const {
    VITE_TENANT_ID,
    VITE_CLIENT_ID,
    VITE_CLIENT_SECRET,
    VITE_D365_URL,
  } = process.env;

  if (!VITE_TENANT_ID || !VITE_CLIENT_ID || !VITE_CLIENT_SECRET || !VITE_D365_URL) {
    return res.status(500).json({ error: 'Server misconfiguration: missing environment variables' });
  }

  // --- Step 1: Get a fresh D365 token ---
  const tokenUrl = `https://login.microsoftonline.com/${VITE_TENANT_ID}/oauth2/token`;
  const resource = VITE_D365_URL.replace(/\/$/, '');

  let accessToken;
  try {
    const tokenRes = await fetch(tokenUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     VITE_CLIENT_ID,
        client_secret: VITE_CLIENT_SECRET,
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
  // req.url will be something like /api-data/data/SalesOrderHeaders?...
  // Strip the /api-data prefix and append to D365 base URL
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

  // Forward If-Match for PATCH/DELETE (optimistic concurrency)
  if (req.headers['if-match']) {
    forwardHeaders['If-Match'] = req.headers['if-match'];
  }

  let d365Res;
  try {
    d365Res = await fetch(targetUrl, {
      method:  req.method,
      headers: forwardHeaders,
      body:    ['POST', 'PUT', 'PATCH'].includes(req.method)
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