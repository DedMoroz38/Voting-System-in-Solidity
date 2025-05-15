import { ethers } from 'ethers';

export const contractABI = [
  {
    "inputs": [],
    "name": "getCandidates",
    "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "candidate", "type": "string" }],
    "name": "getVotes",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "hasVoted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "candidate", "type": "string" }],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingEnded",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export type Web3Provider = ethers.providers.Web3Provider;
export type Contract = ethers.Contract;

// Get a contract instance that can be used for read operations
export const getReadOnlyContract = (
  contractAddress: string,
  provider: ethers.providers.Provider
): ethers.Contract | null => {
  if (!contractAddress || !provider) return null;
  
  try {
    return new ethers.Contract(contractAddress, contractABI, provider);
  } catch (error) {
    console.error('Error getting read-only contract:', error);
    return null;
  }
};

// Get a contract instance that can perform write operations
export const getSigningContract = (
  contractAddress: string,
  signer: ethers.Signer
): ethers.Contract | null => {
  if (!contractAddress || !signer) return null;
  
  try {
    return new ethers.Contract(contractAddress, contractABI, signer);
  } catch (error) {
    console.error('Error getting signing contract:', error);
    return null;
  }
};

// Connect to MetaMask wallet
export const connectWallet = async (): Promise<{
  provider: Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
}> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('MetaMask is not installed!');
    return { provider: null, signer: null, account: null };
  }

  try {
    // Request access to account
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create Web3Provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Check if connected to Sepolia testnet (chain ID: 11155111)
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111) {
      try {
        // Prompt user to switch to Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], 
        });
        
        // Re-initialize provider after network switch
        const updatedProvider = new ethers.providers.Web3Provider(window.ethereum);
        const updatedSigner = updatedProvider.getSigner();
        return { provider: updatedProvider, signer: updatedSigner, account: accounts[0] };
      } catch (switchError) {
        console.error('Failed to switch to the Sepolia network:', switchError);
        return { provider: null, signer: null, account: null };
      }
    }

    const signer = provider.getSigner();
    const account = accounts[0];
    
    return { provider, signer, account };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    return { provider: null, signer: null, account: null };
  }
};

// Helper function to save contract address to localStorage
export const saveContractAddress = (address: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('votingContractAddress', address);
  }
};

// Helper function to get stored contract address
export const getStoredContractAddress = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('votingContractAddress') || '';
  }
  return '';
};
