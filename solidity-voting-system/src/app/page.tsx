"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import VotingStatus from '../components/VotingStatus';
import VotingForm from '../components/VotingForm';
import ContractForm from '../components/ContractForm';
import { connectWallet, getReadOnlyContract, getSigningContract } from '../utils/contract';

declare global {
  interface Window {
    ethereum?: {
      request: (request: { method: string; }) => Promise<any>;
      on: (eventName: string, callback: (accounts: string[]) => void) => void;
      removeListener: (eventName: string, callback: (accounts: string[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export default function Home() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [readContract, setReadContract] = useState<ethers.Contract | null>(null);
  const [writeContract, setWriteContract] = useState<ethers.Contract | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Function to connect wallet
  const handleConnectWallet = async () => {
    const { provider: web3Provider, signer: web3Signer, account: web3Account } = await connectWallet();
    setProvider(web3Provider);
    setSigner(web3Signer);
    setAccount(web3Account);
    
    // Set up account change listener
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
        handleRefresh();
      });
    }
  };

  // Handle contract address change
  const handleContractAddressChange = (address: string) => {
    setContractAddress(address);
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Initialize contracts when provider, signer or address changes
  useEffect(() => {
    if (!contractAddress) return;

    if (provider) {
      const readOnlyContract = getReadOnlyContract(contractAddress, provider);
      setReadContract(readOnlyContract);
    }

    if (signer) {
      const signingContract = getSigningContract(contractAddress, signer);
      setWriteContract(signingContract);
    }
  }, [provider, signer, contractAddress, refreshKey]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Blockchain Voting System</h1>
          <p className="text-gray-600 dark:text-gray-400">Vote securely on the blockchain</p>
        </header>
        
        <div className="mb-6">
          {!account ? (
            <button 
              onClick={handleConnectWallet}
              className="w-full sm:w-auto py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-colors"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-md mb-4">
              <p className="font-medium">Connected: {account}</p>
            </div>
          )}
        </div>
        
        <ContractForm onAddressChange={handleContractAddressChange} />
        
        {account && contractAddress && (
          <div key={refreshKey}>
            <VotingStatus contract={readContract} account={account} />
            <VotingForm 
              contract={writeContract} 
              account={account} 
              onVoteSuccess={handleRefresh} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
