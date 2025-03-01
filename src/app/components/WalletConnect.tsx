"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';

function WalletConnect({ onConnect }: { onConnect: () => void }) {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        onConnect(); // Notify layout that connection occurred
      } catch (error) {
        console.error('Wallet connection error:', error);
      }
    } else {
      console.error('Please install MetaMask or another compatible wallet.');
    }
  };

  // Truncate wallet address to show only the first 5 and last 4 characters
  const truncatedAddress = account ? `${account.slice(0, 5)}...${account.slice(-4)}` : '';

  return (
    <div>
      {account ? (
        <span className="text-white">{truncatedAddress}</span>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default WalletConnect;