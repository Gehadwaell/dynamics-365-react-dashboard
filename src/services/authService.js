// File: src/services/authService.js

export const getAccessToken = async () => {
  try {
    // 🔥 We are now asking your secure Vercel server for the token!
    const response = await fetch('/api/getToken');
    
    // Check if the server responded with an error
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