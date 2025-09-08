'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Contract ABIs (simplified for demo)
const EcoTokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const GuardianNFTABI = [
  "function mintGuardian(address to, string memory guardianName) returns (uint256)",
  "function userGuardian(address user) view returns (uint256)",
  "function getGuardian(uint256 tokenId) view returns (tuple(uint8 level, uint256 impactScore, uint256 birthTime, string name, uint256 carbonOffset, string[] achievements))",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event GuardianMinted(address indexed owner, uint256 indexed tokenId, string name)",
  "event GuardianEvolved(uint256 indexed tokenId, uint8 newLevel)"
];

const EcoActionsABI = [
  "function submitAction(uint256 actionId, string memory evidence)",
  "function verifyAction(uint256 userActionId, bool approved)",
  "function getUserActions(address user) view returns (uint256[])",
  "function userActions(uint256 actionId) view returns (tuple(uint256 actionId, address user, uint256 timestamp, string evidence, bool verified, address verifier, uint256 impactScore, uint256 tokenReward))",
  "function ecoActions(uint256 actionId) view returns (tuple(uint8 actionType, uint256 impactScore, uint256 tokenReward, uint256 carbonOffset, bool requiresVerification, bool isActive))",
  "function userTotalImpact(address user) view returns (uint256)",
  "event ActionSubmitted(uint256 indexed userActionId, address indexed user, uint256 actionId)",
  "event RewardClaimed(address indexed user, uint256 amount, uint256 impactScore)"
];

interface Web3ContextType {
  // Connection state
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnecting: boolean;
  
  // Contracts
  ecoToken: ethers.Contract | null;
  guardianNFT: ethers.Contract | null;
  ecoActions: ethers.Contract | null;
  
  // User data
  ecoBalance: string;
  guardianTokenId: number | null;
  guardianData: any;
  userActions: any[];
  totalImpact: string;
  
  // Functions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

// Contract addresses (will be set from environment)
const CONTRACT_ADDRESSES = {
  ECO_TOKEN: process.env.NEXT_PUBLIC_ECO_TOKEN_ADDRESS || '',
  GUARDIAN_NFT: process.env.NEXT_PUBLIC_GUARDIAN_NFT_ADDRESS || '',
  ECO_ACTIONS: process.env.NEXT_PUBLIC_ECO_ACTIONS_ADDRESS || ''
};

const SUPPORTED_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337');

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Contracts
  const [ecoToken, setEcoToken] = useState<ethers.Contract | null>(null);
  const [guardianNFT, setGuardianNFT] = useState<ethers.Contract | null>(null);
  const [ecoActions, setEcoActions] = useState<ethers.Contract | null>(null);
  
  // User data
  const [ecoBalance, setEcoBalance] = useState('0');
  const [guardianTokenId, setGuardianTokenId] = useState<number | null>(null);
  const [guardianData, setGuardianData] = useState(null);
  const [userActions, setUserActions] = useState<any[]>([]);
  const [totalImpact, setTotalImpact] = useState('0');

  // Initialize contracts when signer is available
  useEffect(() => {
    if (signer && CONTRACT_ADDRESSES.ECO_TOKEN) {
      try {
        const ecoTokenContract = new ethers.Contract(CONTRACT_ADDRESSES.ECO_TOKEN, EcoTokenABI, signer);
        const guardianNFTContract = new ethers.Contract(CONTRACT_ADDRESSES.GUARDIAN_NFT, GuardianNFTABI, signer);
        const ecoActionsContract = new ethers.Contract(CONTRACT_ADDRESSES.ECO_ACTIONS, EcoActionsABI, signer);
        
        setEcoToken(ecoTokenContract);
        setGuardianNFT(guardianNFTContract);
        setEcoActions(ecoActionsContract);
      } catch (error) {
        console.error('Error initializing contracts:', error);
      }
    }
  }, [signer]);

  // Refresh user data when account or contracts change
  useEffect(() => {
    if (account && ecoToken && guardianNFT && ecoActions) {
      refreshUserData();
    }
  }, [account, ecoToken, guardianNFT, ecoActions]);

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(accounts[0].address);
          setChainId(Number(network.chainId));
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('Please install MetaMask to continue');
      return;
    }

    setIsConnecting(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      
      // Check if on correct network
      if (Number(network.chainId) !== SUPPORTED_CHAIN_ID) {
        await switchNetwork();
      }
      
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setEcoToken(null);
    setGuardianNFT(null);
    setEcoActions(null);
    
    // Reset user data
    setEcoBalance('0');
    setGuardianTokenId(null);
    setGuardianData(null);
    setUserActions([]);
    setTotalImpact('0');
    
    toast.success('Wallet disconnected');
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SUPPORTED_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SUPPORTED_CHAIN_ID.toString(16)}`,
              chainName: 'Localhost 8545',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['http://localhost:8545'],
            }],
          });
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Failed to add network');
        }
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network');
      }
    }
  };

  const refreshUserData = async () => {
    if (!account || !ecoToken || !guardianNFT || !ecoActions) return;
    
    try {
      // Get ECO token balance
      const balance = await ecoToken.balanceOf(account);
      setEcoBalance(ethers.formatEther(balance));
      
      // Get Guardian NFT data
      const tokenId = await guardianNFT.userGuardian(account);
      if (tokenId > 0) {
        setGuardianTokenId(Number(tokenId));
        const guardian = await guardianNFT.getGuardian(tokenId);
        setGuardianData(guardian);
      }
      
      // Get user actions
      const actionIds = await ecoActions.getUserActions(account);
      const actions = await Promise.all(
        actionIds.map(async (id: any) => {
          const action = await ecoActions.userActions(id);
          return { id: Number(id), ...action };
        })
      );
      setUserActions(actions);
      
      // Get total impact
      const impact = await ecoActions.userTotalImpact(account);
      setTotalImpact(impact.toString());
      
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        window.location.reload(); // Reload to reset state
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const value: Web3ContextType = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    ecoToken,
    guardianNFT,
    ecoActions,
    ecoBalance,
    guardianTokenId,
    guardianData,
    userActions,
    totalImpact,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshUserData,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}