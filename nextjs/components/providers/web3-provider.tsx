'use client';

import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia, polygon, polygonMumbai } from '@reown/appkit/networks';
import { cookieStorage, createStorage, http } from '@wagmi/core';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('Missing projectId env var');
}

// Define chains with proper typing
const networks = [mainnet, polygon, sepolia, polygonMumbai] ;

// Define wagmiAdapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
    [polygonMumbai.id]: http(),
  },
});

// Create AppKit (this registers the web components, etc.)
createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as any, // Type assertion to fix AppKitNetwork mismatch
  projectId,
  metadata: {
    name: 'AI Trading Platform',
    description: 'AI-powered trading',
    url: 'https://your-domain.com',
    icons: ['https://your-domain.com/icon.png'],
  },
  features: {
    analytics: true, 
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, 
    },
  },
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}