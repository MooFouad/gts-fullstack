// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Function to test server availability
const testServerConnection = async (port) => {
  try {
    const response = await fetch(`http://localhost:${port}/api/health`);
    if (response.ok) {
      return port;
    }
  } catch (error) {
    console.log(`Port ${port} not responding, trying next...`);
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
};

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    await initializeApi();
    
    const url = `${apiBaseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
      signal: AbortSignal.timeout(15000) // Increase timeout
    };

    try {
      console.log(`🔄 Request: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      if (response.status === 404) {
        console.error(`❌ Route not found: ${url}`);
        throw new Error(`API route not found: ${endpoint}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Response parsing error:', parseError);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        console.error(`❌ Server error:`, data);
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`❌ Request failed:`, err);
      throw err;
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