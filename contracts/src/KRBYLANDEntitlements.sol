// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Pausable} from "openzeppelin-contracts/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title KRBYLANDEntitlements
 * @notice ERC1155 with pause/unpause via ERC1155Pausable. Owner mints. No AccessControl roles (simpler).
 *         Uses OZ v5 hook layout. Includes the diamond-resolving _update override.
 */
contract KRBYLANDEntitlements is ERC1155, ERC1155Pausable, Ownable {
    // Optional metadata (many UIs like name/symbol on 1155s even though it's not standard)
    string public name;
    string public symbol;

    /// @param uri_    ERC1155 base URI (e.g., "ipfs://.../{id}.json")
    /// @param name_   Display name
    /// @param symbol_ Ticker-like symbol
    constructor(string memory uri_, string memory name_, string memory symbol_)
        ERC1155(uri_)
        Ownable(msg.sender) // OZ v5: pass initial owner
    {
        name = name_;
        symbol = symbol_;
    }

    // ---------------- Admin ----------------
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ---------------- Mint helpers (owner-only) ----------------
    function mint(address to, uint256 id, uint256 amount, bytes memory data)
        external
        onlyOwner
    {
        _mint(to, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        external
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    // ---------------- Internal override to resolve multiple inheritance ----------------
    // Both ERC1155 and ERC1155Pausable implement _update(...), so we provide a single override.
    // NOTE: Pausable's logic is inside ERC1155Pausable._update; we simply forward to super.
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    )
        internal
        override(ERC1155, ERC1155Pausable)
    {
        super._update(from, to, ids, amounts);
    }

    // ---------------- Interfaces ----------------
    // Only ERC1155 contributes an interface here; listing just ERC1155 is correct.
    function supportsInterface(bytes4 iid)
        public
        view
        override(ERC1155)
        returns (bool)
    {
        return super.supportsInterface(iid);
    }
}
