// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title EcoToken
 * @dev The native utility token for EcoChain Guardians platform
 * Users earn ECO tokens by completing verified environmental actions
 */
contract EcoToken is ERC20, ERC20Burnable, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    mapping(address => bool) public minters;
    mapping(address => uint256) public lastRewardTime;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event EcoReward(address indexed user, uint256 amount, string action);
    
    modifier onlyMinter() {
        require(minters[msg.sender], "EcoToken: caller is not a minter");
        _;
    }
    
    constructor(address initialOwner) ERC20("EcoToken", "ECO") Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Add a new minter (typically the Guardian contract)
     */
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mint tokens as reward for environmental actions
     */
    function mintReward(address to, uint256 amount, string memory action) 
        external 
        onlyMinter 
        whenNotPaused 
    {
        require(totalSupply() + amount <= MAX_SUPPLY, "EcoToken: max supply exceeded");
        require(to != address(0), "EcoToken: mint to zero address");
        
        _mint(to, amount);
        lastRewardTime[to] = block.timestamp;
        
        emit EcoReward(to, amount, action);
    }
    
    /**
     * @dev Pause token transfers (emergency function)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to add pause functionality
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Get user's reward streak (days since last reward)
     */
    function getRewardStreak(address user) external view returns (uint256) {
        if (lastRewardTime[user] == 0) return 0;
        return (block.timestamp - lastRewardTime[user]) / 1 days;
    }
}