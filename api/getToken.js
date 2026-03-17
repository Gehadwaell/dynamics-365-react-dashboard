// api/getToken.js
// Vercel serverless function — lives at /api/getToken
// Fetches a D365 OAuth token using client credentials stored in Vercel env vars.
// NEVER expose these secrets in frontend code.

export default async function handler(req, res) {
  // Only allow GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    VITE_TENANT_ID,
    VITE_CLIENT_ID,
    VITE_CLIENT_SECRET,
    VITE_D365_URL,
  } = process.env;

  // Validate all required env vars are present
  if (!VITE_TENANT_ID || !VITE_CLIENT_ID || !VITE_CLIENT_SECRET || !VITE_D365_URL) {
    console.error('Missing environment variables:', {
      VITE_TENANT_ID:     !!VITE_TENANT_ID,
      VITE_CLIENT_ID:     !!VITE_CLIENT_ID,
      VITE_CLIENT_SECRET: !!VITE_CLIENT_SECRET,
      VITE_D365_URL:      !!VITE_D365_URL,
    });
    return res.status(500).json({
      error: 'Server misconfiguration: missing environment variables',
    });
  }

  const tokenUrl = `https://login.microsoftonline.com/${VITE_TENANT_ID}/oauth2/token`;

  // D365 resource is the base URL without trailing slash
  const resource = VITE_D365_URL.replace(/\/$/, '');

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     VITE_CLIENT_ID,
    client_secret: VITE_CLIENT_SECRET,
    resource:      resource,
  });

  try {
    const tokenRes = await fetch(tokenUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('D365 token fetch failed:', tokenRes.status, errText);
      return res.status(502).json({
        error:   'Failed to fetch D365 token',
        details: errText,
      });
    }

    const data = await tokenRes.json();

    // Return only the access token — never return the full response
    return res.status(200).json({ access_token: data.access_token });
  } catch (err) {
    console.error('getToken handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}