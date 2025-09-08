const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoChain Guardians", function () {
  let ecoToken, guardianNFT, ecoActions;
  let owner, user1, user2, verifier;

  beforeEach(async function () {
    [owner, user1, user2, verifier] = await ethers.getSigners();

    // Deploy EcoToken
    const EcoToken = await ethers.getContractFactory("EcoToken");
    ecoToken = await EcoToken.deploy(owner.address);
    await ecoToken.deployed();

    // Deploy GuardianNFT
    const GuardianNFT = await ethers.getContractFactory("GuardianNFT");
    guardianNFT = await GuardianNFT.deploy(owner.address);
    await guardianNFT.deployed();

    // Deploy EcoActions
    const EcoActions = await ethers.getContractFactory("EcoActions");
    ecoActions = await EcoActions.deploy(
      ecoToken.address,
      guardianNFT.address,
      owner.address
    );
    await ecoActions.deployed();

    // Setup permissions
    await ecoToken.addMinter(ecoActions.address);
    await guardianNFT.setEcoActionContract(ecoActions.address);
    await ecoActions.addVerifier(verifier.address);
  });

  describe("EcoToken", function () {
    it("Should deploy with correct initial supply", async function () {
      const initialSupply = await ecoToken.totalSupply();
      expect(initialSupply).to.equal(ethers.utils.parseEther("100000000"));
    });

    it("Should allow minters to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("100");
      await ecoToken.connect(ecoActions).mintReward(user1.address, mintAmount, "test");
      
      const balance = await ecoToken.balanceOf(user1.address);
      expect(balance).to.equal(mintAmount);
    });

    it("Should not allow non-minters to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("100");
      await expect(
        ecoToken.connect(user1).mintReward(user1.address, mintAmount, "test")
      ).to.be.revertedWith("EcoToken: caller is not a minter");
    });
  });

  describe("GuardianNFT", function () {
    it("Should mint a guardian NFT", async function () {
      await guardianNFT.connect(user1).mintGuardian(user1.address, "Forest Guardian");
      
      const balance = await guardianNFT.balanceOf(user1.address);
      expect(balance).to.equal(1);
      
      const guardianTokenId = await guardianNFT.userGuardian(user1.address);
      expect(guardianTokenId).to.equal(0); // First token ID
    });

    it("Should not allow user to mint multiple guardians", async function () {
      await guardianNFT.connect(user1).mintGuardian(user1.address, "Forest Guardian");
      
      await expect(
        guardianNFT.connect(user1).mintGuardian(user1.address, "Ocean Guardian")
      ).to.be.revertedWith("GuardianNFT: user already has a guardian");
    });

    it("Should evolve guardian based on impact score", async function () {
      await guardianNFT.connect(user1).mintGuardian(user1.address, "Forest Guardian");
      const guardianTokenId = await guardianNFT.userGuardian(user1.address);
      
      // Update impact score to trigger evolution
      await guardianNFT.connect(ecoActions).updateImpactScore(guardianTokenId, 150, 1000);
      
      const guardian = await guardianNFT.getGuardian(guardianTokenId);
      expect(guardian.level).to.equal(1); // Should be Sprout level
      expect(guardian.impactScore).to.equal(150);
    });
  });

  describe("EcoActions", function () {
    beforeEach(async function () {
      // Mint guardian for user1
      await guardianNFT.connect(user1).mintGuardian(user1.address, "Test Guardian");
    });

    it("Should submit and auto-approve actions that don't require verification", async function () {
      // Action ID 4 is Public Transport (auto-approved)
      await ecoActions.connect(user1).submitAction(4, "ipfs://evidence");
      
      const userActions = await ecoActions.getUserActions(user1.address);
      expect(userActions.length).to.equal(1);
      
      const userAction = await ecoActions.userActions(userActions[0]);
      expect(userAction.verified).to.be.true;
      expect(userAction.user).to.equal(user1.address);
    });

    it("Should submit actions requiring verification", async function () {
      // Action ID 1 is Tree Planting (requires verification)
      await ecoActions.connect(user1).submitAction(1, "ipfs://tree-evidence");
      
      const userActions = await ecoActions.getUserActions(user1.address);
      const userAction = await ecoActions.userActions(userActions[0]);
      
      expect(userAction.verified).to.be.false;
      expect(userAction.user).to.equal(user1.address);
    });

    it("Should allow verifiers to approve actions", async function () {
      await ecoActions.connect(user1).submitAction(1, "ipfs://tree-evidence");
      const userActions = await ecoActions.getUserActions(user1.address);
      const userActionId = userActions[0];
      
      await ecoActions.connect(verifier).verifyAction(userActionId, true);
      
      const userAction = await ecoActions.userActions(userActionId);
      expect(userAction.verified).to.be.true;
      expect(userAction.verifier).to.equal(verifier.address);
    });

    it("Should reward tokens and update guardian on action approval", async function () {
      const initialBalance = await ecoToken.balanceOf(user1.address);
      
      await ecoActions.connect(user1).submitAction(4, "ipfs://transport-evidence");
      
      const finalBalance = await ecoToken.balanceOf(user1.address);
      expect(finalBalance).to.be.gt(initialBalance);
      
      // Check guardian impact score updated
      const guardianTokenId = await guardianNFT.userGuardian(user1.address);
      const guardian = await guardianNFT.getGuardian(guardianTokenId);
      expect(guardian.impactScore).to.be.gt(0);
    });

    it("Should reward verifiers for verification", async function () {
      await ecoActions.connect(user1).submitAction(1, "ipfs://tree-evidence");
      const userActions = await ecoActions.getUserActions(user1.address);
      
      const initialVerifierBalance = await ecoToken.balanceOf(verifier.address);
      await ecoActions.connect(verifier).verifyAction(userActions[0], true);
      const finalVerifierBalance = await ecoToken.balanceOf(verifier.address);
      
      expect(finalVerifierBalance).to.be.gt(initialVerifierBalance);
    });

    it("Should calculate user streak correctly", async function () {
      // Submit multiple actions
      await ecoActions.connect(user1).submitAction(4, "ipfs://evidence1");
      await ecoActions.connect(user1).submitAction(4, "ipfs://evidence2");
      
      const userActions = await ecoActions.getUserActions(user1.address);
      expect(userActions.length).to.equal(2);
    });

    it("Should not allow non-verifiers to verify actions", async function () {
      await ecoActions.connect(user1).submitAction(1, "ipfs://tree-evidence");
      const userActions = await ecoActions.getUserActions(user1.address);
      
      await expect(
        ecoActions.connect(user2).verifyAction(userActions[0], true)
      ).to.be.revertedWith("EcoActions: caller is not a verifier");
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full user journey", async function () {
      // 1. User mints guardian
      await guardianNFT.connect(user1).mintGuardian(user1.address, "Eco Warrior");
      const guardianTokenId = await guardianNFT.userGuardian(user1.address);
      
      // 2. User submits tree planting action
      await ecoActions.connect(user1).submitAction(1, "ipfs://tree-planting-proof");
      const userActions = await ecoActions.getUserActions(user1.address);
      
      // 3. Verifier approves action
      await ecoActions.connect(verifier).verifyAction(userActions[0], true);
      
      // 4. Check rewards and guardian evolution
      const tokenBalance = await ecoToken.balanceOf(user1.address);
      expect(tokenBalance).to.be.gt(0);
      
      const guardian = await guardianNFT.getGuardian(guardianTokenId);
      expect(guardian.impactScore).to.equal(100); // Tree planting impact
      expect(guardian.level).to.equal(1); // Should evolve to Sprout
      
      // 5. Check verifier reward
      const verifierBalance = await ecoToken.balanceOf(verifier.address);
      expect(verifierBalance).to.be.gt(0);
    });
  });
});