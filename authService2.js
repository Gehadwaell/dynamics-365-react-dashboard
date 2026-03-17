// export const getAccessToken = async () => {
//   // 1. DEBUG: Check if .env variables are actually loaded
//   console.log("Checking Env Variables:");
//   console.log("Client ID:", import.meta.env.VITE_CLIENT_ID);
//   console.log("Tenant ID:", import.meta.env.VITE_TENANT_ID);
//   // (We don't log the secret for security, but we log the others to be sure Vite sees them)

//   const url = `/api-token/${import.meta.env.VITE_TENANT_ID}/oauth2/v2.0/token`;
  
//   const body = new URLSearchParams({
//     client_id: import.meta.env.VITE_CLIENT_ID,
//     client_secret: import.meta.env.VITE_CLIENT_SECRET,
//     grant_type: 'client_credentials',
//     scope: import.meta.env.VITE_SCOPE
//   });

//   const response = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     body: body.toString()
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     // 2. DEBUG: This will print the exact reason Microsoft rejected it
//     console.error("Microsoft Auth Error Details:", errorData); 
//     throw new Error("Failed to get token");
//   }

//   const data = await response.json();
//   return data.access_token;
// };

//vercel code working 
// File: src/services/authService.js

// export const getAccessToken = async () => {
//   try {
//     // 🔥 We are now asking your secure Vercel server for the token!
//     const response = await fetch('/api/getToken');
    
//     // Check if the server responded with an error
//     if (!response.ok) {
//       const errData = await response.json();
//       console.error("Vercel Backend Error:", errData);
//       throw new Error("Failed to get token from Vercel");
//     }

//     const data = await response.json();
//     return data.access_token;
    
//   } catch (err) {
//     console.error("Auth Service Error:", err);
//     throw err;
//   }
// };