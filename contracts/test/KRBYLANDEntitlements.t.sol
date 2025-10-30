// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {KRBYLANDEntitlements} from "../src/KRBYLANDEntitlements.sol";

contract KRBYLANDEntitlementsTest is Test {
    // Import the custom errors used by OpenZeppelin v5 Ownable and Pausable
    error OwnableUnauthorizedAccount(address account);
    error EnforcedPause();

    KRBYLANDEntitlements ent;
    address owner = address(this);
    address alice = address(0xA11CE); 
    address bob   = address(0xB0B);
    uint256 id = 1;

    function setUp() public {
        // Initialize the contract, 'address(this)' is the owner
        ent = new KRBYLANDEntitlements(
            "ipfs://base/{id}.json",
            "KRBYLAND Entitlements",
            "KENT"
        );
        
        // owner mints to alice
        ent.mint(alice, id, 10, "");
    }

    // Recommended best practice: use 'view' for constant checks
    function test_Metadata() public view { 
        assertEq(ent.name(), "KRBYLAND Entitlements");
        assertEq(ent.symbol(), "KENT");
    }

    function test_Transfer_WhenNotPaused() public {
        vm.prank(alice);
        ent.safeTransferFrom(alice, bob, id, 1, "");
        assertEq(ent.balanceOf(bob, id), 1);
        assertEq(ent.balanceOf(alice, id), 9);
    }

    function test_Pause_BlocksTransfers() public {
        ent.pause();
        vm.prank(alice);
        // FIX: Expect the custom error EnforcedPause()
        vm.expectRevert(EnforcedPause.selector); 
        ent.safeTransferFrom(alice, bob, id, 1, "");
    }

    function test_Unpause_AllowsTransfersAgain() public {
        ent.pause();
        ent.unpause();
        vm.prank(alice);
        ent.safeTransferFrom(alice, bob, id, 1, "");
        assertEq(ent.balanceOf(bob, id), 1);
    }

    function test_OnlyOwnerCanMint() public {
        vm.prank(alice);
        // FIX: Expect the custom error OwnableUnauthorizedAccount(address)
        vm.expectRevert(abi.encodeWithSelector(OwnableUnauthorizedAccount.selector, alice)); 
        ent.mint(alice, id, 1, "");
    }

    function test_BatchMint_OwnerOnly() public {
        // Correct array initialization and assignment with indexes
        uint256[] memory ids = new uint256[](2);
        ids[0] = 2;
        ids[1] = 3;
        
        uint256[] memory amts = new uint256[](2);
        amts[0] = 5;
        amts[1] = 7;
        
        // Minting is done by the test contract (the owner) by default.
        ent.mintBatch(alice, ids, amts, "");
        
        assertEq(ent.balanceOf(alice, 2), 5);
        assertEq(ent.balanceOf(alice, 3), 7);
    }
}