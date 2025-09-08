const axios = require('axios');
const FormData = require('form-data');
const logger = require('../utils/logger');

class IPFSService {
  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_API_KEY;
    this.pinataBaseUrl = 'https://api.pinata.cloud';
    this.gatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  }

  /**
   * Upload JSON data to IPFS via Pinata
   */
  async uploadJSON(data, metadata = {}) {
    try {
      const response = await axios.post(
        `${this.pinataBaseUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: data,
          pinataMetadata: {
            name: metadata.name || 'EcoChain Guardian Data',
            keyvalues: {
              type: metadata.type || 'action-evidence',
              timestamp: new Date().toISOString(),
              ...metadata.keyvalues
            }
          },
          pinataOptions: {
            cidVersion: 1
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      logger.info(`JSON uploaded to IPFS: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    } catch (error) {
      logger.error('Error uploading JSON to IPFS:', error.response?.data || error.message);
      throw new Error('Failed to upload to IPFS');
    }
  }

  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(fileBuffer, filename, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, filename);
      
      const pinataMetadata = JSON.stringify({
        name: metadata.name || filename,
        keyvalues: {
          type: metadata.type || 'file',
          timestamp: new Date().toISOString(),
          ...metadata.keyvalues
        }
      });
      
      formData.append('pinataMetadata', pinataMetadata);
      
      const pinataOptions = JSON.stringify({
        cidVersion: 1
      });
      
      formData.append('pinataOptions', pinataOptions);

      const response = await axios.post(
        `${this.pinataBaseUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      logger.info(`File uploaded to IPFS: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    } catch (error) {
      logger.error('Error uploading file to IPFS:', error.response?.data || error.message);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  /**
   * Retrieve data from IPFS
   */
  async getData(ipfsHash) {
    try {
      const response = await axios.get(`${this.gatewayUrl}${ipfsHash}`, {
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving data from IPFS (${ipfsHash}):`, error.message);
      throw new Error('Failed to retrieve data from IPFS');
    }
  }

  /**
   * Pin existing content by hash
   */
  async pinByHash(ipfsHash, metadata = {}) {
    try {
      const response = await axios.post(
        `${this.pinataBaseUrl}/pinning/pinByHash`,
        {
          hashToPin: ipfsHash,
          pinataMetadata: {
            name: metadata.name || `Pinned content ${ipfsHash}`,
            keyvalues: {
              type: metadata.type || 'pinned-content',
              timestamp: new Date().toISOString(),
              ...metadata.keyvalues
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      logger.info(`Content pinned: ${ipfsHash}`);
      return response.data;
    } catch (error) {
      logger.error('Error pinning content:', error.response?.data || error.message);
      throw new Error('Failed to pin content');
    }
  }

  /**
   * Unpin content from IPFS
   */
  async unpin(ipfsHash) {
    try {
      const response = await axios.delete(
        `${this.pinataBaseUrl}/pinning/unpin/${ipfsHash}`,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      logger.info(`Content unpinned: ${ipfsHash}`);
      return response.data;
    } catch (error) {
      logger.error('Error unpinning content:', error.response?.data || error.message);
      throw new Error('Failed to unpin content');
    }
  }

  /**
   * List pinned content
   */
  async listPinned(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.pageLimit) params.append('pageLimit', filters.pageLimit);
      if (filters.pageOffset) params.append('pageOffset', filters.pageOffset);
      if (filters.metadata) {
        Object.entries(filters.metadata).forEach(([key, value]) => {
          params.append(`metadata[keyvalues][${key}]`, value);
        });
      }

      const response = await axios.get(
        `${this.pinataBaseUrl}/data/pinList?${params.toString()}`,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error listing pinned content:', error.response?.data || error.message);
      throw new Error('Failed to list pinned content');
    }
  }

  /**
   * Get IPFS URL for a hash
   */
  getUrl(ipfsHash) {
    return `${this.gatewayUrl}${ipfsHash}`;
  }

  /**
   * Test IPFS connection
   */
  async testConnection() {
    try {
      const testData = {
        message: 'EcoChain Guardians IPFS Test',
        timestamp: new Date().toISOString()
      };

      const hash = await this.uploadJSON(testData, {
        name: 'IPFS Connection Test',
        type: 'test'
      });

      const retrievedData = await this.getData(hash);
      
      if (retrievedData.message === testData.message) {
        logger.info('IPFS connection test successful');
        return { success: true, hash };
      } else {
        throw new Error('Data mismatch in IPFS test');
      }
    } catch (error) {
      logger.error('IPFS connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const ipfsService = new IPFSService();

// Export convenience functions
module.exports = {
  uploadToIPFS: (data, metadata) => ipfsService.uploadJSON(data, metadata),
  uploadFileToIPFS: (fileBuffer, filename, metadata) => ipfsService.uploadFile(fileBuffer, filename, metadata),
  getFromIPFS: (hash) => ipfsService.getData(hash),
  pinContent: (hash, metadata) => ipfsService.pinByHash(hash, metadata),
  unpinContent: (hash) => ipfsService.unpin(hash),
  listPinnedContent: (filters) => ipfsService.listPinned(filters),
  getIPFSUrl: (hash) => ipfsService.getUrl(hash),
  testIPFSConnection: () => ipfsService.testConnection(),
  ipfsService
};