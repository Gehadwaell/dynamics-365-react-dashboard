// File: src/services/authService.js

export const getAccessToken = async () => {
  try {
    // 🔥 This is the magic line! It asks Vercel's secure server for the token
    const response = await fetch('/api/getToken');
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Vercel Backend Error:", data);
      throw new Error("Failed to get token from Vercel");
    }
    
    return data.access_token;
  } catch (err) {
    console.error("Auth Service Error:", err);
    throw err;
  }
};