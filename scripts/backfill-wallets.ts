/**
 * Backfill wallets for existing families and children.
 * Run with: pnpm tsx scripts/backfill-wallets.ts
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Inline wallet generation to avoid import issues with tsx
import { createCipheriv, randomBytes } from 'crypto';
import { ethers } from 'ethers';

function generateWallet() {
  const wallet = ethers.Wallet.createRandom();
  const key = Buffer.from(process.env.WALLET_ENCRYPTION_KEY!, 'hex');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(wallet.privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    address: wallet.address,
    encryptedKey: encrypted,
    encryptionIV: iv.toString('hex'),
    encryptionTag: tag.toString('hex'),
  };
}

async function main() {
  console.log('Backfilling wallets...\n');

  // Family wallets
  const familiesWithoutWallet = await prisma.familyProfile.findMany({
    where: { wallet: null },
  });

  console.log(`Found ${familiesWithoutWallet.length} families without wallets`);

  for (const family of familiesWithoutWallet) {
    const wallet = generateWallet();
    await prisma.wallet.create({
      data: {
        ...wallet,
        familyProfileId: family.id,
      },
    });
    console.log(`  Created wallet for family "${family.familyName}": ${wallet.address}`);
  }

  // Child wallets
  const childrenWithoutWallet = await prisma.childProfile.findMany({
    where: { wallet: null },
  });

  console.log(`\nFound ${childrenWithoutWallet.length} children without wallets`);

  for (const child of childrenWithoutWallet) {
    const wallet = generateWallet();
    await prisma.wallet.create({
      data: {
        ...wallet,
        childProfileId: child.id,
      },
    });
    console.log(`  Created wallet for child "${child.displayName}": ${wallet.address}`);
  }

  console.log('\nDone!');
  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
