import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ethers } from 'ethers';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const key = process.env.WALLET_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('WALLET_ENCRYPTION_KEY is not set');
  }
  return Buffer.from(key, 'hex');
}

export interface GeneratedWallet {
  address: string;
  encryptedKey: string;
  encryptionIV: string;
  encryptionTag: string;
}

export const cryptoService = {
  generateWallet(): GeneratedWallet {
    const wallet = ethers.Wallet.createRandom();
    const privateKey = wallet.privateKey;

    const key = getEncryptionKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
      address: wallet.address,
      encryptedKey: encrypted,
      encryptionIV: iv.toString('hex'),
      encryptionTag: tag.toString('hex'),
    };
  },

  decryptPrivateKey(
    encryptedKey: string,
    encryptionIV: string,
    encryptionTag: string
  ): string {
    const key = getEncryptionKey();
    const iv = Buffer.from(encryptionIV, 'hex');
    const tag = Buffer.from(encryptionTag, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  },
};
