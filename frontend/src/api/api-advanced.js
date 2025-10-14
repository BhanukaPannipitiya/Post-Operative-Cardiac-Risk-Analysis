// src/api/api.js
import axios from "axios";

// Advanced API URL discovery with health checks
class ApiUrlDiscovery {
  constructor() {
    this.cachedUrl = null;
    this.discoveryPromise = null;
  }

  async discoverApiUrl() {
    // If explicitly set via environment variable, use that
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }

    // Development environment (localhost)
    const currentHost = window.location.hostname;
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return 'http://localhost:8000/predict';
    }

    // Production environment - try multiple backend URLs
    const possibleUrls = this.generatePossibleUrls(currentHost);
    
    // Test each URL to find the working one
    for (const url of possibleUrls) {
      try {
        const healthUrl = url.replace('/predict', '/');
        const response = await axios.get(healthUrl, { timeout: 3000 });
        if (response.status === 200 && response.data.status === 'ok') {
          console.log(`✅ Found working backend at: ${url}`);
          return url;
        }
      } catch (error) {
        console.log(`❌ Backend not available at: ${url}`);
        continue;
      }
    }

    // Fallback to first possible URL if none work
    console.warn('⚠️ No working backend found, using fallback URL');
    return possibleUrls[0];
  }

  generatePossibleUrls(currentHost) {
    const urls = [];

    // Render.com specific patterns
    if (currentHost.includes('onrender.com')) {
      const serviceName = currentHost.split('.')[0];
      urls.push(
        `https://${serviceName}-backend.onrender.com/predict`,
        `https://${serviceName}-api.onrender.com/predict`,
        `https://backend-${serviceName}.onrender.com/predict`,
        `https://api-${serviceName}.onrender.com/predict`
      );
    }

    // Generic patterns
    urls.push(
      `https://cardiac-ai-backend.onrender.com/predict`,
      `https://backend-${currentHost}/predict`,
      `https://api-${currentHost}/predict`,
      `https://${currentHost}/api/predict`
    );

    return urls;
  }

  async getApiUrl() {
    if (this.cachedUrl) {
      return this.cachedUrl;
    }

    if (this.discoveryPromise) {
      return this.discoveryPromise;
    }

    this.discoveryPromise = this.discoverApiUrl();
    this.cachedUrl = await this.discoveryPromise;
    return this.cachedUrl;
  }
}

const apiDiscovery = new ApiUrlDiscovery();

export const getPrediction = async (payload) => {
  try {
    const apiUrl = await apiDiscovery.getApiUrl();
    const response = await axios.post(apiUrl, payload);
    return response.data;
  } catch (error) {
    console.error("Prediction Error:", error);
    throw error;
  }
};

// Export the API URL for debugging
export const getCurrentApiUrl = () => apiDiscovery.cachedUrl;
