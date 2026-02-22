/**
 * Minimal ABI for the FamilyVineToken (VINE) soulbound ERC-20 contract.
 * Only includes the functions the server needs to call.
 * Full ABI is in contracts/artifacts/ after compilation.
 */
export const FAMILYVINE_TOKEN_ABI = [
  'function mint(address to, uint256 amount) external',
  'function burn(address from, uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function owner() external view returns (address)',
] as const;
