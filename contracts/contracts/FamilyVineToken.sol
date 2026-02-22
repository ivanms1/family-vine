// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * FamilyVine Token (VINE) - A soulbound (non-transferable) utility token.
 *
 * This token is earned by children completing educational lessons.
 * It cannot be traded, transferred, or converted to cash.
 * Only the contract owner (the FamilyVine server) can mint and burn tokens.
 */
contract FamilyVineToken is ERC20, Ownable {
    constructor() ERC20("FamilyVine Token", "VINE") Ownable(msg.sender) {}

    /// @notice Returns 0 decimals so on-chain balances match database integers exactly
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    /// @notice Mint tokens to a child's wallet. Only callable by the server wallet.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn tokens from a child's wallet. Only callable by the server wallet.
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    /// @notice Transfers are disabled. This token is soulbound.
    function transfer(address, uint256) public pure override returns (bool) {
        revert("VINE: transfers disabled");
    }

    /// @notice Transfers are disabled. This token is soulbound.
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("VINE: transfers disabled");
    }

    /// @notice Approvals are disabled. This token is soulbound.
    function approve(address, uint256) public pure override returns (bool) {
        revert("VINE: approvals disabled");
    }
}
