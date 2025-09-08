const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Contract ABIs
const EcoTokenABI = require('../abis/EcoToken.json');
const GuardianNFTABI = require('../abis/GuardianNFT.json');
const EcoActionsABI = require('../abis/EcoActions.json');

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.contractAddresses = {
      EcoToken: process.env.ECO_TOKEN_ADDRESS,
      GuardianNFT: process.env.GUARDIAN_NFT_ADDRESS,
      EcoActions: process.env.ECO_ACTIONS_ADDRESS
    };
    
    this.initialize();
  }

  async initialize() {
    try {
      // Initialize provider
      const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize signer if private key is provided
      if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        logger.info(`Contract service initialized with signer: ${this.signer.address}`);
      } else {
        logger.warn('No private key provided, contracts will be read-only');
      }

      // Initialize contracts
      await this.initializeContracts();
      
      logger.info('Contract service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize contract service:', error);
      throw error;
    }
  }

  async initializeContracts() {
    const contractConfigs = [
      { name: 'EcoToken', abi: EcoTokenABI },
      { name: 'GuardianNFT', abi: GuardianNFTABI },
      { name: 'EcoActions', abi: EcoActionsABI }
    ];

    for (const config of contractConfigs) {
      const address = this.contractAddresses[config.name];
      if (address) {
        try {
          const signerOrProvider = this.signer || this.provider;
          this.contracts[config.name] = new ethers.Contract(
            address,
            config.abi,
            signerOrProvider
          );
          logger.info(`${config.name} contract initialized at ${address}`);
        } catch (error) {
          logger.error(`Failed to initialize ${config.name} contract:`, error);
        }
      } else {
        logger.warn(`No address provided for ${config.name} contract`);
      }
    }
  }

  getContract(contractName) {
    const contract = this.contracts[contractName];
    if (!contract) {
      throw new Error(`Contract ${contractName} not found or not initialized`);
    }
    return contract;
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }

  // EcoToken specific methods
  async getEcoTokenBalance(address) {
    try {
      const contract = this.getContract('EcoToken');
      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Error getting ECO token balance:', error);
      throw error;
    }
  }

  async getTotalSupply() {
    try {
      const contract = this.getContract('EcoToken');
      const supply = await contract.totalSupply();
      return ethers.formatEther(supply);
    } catch (error) {
      logger.error('Error getting total supply:', error);
      throw error;
    }
  }

  // GuardianNFT specific methods
  async getGuardianData(tokenId) {
    try {
      const contract = this.getContract('GuardianNFT');
      const guardian = await contract.getGuardian(tokenId);
      return {
        level: guardian.level,
        impactScore: guardian.impactScore.toString(),
        birthTime: guardian.birthTime.toString(),
        name: guardian.name,
        carbonOffset: guardian.carbonOffset.toString(),
        achievements: guardian.achievements
      };
    } catch (error) {
      logger.error('Error getting guardian data:', error);
      throw error;
    }
  }

  async getUserGuardian(address) {
    try {
      const contract = this.getContract('GuardianNFT');
      const tokenId = await contract.userGuardian(address);
      return tokenId.toString();
    } catch (error) {
      logger.error('Error getting user guardian:', error);
      throw error;
    }
  }

  // EcoActions specific methods
  async getUserActions(address) {
    try {
      const contract = this.getContract('EcoActions');
      const actionIds = await contract.getUserActions(address);
      return actionIds.map(id => id.toString());
    } catch (error) {
      logger.error('Error getting user actions:', error);
      throw error;
    }
  }

  async getActionDetails(actionId) {
    try {
      const contract = this.getContract('EcoActions');
      const action = await contract.ecoActions(actionId);
      return {
        actionType: action.actionType,
        impactScore: action.impactScore.toString(),
        tokenReward: action.tokenReward.toString(),
        carbonOffset: action.carbonOffset.toString(),
        requiresVerification: action.requiresVerification,
        isActive: action.isActive
      };
    } catch (error) {
      logger.error('Error getting action details:', error);
      throw error;
    }
  }

  async getUserActionDetails(userActionId) {
    try {
      const contract = this.getContract('EcoActions');
      const action = await contract.userActions(userActionId);
      return {
        actionId: action.actionId.toString(),
        user: action.user,
        timestamp: action.timestamp.toString(),
        evidence: action.evidence,
        verified: action.verified,
        verifier: action.verifier,
        impactScore: action.impactScore.toString(),
        tokenReward: action.tokenReward.toString()
      };
    } catch (error) {
      logger.error('Error getting user action details:', error);
      throw error;
    }
  }

  async getUserTotalImpact(address) {
    try {
      const contract = this.getContract('EcoActions');
      const impact = await contract.userTotalImpact(address);
      return impact.toString();
    } catch (error) {
      logger.error('Error getting user total impact:', error);
      throw error;
    }
  }

  // Event listening methods
  setupEventListeners() {
    try {
      // Listen for Guardian minting events
      const guardianContract = this.getContract('GuardianNFT');
      guardianContract.on('GuardianMinted', (owner, tokenId, name, event) => {
        logger.info(`Guardian minted: ${name} (ID: ${tokenId}) for ${owner}`);
        // Handle guardian minting event (e.g., update database, send notifications)
      });

      // Listen for Guardian evolution events
      guardianContract.on('GuardianEvolved', (tokenId, newLevel, event) => {
        logger.info(`Guardian ${tokenId} evolved to level ${newLevel}`);
        // Handle guardian evolution event
      });

      // Listen for action submission events
      const actionsContract = this.getContract('EcoActions');
      actionsContract.on('ActionSubmitted', (userActionId, user, actionId, event) => {
        logger.info(`Action submitted: ${actionId} by ${user} (ID: ${userActionId})`);
        // Handle action submission event
      });

      // Listen for reward claim events
      actionsContract.on('RewardClaimed', (user, amount, impactScore, event) => {
        logger.info(`Reward claimed: ${ethers.formatEther(amount)} ECO by ${user}`);
        // Handle reward claim event
      });

      logger.info('Event listeners set up successfully');
    } catch (error) {
      logger.error('Error setting up event listeners:', error);
    }
  }

  // Utility methods
  async getBlockNumber() {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error('Error getting block number:', error);
      throw error;
    }
  }

  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice;
    } catch (error) {
      logger.error('Error getting gas price:', error);
      throw error;
    }
  }

  async estimateGas(contract, method, params = []) {
    try {
      const gasEstimate = await contract[method].estimateGas(...params);
      return gasEstimate.toString();
    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const blockNumber = await this.getBlockNumber();
      const contractsStatus = {};
      
      for (const [name, contract] of Object.entries(this.contracts)) {
        try {
          // Try to call a simple view function to test contract connectivity
          if (name === 'EcoToken') {
            await contract.totalSupply();
          } else if (name === 'GuardianNFT') {
            await contract.name();
          } else if (name === 'EcoActions') {
            await contract.nextActionId();
          }
          contractsStatus[name] = 'healthy';
        } catch (error) {
          contractsStatus[name] = 'unhealthy';
          logger.error(`Contract ${name} health check failed:`, error);
        }
      }

      return {
        provider: 'healthy',
        blockNumber,
        contracts: contractsStatus,
        signer: this.signer ? this.signer.address : null
      };
    } catch (error) {
      logger.error('Contract service health check failed:', error);
      return {
        provider: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Create singleton instance
const contractService = new ContractService();

// Export convenience functions
module.exports = {
  getContractInstance: (contractName) => contractService.getContract(contractName),
  getProvider: () => contractService.getProvider(),
  getSigner: () => contractService.getSigner(),
  getEcoTokenBalance: (address) => contractService.getEcoTokenBalance(address),
  getGuardianData: (tokenId) => contractService.getGuardianData(tokenId),
  getUserGuardian: (address) => contractService.getUserGuardian(address),
  getUserActions: (address) => contractService.getUserActions(address),
  getUserTotalImpact: (address) => contractService.getUserTotalImpact(address),
  setupEventListeners: () => contractService.setupEventListeners(),
  contractHealthCheck: () => contractService.healthCheck(),
  contractService
};