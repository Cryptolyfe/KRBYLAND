"use client";

import React, { useState, useEffect } from "react";

interface ResetViewButtonProps {
  onReset: () => void;
}

const ResetViewButton: React.FC<ResetViewButtonProps> = ({ onReset }) => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    // For example, show the reset button after 5 seconds.
    const timer = setTimeout(() => {
      setVisible(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => {
        onReset();
        setVisible(false);
      }}
      className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg hover:bg-gray-700 transition-colors"
    >
      Reset View
    </button>
  );
};

export default ResetViewButton;
