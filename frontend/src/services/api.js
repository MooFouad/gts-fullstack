// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Function to test server availability
const testServerConnection = async (port) => {
  try {
    const response = await fetch(`http://localhost:${port}/api/health`);
    if (response.ok) {
      return port;
    }
  } catch (error) {
    console.log(`Port ${port} not responding, trying next...`);
    console.log(error)
  }
  return null;
};

// Find available server port
const findServerPort = async () => {
  const port = 5000;
  const available = await testServerConnection(port);
  if (available) {
    return `http://localhost:${port}/api`;
  }
  throw new Error('Could not connect to server on port 5000');
};

// Initialize API URL
let apiBaseUrl = API_BASE_URL;
let connectionAttempted = false;

const initializeApi = async () => {
  if (!connectionAttempted) {
    connectionAttempted = true;
    try {
      const url = await findServerPort();
      apiBaseUrl = url;
      console.log('Connected to server at:', url);
    } catch (error) {
      console.error('Server connection error:', error);
      apiBaseUrl = API_BASE_URL; // Fallback to default
    }
  }
}

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}, retryCount = 0) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error(`API Error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);

      // Check if it's a network error or abort
      if (error.name === 'AbortError') {
        console.error('Request timed out after 15 seconds');
      }

      if (retryCount < MAX_RETRIES - 1) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.request(endpoint, options, retryCount + 1);
      }

      throw new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`);
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

const api = new ApiService(API_BASE_URL);

export default api;