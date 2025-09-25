'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthTokens } from '@/shared/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithWallet: (walletAddress: string, signature: string, message: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  walletAddress?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const walletAddress = localStorage.getItem('walletAddress');
      const signature = localStorage.getItem('walletSignature');
      const sessionTimestamp = localStorage.getItem('sessionTimestamp');
      
      if (walletAddress && signature && sessionTimestamp) {
        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - parseInt(sessionTimestamp);
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge < maxSessionAge) {
          // Restore user session
          const user: User = {
            _id: walletAddress,
            email: '',
            username: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
            walletAddress: walletAddress,
            isEmailVerified: false,
            createdAt: new Date(parseInt(sessionTimestamp)),
            updatedAt: new Date(),
            preferences: {
              notifications: {
                email: false,
                push: true,
                trading: true,
                aiSignals: true,
              },
              trading: {
                defaultSlippage: 0.5,
                autoApprove: false,
                riskLevel: 'medium' as const,
              },
              dashboard: {
                layout: [],
                theme: 'dark' as const,
              },
            },
            profile: {
              tradingExperience: 'intermediate' as const,
              riskTolerance: 5,
            },
          };
          setUser(user);
        } else {
          // Session expired, clear storage
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('walletSignature');
          localStorage.removeItem('sessionTimestamp');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const validateToken = async () => {
    // For Web3 auth, we don't need traditional token validation
    // The wallet signature serves as authentication
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) throw new Error('No wallet connected');
    
    return true;
  };

  // Legacy email/password login (kept for backward compatibility but not used in Web3 flow)
  const login = async (email: string, password: string) => {
    throw new Error('Email/password login not supported in Web3 mode. Please connect your wallet.');
  };

  const loginWithWallet = async (walletAddress: string, signature: string, message: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/wallet-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress, signature, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Wallet login failed');
      }

      const data = await response.json();
      
      // For Web3 auth, we create a minimal user profile based on wallet
      const user: User = {
        _id: data.user?._id || walletAddress,
        email: data.user?.email || '',
        username: data.user?.username || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        walletAddress: walletAddress,
        isEmailVerified: false,
        createdAt: data.user?.createdAt || new Date(),
        updatedAt: data.user?.updatedAt || new Date(),
        preferences: data.user?.preferences || {
          notifications: {
            email: false,
            push: true,
            trading: true,
            aiSignals: true,
          },
          trading: {
            defaultSlippage: 0.5,
            autoApprove: false,
            riskLevel: 'medium' as const,
          },
          dashboard: {
            layout: [],
            theme: 'dark' as const,
          },
        },
        profile: data.user?.profile || {
          tradingExperience: 'intermediate' as const,
          riskTolerance: 5,
        },
      };

      // Store wallet-based session
      localStorage.setItem('walletAddress', walletAddress);
      localStorage.setItem('walletSignature', signature);
      localStorage.setItem('sessionTimestamp', Date.now().toString());
      
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    throw new Error('Traditional registration not needed in Web3 mode. Just connect your wallet!');
  };

  const logout = () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletSignature');
    localStorage.removeItem('sessionTimestamp');
    setUser(null);
    router.push('/');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    // For Web3 auth, we store profile updates locally
    // In a full implementation, this could be stored on IPFS or a decentralized database
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    setUser(updatedUser);
    
    // Store in localStorage for persistence
    localStorage.setItem('userProfile', JSON.stringify(updatedUser));
  };

  const refreshToken = async () => {
    // For Web3 auth, we don't need token refresh
    // Sessions are managed by wallet connection state
    return;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithWallet,
    logout,
    register,
    updateProfile,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}