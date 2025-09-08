const { ethers } = require("hardhat");

async function main() {
  console.log("🌱 Deploying EcoChain Guardians contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy EcoToken
  console.log("\n📄 Deploying EcoToken...");
  const EcoToken = await ethers.getContractFactory("EcoToken");
  const ecoToken = await EcoToken.deploy(deployer.address);
  await ecoToken.deployed();
  console.log("✅ EcoToken deployed to:", ecoToken.address);

  // Deploy GuardianNFT
  console.log("\n🛡️ Deploying GuardianNFT...");
  const GuardianNFT = await ethers.getContractFactory("GuardianNFT");
  const guardianNFT = await GuardianNFT.deploy(deployer.address);
  await guardianNFT.deployed();
  console.log("✅ GuardianNFT deployed to:", guardianNFT.address);

  // Deploy EcoActions
  console.log("\n🌍 Deploying EcoActions...");
  const EcoActions = await ethers.getContractFactory("EcoActions");
  const ecoActions = await EcoActions.deploy(
    ecoToken.address,
    guardianNFT.address,
    deployer.address
  );
  await ecoActions.deployed();
  console.log("✅ EcoActions deployed to:", ecoActions.address);

  // Setup permissions
  console.log("\n🔧 Setting up permissions...");
  
  // Add EcoActions as minter for EcoToken
  await ecoToken.addMinter(ecoActions.address);
  console.log("✅ EcoActions added as EcoToken minter");
  
  // Set EcoActions contract in GuardianNFT
  await guardianNFT.setEcoActionContract(ecoActions.address);
  console.log("✅ EcoActions contract set in GuardianNFT");
  
  // Add deployer as verifier for testing
  await ecoActions.addVerifier(deployer.address);
  console.log("✅ Deployer added as verifier");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("EcoToken:", ecoToken.address);
  console.log("GuardianNFT:", guardianNFT.address);
  console.log("EcoActions:", ecoActions.address);
  
  console.log("\n🔗 Verification commands:");
  console.log(`npx hardhat verify --network ${network.name} ${ecoToken.address} "${deployer.address}"`);
  console.log(`npx hardhat verify --network ${network.name} ${guardianNFT.address} "${deployer.address}"`);
  console.log(`npx hardhat verify --network ${network.name} ${ecoActions.address} "${ecoToken.address}" "${guardianNFT.address}" "${deployer.address}"`);

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      EcoToken: ecoToken.address,
      GuardianNFT: guardianNFT.address,
      EcoActions: ecoActions.address
    },
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    `deployments-${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n💾 Deployment info saved to deployments-${network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });