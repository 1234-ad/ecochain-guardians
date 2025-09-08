const express = require('express');
const { body, validationResult } = require('express-validator');
const { ethers } = require('ethers');
const router = express.Router();

const logger = require('../utils/logger');
const { uploadToIPFS } = require('../services/ipfsService');
const { verifySignature } = require('../middleware/auth');
const { getContractInstance } = require('../services/contractService');

// Get all available eco actions
router.get('/', async (req, res) => {
  try {
    const ecoActionsContract = getContractInstance('EcoActions');
    const actions = [];
    
    // Get actions 1-10 (predefined actions)
    for (let i = 1; i <= 10; i++) {
      try {
        const action = await ecoActionsContract.ecoActions(i);
        if (action.isActive) {
          actions.push({
            id: i,
            actionType: action.actionType,
            impactScore: action.impactScore.toString(),
            tokenReward: action.tokenReward.toString(),
            carbonOffset: action.carbonOffset.toString(),
            requiresVerification: action.requiresVerification,
            isActive: action.isActive
          });
        }
      } catch (error) {
        // Action doesn't exist, continue
        break;
      }
    }

    res.json({
      success: true,
      data: actions
    });
  } catch (error) {
    logger.error('Error fetching actions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch actions'
    });
  }
});

// Submit an eco action
router.post('/submit', [
  verifySignature,
  body('actionId').isInt({ min: 1 }).withMessage('Valid action ID is required'),
  body('evidence').optional().isString().isLength({ max: 1000 }).withMessage('Evidence must be a string with max 1000 characters'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { actionId, evidence, metadata } = req.body;
    const userAddress = req.user.address;

    // Get action details
    const ecoActionsContract = getContractInstance('EcoActions');
    const action = await ecoActionsContract.ecoActions(actionId);
    
    if (!action.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Action is not active'
      });
    }

    // Upload evidence to IPFS if provided
    let ipfsHash = '';
    if (evidence || metadata) {
      const evidenceData = {
        evidence: evidence || '',
        metadata: metadata || {},
        timestamp: Date.now(),
        userAddress,
        actionId
      };
      
      ipfsHash = await uploadToIPFS(JSON.stringify(evidenceData));
    }

    // Submit action to blockchain
    const tx = await ecoActionsContract.submitAction(actionId, ipfsHash || 'No evidence provided');
    
    logger.info(`Action submitted: ${tx.hash} by ${userAddress}`);

    res.json({
      success: true,
      data: {
        transactionHash: tx.hash,
        actionId,
        ipfsHash,
        requiresVerification: action.requiresVerification
      }
    });
  } catch (error) {
    logger.error('Error submitting action:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit action'
    });
  }
});

// Get user's action history
router.get('/history/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address'
      });
    }

    const ecoActionsContract = getContractInstance('EcoActions');
    const actionIds = await ecoActionsContract.getUserActions(address);
    
    const actions = [];
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + parseInt(limit), actionIds.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const actionId = actionIds[i];
      const action = await ecoActionsContract.userActions(actionId);
      
      actions.push({
        id: actionId.toString(),
        actionId: action.actionId.toString(),
        user: action.user,
        timestamp: action.timestamp.toString(),
        evidence: action.evidence,
        verified: action.verified,
        verifier: action.verifier,
        impactScore: action.impactScore.toString(),
        tokenReward: action.tokenReward.toString()
      });
    }

    res.json({
      success: true,
      data: {
        actions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: actionIds.length,
          totalPages: Math.ceil(actionIds.length / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching action history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch action history'
    });
  }
});

// Get pending actions for verification
router.get('/pending', [verifySignature], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // This would typically query a database of pending actions
    // For now, we'll return a mock response
    const pendingActions = [
      {
        id: '1',
        actionId: '1',
        user: '0x1234567890123456789012345678901234567890',
        actionType: 0,
        evidence: 'ipfs://QmExample',
        timestamp: Math.floor(Date.now() / 1000),
        submittedAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        actions: pendingActions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: pendingActions.length,
          totalPages: Math.ceil(pendingActions.length / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching pending actions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending actions'
    });
  }
});

// Verify an action (for verifiers)
router.post('/verify', [
  verifySignature,
  body('userActionId').isInt({ min: 1 }).withMessage('Valid user action ID is required'),
  body('approved').isBoolean().withMessage('Approved status is required'),
  body('comments').optional().isString().isLength({ max: 500 }).withMessage('Comments must be a string with max 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userActionId, approved, comments } = req.body;
    const verifierAddress = req.user.address;

    const ecoActionsContract = getContractInstance('EcoActions');
    
    // Check if user is a verifier
    const isVerifier = await ecoActionsContract.verifiers(verifierAddress);
    if (!isVerifier) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to verify actions'
      });
    }

    // Verify the action
    const tx = await ecoActionsContract.verifyAction(userActionId, approved);
    
    logger.info(`Action ${userActionId} ${approved ? 'approved' : 'rejected'} by ${verifierAddress}`);

    res.json({
      success: true,
      data: {
        transactionHash: tx.hash,
        userActionId,
        approved,
        verifier: verifierAddress
      }
    });
  } catch (error) {
    logger.error('Error verifying action:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify action'
    });
  }
});

// Get action statistics
router.get('/stats', async (req, res) => {
  try {
    // This would typically query a database for aggregated stats
    // For now, we'll return mock data
    const stats = {
      totalActions: 15847,
      totalImpactScore: 2847392,
      totalCarbonOffset: 184729, // in grams
      totalRewardsDistributed: '1847392.50', // in ECO tokens
      actionsByType: {
        treePlanting: 5847,
        solarInstall: 1293,
        wasteReduction: 3847,
        publicTransport: 2847,
        energyEfficiency: 1847,
        waterConservation: 166
      },
      recentActivity: {
        last24h: 47,
        last7d: 329,
        last30d: 1847
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching action stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch action statistics'
    });
  }
});

module.exports = router;