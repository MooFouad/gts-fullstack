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
        ...options.headers,
      },
      ...options,
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    };

    try {
      console.log(`🔄 Making API request to: ${endpoint}`);
      console.log('Request config:', {
        method: options.method,
        url,
        body: options.body ? JSON.parse(options.body) : undefined
      });

      const response = await fetch(url, config);
      const responseData = await response.json().catch(() => ({
        message: `Server responded with status ${response.status}`
      }));
      
      if (!response.ok) {
        console.error('Server error response:', responseData);
        throw new Error(responseData.error || responseData.message || `Server error: ${response.status}`);
      }

      console.log(`✅ API request successful:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, {
        message: error.message,
        name: error.name,
        endpoint,
        requestBody: options.body
      });
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.');
      }
      
      throw error; // Preserve the original error
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