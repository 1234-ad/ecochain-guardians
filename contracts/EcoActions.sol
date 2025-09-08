// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./EcoToken.sol";
import "./GuardianNFT.sol";

/**
 * @title EcoActions
 * @dev Core contract for tracking and rewarding environmental actions
 */
contract EcoActions is Ownable, ReentrancyGuard, Pausable {
    EcoToken public ecoToken;
    GuardianNFT public guardianNFT;
    
    enum ActionType { 
        TreePlanting, 
        SolarInstall, 
        WasteReduction, 
        PublicTransport, 
        EnergyEfficiency,
        WaterConservation,
        Recycling,
        CarbonOffset
    }
    
    struct EcoAction {
        ActionType actionType;
        uint256 impactScore;
        uint256 tokenReward;
        uint256 carbonOffset; // in grams of CO2
        bool requiresVerification;
        bool isActive;
    }
    
    struct UserAction {
        uint256 actionId;
        address user;
        uint256 timestamp;
        string evidence; // IPFS hash
        bool verified;
        address verifier;
        uint256 impactScore;
        uint256 tokenReward;
    }
    
    mapping(uint256 => EcoAction) public ecoActions;
    mapping(address => bool) public verifiers;
    mapping(uint256 => UserAction) public userActions;
    mapping(address => uint256[]) public userActionHistory;
    mapping(address => uint256) public userTotalImpact;
    
    uint256 public nextActionId = 1;
    uint256 public nextUserActionId = 1;
    uint256 public verificationReward = 10 * 10**18; // 10 ECO tokens
    
    event ActionCreated(uint256 indexed actionId, ActionType actionType, uint256 impactScore);
    event ActionSubmitted(uint256 indexed userActionId, address indexed user, uint256 actionId);
    event ActionVerified(uint256 indexed userActionId, address indexed verifier, bool approved);
    event RewardClaimed(address indexed user, uint256 amount, uint256 impactScore);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    
    modifier onlyVerifier() {
        require(verifiers[msg.sender], "EcoActions: caller is not a verifier");
        _;
    }
    
    constructor(
        address _ecoToken,
        address _guardianNFT,
        address initialOwner
    ) Ownable(initialOwner) {
        ecoToken = EcoToken(_ecoToken);
        guardianNFT = GuardianNFT(_guardianNFT);
        
        // Initialize default eco actions
        _createDefaultActions();
    }
    
    /**
     * @dev Create a new eco action type
     */
    function createEcoAction(
        ActionType actionType,
        uint256 impactScore,
        uint256 tokenReward,
        uint256 carbonOffset,
        bool requiresVerification
    ) external onlyOwner {
        ecoActions[nextActionId] = EcoAction({
            actionType: actionType,
            impactScore: impactScore,
            tokenReward: tokenReward,
            carbonOffset: carbonOffset,
            requiresVerification: requiresVerification,
            isActive: true
        });
        
        emit ActionCreated(nextActionId, actionType, impactScore);
        nextActionId++;
    }
    
    /**
     * @dev Submit an eco action for verification/reward
     */
    function submitAction(uint256 actionId, string memory evidence) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        require(ecoActions[actionId].isActive, "EcoActions: action not active");
        
        userActions[nextUserActionId] = UserAction({
            actionId: actionId,
            user: msg.sender,
            timestamp: block.timestamp,
            evidence: evidence,
            verified: false,
            verifier: address(0),
            impactScore: 0,
            tokenReward: 0
        });
        
        userActionHistory[msg.sender].push(nextUserActionId);
        
        emit ActionSubmitted(nextUserActionId, msg.sender, actionId);
        
        // Auto-approve actions that don't require verification
        if (!ecoActions[actionId].requiresVerification) {
            _approveAction(nextUserActionId, address(this));
        }
        
        nextUserActionId++;
    }
    
    /**
     * @dev Verify a submitted action
     */
    function verifyAction(uint256 userActionId, bool approved) 
        external 
        onlyVerifier 
        whenNotPaused 
    {
        UserAction storage userAction = userActions[userActionId];
        require(!userAction.verified, "EcoActions: action already verified");
        require(userAction.user != address(0), "EcoActions: action does not exist");
        
        if (approved) {
            _approveAction(userActionId, msg.sender);
            
            // Reward verifier
            ecoToken.mintReward(msg.sender, verificationReward, "verification");
        }
        
        userAction.verified = true;
        userAction.verifier = msg.sender;
        
        emit ActionVerified(userActionId, msg.sender, approved);
    }
    
    /**
     * @dev Internal function to approve and reward action
     */
    function _approveAction(uint256 userActionId, address verifier) internal {
        UserAction storage userAction = userActions[userActionId];
        EcoAction memory ecoAction = ecoActions[userAction.actionId];
        
        // Calculate rewards with potential multipliers
        uint256 impactScore = ecoAction.impactScore;
        uint256 tokenReward = ecoAction.tokenReward;
        
        // Apply streak multiplier
        uint256 streak = _getUserStreak(userAction.user);
        if (streak >= 7) {
            impactScore = (impactScore * 120) / 100; // 20% bonus
            tokenReward = (tokenReward * 120) / 100;
        }
        
        userAction.impactScore = impactScore;
        userAction.tokenReward = tokenReward;
        
        // Update user's total impact
        userTotalImpact[userAction.user] += impactScore;
        
        // Mint reward tokens
        ecoToken.mintReward(userAction.user, tokenReward, _getActionName(ecoAction.actionType));
        
        // Update Guardian NFT if user has one
        uint256 guardianTokenId = guardianNFT.userGuardian(userAction.user);
        if (guardianTokenId > 0) {
            guardianNFT.updateImpactScore(
                guardianTokenId, 
                userTotalImpact[userAction.user],
                ecoAction.carbonOffset
            );
        }
        
        emit RewardClaimed(userAction.user, tokenReward, impactScore);
    }
    
    /**
     * @dev Add a verifier
     */
    function addVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }
    
    /**
     * @dev Remove a verifier
     */
    function removeVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }
    
    /**
     * @dev Get user's action streak (consecutive days with actions)
     */
    function _getUserStreak(address user) internal view returns (uint256) {
        uint256[] memory actions = userActionHistory[user];
        if (actions.length == 0) return 0;
        
        uint256 streak = 1;
        uint256 lastDay = userActions[actions[actions.length - 1]].timestamp / 1 days;
        
        for (uint256 i = actions.length - 1; i > 0; i--) {
            uint256 currentDay = userActions[actions[i - 1]].timestamp / 1 days;
            if (lastDay - currentDay == 1) {
                streak++;
                lastDay = currentDay;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    /**
     * @dev Get action type name
     */
    function _getActionName(ActionType actionType) internal pure returns (string memory) {
        if (actionType == ActionType.TreePlanting) return "Tree Planting";
        if (actionType == ActionType.SolarInstall) return "Solar Installation";
        if (actionType == ActionType.WasteReduction) return "Waste Reduction";
        if (actionType == ActionType.PublicTransport) return "Public Transport";
        if (actionType == ActionType.EnergyEfficiency) return "Energy Efficiency";
        if (actionType == ActionType.WaterConservation) return "Water Conservation";
        if (actionType == ActionType.Recycling) return "Recycling";
        return "Carbon Offset";
    }
    
    /**
     * @dev Create default eco actions
     */
    function _createDefaultActions() internal {
        // Tree Planting - High impact, requires verification
        ecoActions[1] = EcoAction(ActionType.TreePlanting, 100, 50 * 10**18, 22000, true, true);
        
        // Solar Panel Installation - Very high impact, requires verification
        ecoActions[2] = EcoAction(ActionType.SolarInstall, 500, 250 * 10**18, 100000, true, true);
        
        // Waste Reduction - Medium impact, auto-approved
        ecoActions[3] = EcoAction(ActionType.WasteReduction, 25, 15 * 10**18, 5000, false, true);
        
        // Public Transport - Low impact, auto-approved
        ecoActions[4] = EcoAction(ActionType.PublicTransport, 10, 5 * 10**18, 2000, false, true);
        
        // Energy Efficiency - Medium impact, requires verification
        ecoActions[5] = EcoAction(ActionType.EnergyEfficiency, 75, 40 * 10**18, 15000, true, true);
        
        nextActionId = 6;
    }
    
    /**
     * @dev Get user's action history
     */
    function getUserActions(address user) external view returns (uint256[] memory) {
        return userActionHistory[user];
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}