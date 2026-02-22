/**
 * One-time script to mint existing token balances on-chain.
 * Requires: FAMILYVINE_TOKEN_CONTRACT_ADDRESS, SERVER_WALLET_PRIVATE_KEY, BASE_RPC_URL
 * Run with: pnpm tsx scripts/sync-balances-to-chain.ts
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { ethers } from 'ethers';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ABI = [
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
];

async function main() {
  const contractAddress = process.env.FAMILYVINE_TOKEN_CONTRACT_ADDRESS;
  const serverKey = process.env.SERVER_WALLET_PRIVATE_KEY;
  const rpcUrl = process.env.BASE_RPC_URL;

  if (!contractAddress || !serverKey || !rpcUrl) {
    console.error('Missing required env vars: FAMILYVINE_TOKEN_CONTRACT_ADDRESS, SERVER_WALLET_PRIVATE_KEY, BASE_RPC_URL');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(serverKey, provider);
  const contract = new ethers.Contract(contractAddress, ABI, wallet);

  console.log('Syncing existing balances to chain...\n');
  console.log('Server wallet:', wallet.address);
  console.log('Contract:', contractAddress);
  console.log('');

  const children = await prisma.childProfile.findMany({
    where: {
      tokenBalance: { gt: 0 },
      wallet: { isNot: null },
    },
    include: { wallet: true },
  });

  console.log(`Found ${children.length} children with balances to sync\n`);

  for (const child of children) {
    if (!child.wallet) continue;

    const onChainBalance = await contract.balanceOf(child.wallet.address);
    const dbBalance = BigInt(child.tokenBalance);

    if (onChainBalance >= dbBalance) {
      console.log(`  ${child.displayName}: already synced (on-chain: ${onChainBalance}, db: ${dbBalance})`);
      continue;
    }

    const toMint = dbBalance - onChainBalance;
    console.log(`  ${child.displayName}: minting ${toMint} tokens to ${child.wallet.address}...`);

    try {
      const tx = await contract.mint(child.wallet.address, toMint);
      const receipt = await tx.wait();
      console.log(`    TX: ${receipt.hash}`);
    } catch (err) {
      console.error(`    Failed: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log('\nDone!');
  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
