import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying FamilyVineToken with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'ETH');

  const FamilyVineToken = await ethers.getContractFactory('FamilyVineToken');
  const token = await FamilyVineToken.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log('FamilyVineToken deployed to:', address);
  console.log('');
  console.log('Next steps:');
  console.log(`1. Add to .env: FAMILYVINE_TOKEN_CONTRACT_ADDRESS=${address}`);
  console.log(`2. Add to .env: SERVER_WALLET_PRIVATE_KEY=${process.env.DEPLOYER_PRIVATE_KEY}`);
  console.log(`3. Verify on Basescan: npx hardhat verify --network <network> ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
