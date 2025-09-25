'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Wallet, Users, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0b0d12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-border/50 bg-[#0b0d12]">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Welcome to Web3 Trading</CardTitle>
              <CardDescription>
                No registration needed! Just connect your wallet to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <Button
                  onClick={() => router.push('/auth/login')}
                  size="lg"
                  className="w-full"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet to Start Trading
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-center">What you get instantly:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="p-2 bg-caribbean-green/10 rounded-full">
                      <TrendingUp className="h-4 w-4 text-caribbean-green" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">AI Trading Signals</p>
                      <p className="text-xs text-muted-foreground">
                        Get intelligent trading recommendations powered by AI
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="p-2 bg-governor-bay/10 rounded-full">
                      <Wallet className="h-4 w-4 text-governor-bay" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Portfolio Tracking</p>
                      <p className="text-xs text-muted-foreground">
                        Real-time portfolio analytics and performance metrics
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="p-2 bg-caribbean-green/10 rounded-full">
                      <Shield className="h-4 w-4 text-caribbean-green" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Secure Trading</p>
                      <p className="text-xs text-muted-foreground">
                        Smart contract powered trades with full transparency
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground border-t pt-4">
                <p className="mb-2">
                  <strong>Web3 Benefits:</strong>
                </p>
                <div className="space-y-1">
                  <p>✓ No personal data collection</p>
                  <p>✓ You own your trading history</p>
                  <p>✓ Direct blockchain interaction</p>
                  <p>✓ No KYC required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Already have a wallet?{' '}
            <Link
              href="/auth/login"
              className="text-primary hover:underline font-medium"
            >
              Connect and start trading
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}