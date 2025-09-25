// Shared TypeScript types across the platform

export interface User {
  _id: string;
  email: string;
  username: string;
  avatar?: string;
  walletAddress?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  profile: UserProfile;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    trading: boolean;
    aiSignals: boolean;
  };
  trading: {
    defaultSlippage: number;
    autoApprove: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  };
  dashboard: {
    layout: DashboardWidget[];
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  tradingExperience: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance: number; // 1-10 scale
}

export interface DashboardWidget {
  id: string;
  type: 'portfolio' | 'signals' | 'trades' | 'analytics' | 'news' | 'price-chart';
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  isVisible: boolean;
}

export interface Trade {
  _id: string;
  userId: string;
  type: 'buy' | 'sell';
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  price: string;
  totalValue: string;
  gasUsed: string;
  transactionHash: string;
  blockNumber: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  aiSignalId?: string;
}

export interface Portfolio {
  userId: string;
  tokens: TokenHolding[];
  totalValue: string;
  totalPnL: string;
  totalPnLPercentage: number;
  lastUpdated: Date;
}

export interface TokenHolding {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balance: string;
  currentPrice: string;
  totalValue: string;
  pnl: string;
  pnlPercentage: number;
  averageBuyPrice: string;
}

export interface AISignal {
  _id: string;
  tokenAddress: string;
  tokenSymbol: string;
  signalType: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-1 scale
  strength: 'weak' | 'moderate' | 'strong';
  reasoning: string;
  targetPrice?: string;
  stopLoss?: string;
  timeframe: '1h' | '4h' | '1d' | '1w';
  technicalIndicators: {
    rsi: number;
    macd: number;
    bollinger: 'upper' | 'middle' | 'lower';
    volume: 'high' | 'normal' | 'low';
  };
  fundamentalFactors?: string[];
  riskScore: number; // 1-10 scale
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface PriceData {
  tokenAddress: string;
  symbol: string;
  price: string;
  change24h: number;
  volume24h: string;
  marketCap: string;
  timestamp: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface WebSocketMessage {
  type: 'price_update' | 'trade_update' | 'ai_signal' | 'portfolio_update';
  data: any;
  timestamp: Date;
}

// Smart Contract Types
export interface TradingContractMethods {
  buyToken(tokenAddress: string, amount: string): Promise<string>;
  sellToken(tokenAddress: string, amount: string): Promise<string>;
  getTokenPrice(tokenAddress: string): Promise<string>;
  getUserBalance(userAddress: string, tokenAddress: string): Promise<string>;
  setSlippageTolerance(slippage: number): Promise<string>;
  emergencyWithdraw(): Promise<string>;
}

// AI Module Types
export interface AIAnalysisRequest {
  tokenAddress: string;
  timeframe: string;
  includeNews?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface AIAnalysisResponse {
  signal: AISignal;
  marketAnalysis: {
    trend: 'bullish' | 'bearish' | 'neutral';
    volatility: number;
    momentum: number;
    support: string;
    resistance: string;
  };
  riskAssessment: {
    score: number;
    factors: string[];
    recommendation: string;
  };
}

// Error Types
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class Web3Error extends Error {
  constructor(
    message: string,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'Web3Error';
  }
}