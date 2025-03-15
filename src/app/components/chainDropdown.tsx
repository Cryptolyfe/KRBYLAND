
"use client";

import React, { useState } from "react";

interface ChainInfo {
  key: string;
  chainName: string;
}

interface ChainDropdownProps {
  chains: ChainInfo[];
  selected: string;
  onSelect: (chainKey: string) => void;
}

export default function ChainDropdown({ chains, selected, onSelect }: ChainDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedChainName = chains.find((c) => c.key === selected)?.chainName || "Select Chain";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`
          px-2 py-1 
          text-xs 
          text-white
          border-2 border-white 
          rounded-full 
          bg-transparent 
          transition-colors 
          cursor-pointer
          hover:bg-gradient-to-r 
          hover:from-pink-500 
          hover:to-yellow-500 
          hover:text-transparent 
          hover:bg-clip-text
        `}
      >
        {selectedChainName}
      </button>

      {open && (
        <div className="absolute mt-2 w-40 border border-white rounded bg-black text-white z-10">
          {chains.map((chain) => (
            <div
              key={chain.key}
              onClick={() => {
                onSelect(chain.key);
                setOpen(false);
              }}
              className="px-3 py-1 cursor-pointer
                         hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500
                         hover:text-transparent hover:bg-clip-text"
            >
              {chain.chainName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
