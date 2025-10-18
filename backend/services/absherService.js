const axios = require('axios');

/**
 * TAMM API Service (Absher Business)
 * Handles authentication and vehicle insurance inquiries
 * All configuration is read from environment variables for security
 */
class TammService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;

    // Read config from environment variables
    this.config = {
      authUrl: process.env.TAMM_AUTH_URL,
      apiUrl: process.env.TAMM_API_URL,
      clientId: process.env.TAMM_CLIENT_ID,
      clientSecret: process.env.TAMM_CLIENT_SECRET
    };

    console.log('🔧 Absher Service initialized with config from environment variables');
    console.log(`   Auth URL: ${this.config.authUrl || 'NOT SET'}`);
    console.log(`   API URL: ${this.config.apiUrl || 'NOT SET'}`);
    console.log(`   Client ID: ${this.config.clientId ? '***' + this.config.clientId.slice(-4) : 'NOT SET'}`);
  }

  /**
   * Get TAMM configuration from environment variables
   */
  getConfig() {
    if (!this.config.authUrl || !this.config.apiUrl || !this.config.clientId || !this.config.clientSecret) {
      throw new Error('TAMM configuration is incomplete. Please check environment variables (TAMM_AUTH_URL, TAMM_API_URL, TAMM_CLIENT_ID, TAMM_CLIENT_SECRET)');
    }
    return this.config;
  }

  /**
   * Generate Access Token from TAMM API
   * POST /auth/realms/Tamm-QA/protocol/openid-connect/token
   */
  async generateAccessToken() {
    try {
      const config = this.getConfig();

      // Check if we have a valid token already
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        console.log('✅ Using cached access token');
        return this.accessToken;
      }

      console.log('🔄 Generating new TAMM access token...');

      const params = new URLSearchParams();
      params.append('client_id', config.clientId);
      params.append('client_secret', config.clientSecret);
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(config.authUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      });

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;

        // Set token expiry (usually expires_in is in seconds)
        const expiresIn = response.data.expires_in || 3600; // Default 1 hour
        this.tokenExpiry = new Date(Date.now() + (expiresIn * 1000) - 60000); // Refresh 1 minute before expiry

        console.log('✅ Access token generated successfully');
        console.log(`⏰ Token expires in ${expiresIn} seconds`);

        return this.accessToken;
      } else {
        throw new Error('Invalid response from TAMM auth server');
      }
    } catch (error) {
      console.error('❌ Error generating access token:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error(`Failed to authenticate with TAMM API: ${error.message}`);
    }
  }

  /**
   * Get Vehicle Insurance Details from TAMM API
   * POST /api/v1/inquiry/vehicle-insurance
   * @param {string} plateNumber - Vehicle plate number
   * @param {number} searchType - Search type (default 0)
   */
  async getVehicleInsuranceDetails(plateNumber, searchType = 0) {
    try {
      console.log('\n' + '='.repeat(80));
      console.log(`🔍 ABSHER API CALL - Fetching insurance details`);
      console.log('='.repeat(80));
      console.log(`📋 Input Plate Number: ${plateNumber}`);
      console.log(`📋 Input Type:`, typeof plateNumber);

      const config = this.getConfig();
      const accessToken = await this.generateAccessToken();

      // TAMM API endpoint for vehicle insurance
      const apiUrl = `${config.apiUrl}/api/v1/inquiry/vehicle-insurance`;

      // Prepare plate object based on the documentation
      // Parse plate number string (e.g., "أ م ح 9459") into structured format
      let plateData;
      if (typeof plateNumber === 'string') {
        const parts = plateNumber.trim().split(/\s+/);
        if (parts.length >= 4) {
          plateData = {
            plate: {
              text1: parts[0],
              text2: parts[1],
              text3: parts[2],
              number: parseInt(parts[3]) || parts[3]
            },
            searchType: searchType
          };
        } else {
          plateData = {
            plate: plateNumber,
            searchType: searchType
          };
        }
      } else {
        plateData = {
          plate: plateNumber,
          searchType: searchType
        };
      }

      console.log(`📤 API URL: ${apiUrl}`);
      console.log(`📦 Request Body:`, JSON.stringify(plateData, null, 2));

      console.log(`🚀 Sending request to Absher API...`);

      const response = await axios.post(apiUrl, plateData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log(`✅ Response received from Absher API`);
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📦 Response Headers:`, JSON.stringify(response.headers, null, 2));

      if (response.data) {
        console.log(`✅ Successfully fetched insurance details`);
        console.log('📦 RAW ABSHER API RESPONSE:');
        console.log('='.repeat(80));
        console.log(JSON.stringify(response.data, null, 2));
        console.log('='.repeat(80));

        const parsedData = this.parseInsuranceData(response.data, plateNumber);
        console.log('📋 PARSED VEHICLE DATA:');
        console.log(JSON.stringify(parsedData, null, 2));
        console.log('='.repeat(80) + '\n');

        return parsedData;
      } else {
        throw new Error('Empty response from TAMM API');
      }
    } catch (error) {
      console.error('\n' + '❌'.repeat(40));
      console.error(`❌ ERROR FETCHING VEHICLE INSURANCE`);
      console.error('❌'.repeat(40));
      console.error(`Error Message: ${error.message}`);

      if (error.response) {
        console.error(`Response Status: ${error.response.status}`);
        console.error(`Response Headers:`, JSON.stringify(error.response.headers, null, 2));
        console.error(`Response Data:`, JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error(`Request was made but no response received`);
        console.error(`Request details:`, error.request);
      } else {
        console.error(`Error details:`, error);
      }
      console.error('❌'.repeat(40) + '\n');
      throw error;
    }
  }

  /**
   * Get MVPI (Vehicle Inspection) Details from TAMM API
   * POST /api/v1/inquiry/mvpi/latest-inspection
   * @param {string} plateNumber - Vehicle plate number
   * @param {number} searchType - Search type (default 0)
   */
  async getMVPIDetails(plateNumber, searchType = 0) {
    try {
      console.log(`🔍 Fetching MVPI details for vehicle: ${plateNumber}`);

      const config = this.getConfig();
      const accessToken = await this.generateAccessToken();

      // TAMM API endpoint for MVPI
      const apiUrl = `${config.apiUrl}/api/v1/inquiry/mvpi/latest-inspection`;

      const plateData = {
        plate: plateNumber,
        searchType: searchType
      };

      console.log(`📤 Sending request to: ${apiUrl}`);

      const response = await axios.post(apiUrl, plateData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data) {
        console.log(`✅ Successfully fetched MVPI details`);
        console.log('📦 Raw MVPI Response:', JSON.stringify(response.data, null, 2));
        return response.data;
      } else {
        throw new Error('Empty response from TAMM API');
      }
    } catch (error) {
      console.error(`❌ Error fetching MVPI details:`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  /**
   * Parse and map TAMM API insurance response to our Vehicle model format
   */
  parseInsuranceData(tammData, originalPlate) {
    try {
      // Based on the documentation, the response has a 'list' array
      const insuranceList = tammData.list || [];
      const firstInsurance = insuranceList[0] || {};

      return {
        // Keep original plate number
        plateNumber: originalPlate.text1 && originalPlate.text2 && originalPlate.text3 && originalPlate.number
          ? `${originalPlate.text1} ${originalPlate.text2} ${originalPlate.text3} ${originalPlate.number}`
          : originalPlate,

        // Insurance details from TAMM API
        insuranceCompany: firstInsurance.insuranceCompanyName || null,
        insurancePolicyNumber: firstInsurance.mainPolicyNumber || null,
        insuranceExpiryDate: this.parseDate(firstInsurance.policyEndDate),
        insuranceStatus: firstInsurance.policyStatus || null,

        // Metadata
        lastSyncDate: new Date(),
        dataSource: 'absher'
      };
    } catch (error) {
      console.error('Error parsing TAMM insurance data:', error);
      throw new Error('Failed to parse vehicle data from TAMM response');
    }
  }

  /**
   * Parse date from various formats
   */
  parseDate(dateString) {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch (error) {
      console.error('Error parsing date:', dateString);
      return null;
    }
  }

  /**
   * Test connection to TAMM API
   */
  async testConnection() {
    try {
      console.log('🧪 Testing TAMM API connection...');
      const token = await this.generateAccessToken();

      if (token) {
        console.log('✅ TAMM API connection test successful');
        return { success: true, message: 'Connection successful', token: token.substring(0, 20) + '...' };
      } else {
        throw new Error('Failed to obtain access token');
      }
    } catch (error) {
      console.error('❌ TAMM API connection test failed:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Clear cached token (useful when credentials are updated)
   */
  clearCache() {
    this.accessToken = null;
    this.tokenExpiry = null;
    console.log('🗑️ Token cache cleared');
  }
}

module.exports = new TammService();
