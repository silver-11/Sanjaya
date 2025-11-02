// ===========================================
// src/config/api.js - UNIFIED MEDICAL AI SYSTEM
// ===========================================

// ⚠️ API URL is now loaded from environment variables
// Set REACT_APP_API_BASE_URL in your .env file
// See .env.example for template

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://latrina-unwilled-stepanie.ngrok-free.dev";

// API Endpoints for Unified Medical AI System
export const API_ENDPOINTS = {
  // Root
  ROOT: `${API_BASE_URL}/`,
  STATUS: `${API_BASE_URL}/status`,
  HEALTH: `${API_BASE_URL}/health`,
  RESET: `${API_BASE_URL}/reset`,
  
  // Symptom Diagnosis
  SYMPTOM_START: `${API_BASE_URL}/symptom/start`,
  SYMPTOM_CHAT: `${API_BASE_URL}/symptom/chat`,
  
  // Image Analysis
  IMAGE_START: `${API_BASE_URL}/image/start`,
  IMAGE_UPLOAD: `${API_BASE_URL}/image/upload`,
  IMAGE_CHAT: `${API_BASE_URL}/image/chat`,
  
  // History & Stats
  GET_HISTORY: `${API_BASE_URL}/history`,
  GET_STATS: `${API_BASE_URL}/stats`
};

// API Helper Functions
export const apiClient = {
  // Generic response handler
  async _handleResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json().catch(() => ({})) : null;

    if (!response.ok) {
      const errMsg = (data && (data.error || data.detail || data.message)) || `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    // If backend wraps success, honor it
    if (data && Object.prototype.hasOwnProperty.call(data, 'success') && data.success === false) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data ?? {};
  },

  // ========== SYMPTOM DIAGNOSIS ==========
  
  // Start symptom diagnosis session
  async startSymptomSession() {
    const response = await fetch(API_ENDPOINTS.SYMPTOM_START, {
      method: 'POST',
    });
    return this._handleResponse(response);
  },

  // Chat about symptoms
  async symptomChat(message) {
    const formData = new FormData();
    formData.append('message', message);

    const response = await fetch(API_ENDPOINTS.SYMPTOM_CHAT, {
      method: 'POST',
      body: formData,
    });

    return this._handleResponse(response);
  },

  // ========== IMAGE ANALYSIS ==========

  // Start image analysis session
  async startImageSession() {
    const response = await fetch(API_ENDPOINTS.IMAGE_START, {
      method: 'POST',
    });
    return this._handleResponse(response);
  },

  // Upload image with file
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_ENDPOINTS.IMAGE_UPLOAD, {
      method: 'POST',
      body: formData,
    });

    return this._handleResponse(response);
  },

  // Ask question about uploaded image
  async imageChat(question) {
    const formData = new FormData();
    formData.append('question', question);

    const response = await fetch(API_ENDPOINTS.IMAGE_CHAT, {
      method: 'POST',
      body: formData,
    });

    return this._handleResponse(response);
  },

  // ========== GENERAL ==========

  // Reset system
  async reset() {
    const response = await fetch(API_ENDPOINTS.RESET, {
      method: 'POST',
    });

    return this._handleResponse(response);
  },

  // Get system status
  async getStatus() {
    const response = await fetch(API_ENDPOINTS.STATUS, {
      method: 'GET',
    });

    return this._handleResponse(response);
  },

  // Test connection
  async testConnection() {
    try {
      const response = await fetch(API_ENDPOINTS.ROOT, {
        method: 'GET',
      });
      
      if (!response.ok) {
        return { connected: false, error: 'Server returned error' };
      }

      const data = await response.json();
      return { connected: true, data };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  },

  // Get conversation history
  async getHistory(sessionId, limit = 50) {
    const url = `${API_ENDPOINTS.GET_HISTORY}/${sessionId}?limit=${limit}`;
    const response = await fetch(url, { method: 'GET' });
    return this._handleResponse(response);
  },

  // Get global statistics
  async getStats() {
    const response = await fetch(API_ENDPOINTS.GET_STATS, { method: 'GET' });
    return this._handleResponse(response);
  },

  // Health check
  async health() {
    const response = await fetch(API_ENDPOINTS.HEALTH, { method: 'GET' });
    return this._handleResponse(response);
  }
};

// Validate API URL is set
export const isApiConfigured = () => {
  return API_BASE_URL && 
         API_BASE_URL !== 'YOUR_NGROK_URL_HERE' &&
         API_BASE_URL !== 'https://your-ngrok-url-here.ngrok-free.dev' &&
         API_BASE_URL.startsWith('https://');
};

// Debug helper - logs current configuration
export const debugAPIConfig = () => {
  console.log('=== API Configuration Debug ===');
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('Is Configured:', isApiConfigured());
  console.log('Endpoints:', API_ENDPOINTS);
  console.log('==============================');
};

// Call this in browser console to debug: debugAPIConfig()