'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wallet, ArrowLeft, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAccount, useDisconnect } from 'wagmi';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const router = useRouter();
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Redirect to dashboard immediately after wallet connection
  useEffect(() => {
    if (isConnected && address) {
      router.push('/dashboard');
    }
  }, [isConnected, address, router]);

  const handleDisconnect = () => {
    disconnect();
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0d12]">
      <div className="w-full max-w-md">
        <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2 text-white" /> Back to Home
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="border-border/50 bg-[#0b0d12]">
            <CardHeader className="text-center space-y-1">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Connect Your Wallet</CardTitle>
              <CardDescription>Secure, decentralized access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!isConnected ? (
                <div className="space-y-4 text-center">
                  <div className='flex justify-center'>
                    <appkit-connect-button />
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-caribbean-green" />
                      <span>No personal info required</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-governor-bay" />
                      <span>Sign in with wallet</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-caribbean-green" />
                      <span>Your keys, your control</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Connected</p>
                        {address && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {address.slice(0, 6)}...{address.slice(-4)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{connector?.name}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleDisconnect}>
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center text-xs text-muted-foreground">
                <p>
                  By connecting, you agree to our{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms
                  </Link>{' '}
                  &{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
