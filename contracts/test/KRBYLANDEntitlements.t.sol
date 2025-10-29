// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {KRBYLANDEntitlements} from "../src/KRBYLANDEntitlements.sol";

contract KRBYLANDEntitlementsTest is Test {
    KRBYLANDEntitlements ent;
    address admin    = address(0xA11CE);
    address minter   = address(0xBEEF);
    address alice    = address(0x1111);
    address bob      = address(0x2222);

    uint256 private minterPk = 0x1234; // test keypair
    address private minterEOA;

    function setUp() public {
        vm.startPrank(admin);
        ent = new KRBYLANDEntitlements("ipfs://base/{id}.json", admin);
        vm.stopPrank();

        // Grant MINTER to EOA from our local PK
        minterEOA = vm.addr(minterPk);
        vm.prank(admin);
        ent.grantRole(ent.MINTER_ROLE(), minterEOA);
    }

    function test_AdminHasRoles() public {
        assertTrue(ent.hasRole(ent.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(ent.hasRole(ent.ADMIN_ROLE(), admin));
    }

    function test_MintByMinter() public {
        vm.prank(minterEOA);
        ent.mint(alice, 1, 1);
        assertEq(ent.balanceOf(alice, 1), 1);
    }

    function test_SoulboundBlocksTransfers() public {
        // Mint transferable token id=100
        vm.prank(minterEOA);
        ent.mint(alice, 100, 1);

        // Make id=100 soulbound
        vm.prank(admin);
        ent.setSoulbound(100, true);

        // Attempt transfer (should revert)
        vm.prank(alice);
        vm.expectRevert(bytes("soulbound"));
        ent.safeTransferFrom(alice, bob, 100, 1, "");
    }

    function test_MintWithSig() public {
        // Prepare typed data for a claim: alice claims id=7, amount=2
        address to = alice;
        uint256 id = 7;
        uint256 amount = 2;
        uint256 nonce = 1;
        uint256 deadline = block.timestamp + 1 days;

        bytes32 digest = ent.getMintDigest(to, id, amount, nonce, deadline);

        // Sign with our MINTER EOA key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(minterPk, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        // Anyone can submit a valid voucher
        ent.mintWithSig(to, id, amount, nonce, deadline, sig);

        assertEq(ent.balanceOf(alice, id), amount);

        // Replays blocked
        vm.expectRevert(bytes("replay"));
        ent.mintWithSig(to, id, amount, nonce, deadline, sig);
    }
}
