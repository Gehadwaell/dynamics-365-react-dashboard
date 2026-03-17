// // src/services/authService.js

// export const getAccessToken = async () => {
//   const tenantId = import.meta.env.VITE_TENANT_ID;
//   const clientId = import.meta.env.VITE_CLIENT_ID;
//   const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
  
//   // The D365 environment URL you are targeting
//  const resource = 'https://growpath.sandbox.operations.eu.dynamics.com/.default';
  
//  const tokenUrl = `/api-token/${tenantId}/oauth2/v2.0/token`;
//   const params = new URLSearchParams();
//   params.append('client_id', clientId);
//   params.append('client_secret', clientSecret);
//   params.append('grant_type', 'client_credentials');
//   params.append('scope', resource);

//   try {
//     const response = await fetch(tokenUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       },
//       body: params
//     });

//     if (!response.ok) {
//       const err = await response.json();
//       console.error("Microsoft Auth Error:", err);
//       throw new Error("Failed to get token locally");
//     }

//     const data = await response.json();
//     return data.access_token;
    
//   } catch (error) {
//     console.error("Auth Service Error:", error);
//     throw error;
//   }
// };
// File: src/services/authService.js

export const getAccessToken = async () => {
  try {
    // 🔥 Securely ask your Vercel backend for the D365 token
    const response = await fetch('/api/getToken');
    
    if (!response.ok) {
      const errData = await response.json();
      console.error("Vercel Backend Error:", errData);
      throw new Error("Failed to get token from Vercel");
    }

    const data = await response.json();
    return data.access_token;
    
  } catch (err) {
    console.error("Auth Service Error:", err);
    throw err;
  }
};