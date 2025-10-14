// src/api/api.js
import axios from "axios";

// Smart API URL detection - works automatically in dev and production
const getApiUrl = () => {
  // Priority 1: Explicit environment variable (for manual override)
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 Using explicit API URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Priority 2: Auto-detect based on current domain
  const currentHost = window.location.hostname;
  
  // Development environment (localhost)
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    console.log('🏠 Development mode: Using localhost backend');
    return 'http://localhost:8000/predict';
  }
  
  // Production environment - smart URL construction
  if (currentHost.includes('onrender.com')) {
    const serviceName = currentHost.split('.')[0];
    const backendUrl = `https://${serviceName}-backend.onrender.com/predict`;
    console.log('🚀 Production mode: Auto-detected backend URL:', backendUrl);
    return backendUrl;
  }
  
  // Fallback for other domains
  const fallbackUrl = `https://cardiac-ai-backend.onrender.com/predict`;
  console.log('⚠️ Using fallback backend URL:', fallbackUrl);
  return fallbackUrl;
};

// Cache the API URL to avoid recalculating on every request
let cachedApiUrl = null;
const API_URL = cachedApiUrl || (cachedApiUrl = getApiUrl());

// Log the final API URL for debugging
console.log('🌐 Final API URL:', API_URL);

export const getPrediction = async (payload) => {
  try {
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Prediction Error:", error);
    throw error;
  }
};
