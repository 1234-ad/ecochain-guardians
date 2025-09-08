// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GuardianNFT
 * @dev Evolving NFTs that represent environmental guardians
 * NFTs level up based on user's environmental impact score
 */
contract GuardianNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    enum GuardianLevel { Seedling, Sprout, Sapling, YoungTree, MatureTree, AncientTree }
    
    struct Guardian {
        GuardianLevel level;
        uint256 impactScore;
        uint256 birthTime;
        string name;
        uint256 carbonOffset;
        string[] achievements;
    }
    
    mapping(uint256 => Guardian) public guardians;
    mapping(address => uint256) public userGuardian;
    mapping(GuardianLevel => string) public levelMetadata;
    
    address public ecoActionContract;
    
    event GuardianMinted(address indexed owner, uint256 indexed tokenId, string name);
    event GuardianEvolved(uint256 indexed tokenId, GuardianLevel newLevel);
    event AchievementUnlocked(uint256 indexed tokenId, string achievement);
    
    modifier onlyEcoAction() {
        require(msg.sender == ecoActionContract, "GuardianNFT: caller is not eco action contract");
        _;
    }
    
    constructor(address initialOwner) ERC721("EcoChain Guardian", "GUARDIAN") Ownable(initialOwner) {
        // Set initial metadata URIs for each level
        levelMetadata[GuardianLevel.Seedling] = "ipfs://QmSeedlingMetadata";
        levelMetadata[GuardianLevel.Sprout] = "ipfs://QmSproutMetadata";
        levelMetadata[GuardianLevel.Sapling] = "ipfs://QmSaplingMetadata";
        levelMetadata[GuardianLevel.YoungTree] = "ipfs://QmYoungTreeMetadata";
        levelMetadata[GuardianLevel.MatureTree] = "ipfs://QmMatureTreeMetadata";
        levelMetadata[GuardianLevel.AncientTree] = "ipfs://QmAncientTreeMetadata";
    }
    
    /**
     * @dev Mint a new Guardian NFT for a user
     */
    function mintGuardian(address to, string memory guardianName) external returns (uint256) {
        require(userGuardian[to] == 0, "GuardianNFT: user already has a guardian");
        require(bytes(guardianName).length > 0, "GuardianNFT: name cannot be empty");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        
        guardians[tokenId] = Guardian({
            level: GuardianLevel.Seedling,
            impactScore: 0,
            birthTime: block.timestamp,
            name: guardianName,
            carbonOffset: 0,
            achievements: new string[](0)
        });
        
        userGuardian[to] = tokenId;
        _setTokenURI(tokenId, levelMetadata[GuardianLevel.Seedling]);
        
        emit GuardianMinted(to, tokenId, guardianName);
        return tokenId;
    }
    
    /**
     * @dev Update guardian's impact score and potentially evolve
     */
    function updateImpactScore(uint256 tokenId, uint256 newScore, uint256 carbonAdded) 
        external 
        onlyEcoAction 
    {
        require(_exists(tokenId), "GuardianNFT: token does not exist");
        
        Guardian storage guardian = guardians[tokenId];
        guardian.impactScore = newScore;
        guardian.carbonOffset += carbonAdded;
        
        GuardianLevel newLevel = _calculateLevel(newScore);
        
        if (newLevel > guardian.level) {
            guardian.level = newLevel;
            _setTokenURI(tokenId, levelMetadata[newLevel]);
            emit GuardianEvolved(tokenId, newLevel);
        }
    }
    
    /**
     * @dev Add achievement to guardian
     */
    function addAchievement(uint256 tokenId, string memory achievement) 
        external 
        onlyEcoAction 
    {
        require(_exists(tokenId), "GuardianNFT: token does not exist");
        
        guardians[tokenId].achievements.push(achievement);
        emit AchievementUnlocked(tokenId, achievement);
    }
    
    /**
     * @dev Calculate guardian level based on impact score
     */
    function _calculateLevel(uint256 impactScore) internal pure returns (GuardianLevel) {
        if (impactScore >= 10000) return GuardianLevel.AncientTree;
        if (impactScore >= 5000) return GuardianLevel.MatureTree;
        if (impactScore >= 2000) return GuardianLevel.YoungTree;
        if (impactScore >= 500) return GuardianLevel.Sapling;
        if (impactScore >= 100) return GuardianLevel.Sprout;
        return GuardianLevel.Seedling;
    }
    
    /**
     * @dev Set the eco action contract address
     */
    function setEcoActionContract(address _ecoActionContract) external onlyOwner {
        ecoActionContract = _ecoActionContract;
    }
    
    /**
     * @dev Update level metadata URI
     */
    function updateLevelMetadata(GuardianLevel level, string memory metadataURI) 
        external 
        onlyOwner 
    {
        levelMetadata[level] = metadataURI;
    }
    
    /**
     * @dev Get guardian details
     */
    function getGuardian(uint256 tokenId) 
        external 
        view 
        returns (
            GuardianLevel level,
            uint256 impactScore,
            uint256 birthTime,
            string memory name,
            uint256 carbonOffset,
            string[] memory achievements
        ) 
    {
        require(_exists(tokenId), "GuardianNFT: token does not exist");
        Guardian memory guardian = guardians[tokenId];
        return (
            guardian.level,
            guardian.impactScore,
            guardian.birthTime,
            guardian.name,
            guardian.carbonOffset,
            guardian.achievements
        );
    }
    
    // Override required functions
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}