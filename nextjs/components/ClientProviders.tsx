"use client";
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Web3Provider } from '@/components/providers/web3-provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000 } }
  }));

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <Web3Provider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-background">{children}</div>
            <Toaster position="bottom-right" />
          </QueryClientProvider>
        </AuthProvider>
      </Web3Provider>
    </ThemeProvider>
  );
}
