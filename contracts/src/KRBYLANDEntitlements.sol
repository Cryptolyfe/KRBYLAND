// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title KRBYLAND Entitlements/Passes (OZ v5)
/// @notice Single source of truth for roles/passes/badges used by KRBYLAND.
/// @dev Uses OZ v5 hooks (_update) and proper supportsInterface override.
contract KRBYLANDEntitlements is ERC1155, AccessControl, Pausable, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant ADMIN_ROLE  = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Per-ID config
    mapping(uint256 => bool) public soulbound;  // true => non-transferable
    mapping(uint256 => string) private _uriFor; // optional per-ID URI override

    // EIP-712 typed mint
    bytes32 private constant MINT_TYPEHASH =
        keccak256("Mint(address to,uint256 id,uint256 amount,uint256 nonce,uint256 deadline)");

    mapping(bytes32 => bool) public consumed; // digest -> used

    constructor(string memory baseURI, address admin)
        ERC1155(baseURI)
        EIP712("KRBYLAND-Entitlements", "1")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    // -------- Admin --------

    function setSoulbound(uint256 id, bool isSoulbound) external onlyRole(ADMIN_ROLE) {
        soulbound[id] = isSoulbound;
    }

    function setURI(uint256 id, string calldata newUri) external onlyRole(ADMIN_ROLE) {
        _uriFor[id] = newUri;
        emit URI(newUri, id);
    }

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    // -------- Minting --------

    /// @notice Direct mint by MINTER
    function mint(address to, uint256 id, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, id, amount, "");
    }

    /// @notice Signed mint (allowlist/claim). Signer must have MINTER_ROLE.
    function mintWithSig(
        address to,
        uint256 id,
        uint256 amount,
        uint256 nonce,
        uint256 deadline,
        bytes calldata sig
    ) external whenNotPaused {
        require(block.timestamp <= deadline, "expired");
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(MINT_TYPEHASH, to, id, amount, nonce, deadline))
        );
        require(!consumed[digest], "replay");
        address signer = ECDSA.recover(digest, sig);
        require(hasRole(MINTER_ROLE, signer), "bad-signer");
        consumed[digest] = true;
        _mint(to, id, amount, "");
    }

    // -------- Views / Helpers --------

    function uri(uint256 id) public view override returns (string memory) {
        string memory u = _uriFor[id];
        return bytes(u).length > 0 ? u : super.uri(id);
    }

    /// @notice Helper for tests/clients to compute the EIP-712 digest to sign.
    function getMintDigest(
        address to, uint256 id, uint256 amount, uint256 nonce, uint256 deadline
    ) external view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(abi.encode(MINT_TYPEHASH, to, id, amount, nonce, deadline))
        );
    }

    // -------- ERC165 / Interface support --------

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // -------- Transfers (OZ v5 uses _update instead of _beforeTokenTransfer) --------

    /// @dev Block transfers of soulbound ids; allow mint (from=0) and burn (to=0).
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155) whenNotPaused {
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                if (soulbound[ids[i]]) revert("soulbound");
            }
        }
        super._update(from, to, ids, amounts, data);
    }
}
