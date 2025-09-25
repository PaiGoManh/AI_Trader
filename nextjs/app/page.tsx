'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bot, TrendingUp, Shield, Zap, BarChart3, Wallet, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Signals',
      description: 'Advanced machine learning algorithms analyze market trends and provide intelligent trading recommendations.',
      color: 'text-caribbean-green'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Live market data, portfolio tracking, and performance metrics updated in real-time.',
      color: 'text-governor-bay'
    },
    {
      icon: Shield,
      title: 'Secure Trading',
      description: 'Smart contract-powered trades with military-grade encryption and security protocols.',
      color: 'text-caribbean-green'
    },
    {
      icon: Zap,
      title: 'Automated Execution',
      description: 'Set up automated trading strategies that execute based on your predefined parameters.',
      color: 'text-radical-red'
    },
    {
      icon: BarChart3,
      title: 'Advanced Charts',
      description: 'Professional-grade charting tools with technical indicators and market analysis.',
      color: 'text-governor-bay'
    },
    {
      icon: Wallet,
      title: 'Multi-Wallet Support',
      description: 'Connect multiple wallets and manage your entire crypto portfolio from one dashboard.',
      color: 'text-caribbean-green'
    }
  ];

  const stats = [
    { label: 'Active Traders', value: '10K+' },
    { label: 'Trading Volume', value: '$50M+' },
    { label: 'AI Accuracy', value: '85%' },
    { label: 'Uptime', value: '99.9%' }
  ];

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push('/auth/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-[#0b0d12] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl">AI Trader</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" onClick={() => router.push('/features')}>Features</Button>
            <Button variant="ghost" onClick={() => router.push('/pricing')}>Pricing</Button>
            <Button variant="ghost" onClick={() => router.push('/docs')}>Docs</Button>
            <Button variant="connect" onClick={() => router.push('/auth/login')} >Connect Wallet</Button>
            <Button onClick={handleGetStarted} disabled={isLoading}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="h-screen py-20 px-4 bg-[#0b0d12] border-border/50 border-b">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Trading Platform
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Trade Smarter with
              <span className="text-primary"> AI Intelligence</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mt-6 mb-8 max-w-3xl mx-auto">
              Harness the power of artificial intelligence to make informed trading decisions. 
              Our platform combines real-time market analysis, automated strategies, and secure 
              smart contract execution.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button size="lg" onClick={handleGetStarted} disabled={isLoading}>
                Start Trading Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="connect" onClick={() => router.push('/demo')}>
                View Live Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-[#0b0d12]">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-[#0b0d12] border-border/50 border-t ">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Modern Traders
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to trade cryptocurrencies with confidence and intelligence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[#0b0d12]">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg bg-[#0b0d12] transition-shadow border-border/50">
                  <CardHeader>
                    <div className={`p-3 w-fit rounded-lg bg-secondary/50 mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#0b0d12]">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of traders who are already using AI to maximize their profits 
              and minimize their risks.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} disabled={isLoading}>
                <Users className="mr-2 h-5 w-5" />
                Join Now - Free
              </Button>
              <Button size="lg" variant="connect" onClick={() => router.push('/contact')}>
                Contact Sales
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • Start with demo trading
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 bg-[#0b0d12]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-1 bg-primary/10 rounded">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">AI Trader Platform</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" onClick={() => router.push('/privacy')}>
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/terms')}>
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/support')}>
                Support
              </Button>
            </div>
          </div>
          
          <div className="border-t border-border/40 mt-6 pt-6 text-center text-sm text-muted-foreground">
            © 2024 AI Trader Platform. All rights reserved. Built with Next.js and AI.
          </div>
        </div>
      </footer>
    </div>
  );
}