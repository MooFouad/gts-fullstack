const API_TIMEOUT = 15000; // 15 seconds timeout

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
      signal: AbortSignal.timeout(API_TIMEOUT)
    };

    try {
      console.log(`🔄 Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      if (!navigator.onLine) {
        throw new Error('No internet connection - please check your network');
      }
      console.error(`API Request failed for ${endpoint}:`, err);
      throw new Error(`Network error: ${err.message}`);
    }
  }
}