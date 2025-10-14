// src/api/api.js
import axios from "axios";

const API_URL = "http://localhost:8000/predict"; // FastAPI endpoint

export const getPrediction = async (payload) => {
  try {
    const response = await axios.post(API_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Prediction Error:", error);
    throw error;
  }
};
