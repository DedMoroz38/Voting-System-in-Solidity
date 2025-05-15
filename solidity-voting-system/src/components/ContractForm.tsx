"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { saveContractAddress, getStoredContractAddress } from '../utils/contract';

interface ContractFormProps {
  onAddressChange: (address: string) => void;
}

export default function ContractForm({ onAddressChange }: ContractFormProps) {
  const [contractAddress, setContractAddress] = useState<string>('');

  useEffect(() => {
    // Load stored address on component mount
    const storedAddress = getStoredContractAddress();
    if (storedAddress) {
      setContractAddress(storedAddress);
      onAddressChange(storedAddress);
    }
  }, [onAddressChange]);

  const handleSaveAddress = () => {
    if (ethers.utils.isAddress(contractAddress)) {
      saveContractAddress(contractAddress);
      onAddressChange(contractAddress);
    } else {
      alert('Invalid Ethereum address format');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Contract Settings</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Enter contract address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleSaveAddress}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Address
        </button>
      </div>
    </div>
  );
}
