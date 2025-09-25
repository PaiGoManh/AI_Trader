"use client";
import { ethers } from "ethers";

export interface TradingAgentConfig {
  openaiApiKey: string;
  rpcUrl: string;
  contractAddress: string;
  contractABI: any[];
  privateKey: string;
}

export interface TradeParams {
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string; // in ether/token units
  expectedAmountOut: string; // in ether/token units
  agentSignature: string;
}

export class TradingAgent {
  public config: TradingAgentConfig;
  private provider!: ethers.JsonRpcProvider;
  private signer!: ethers.Wallet;
  private contract!: ethers.Contract;

  constructor(config: TradingAgentConfig) {
    this.config = config;
    try {
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
      this.contract = new ethers.Contract(
        config.contractAddress,
        config.contractABI,
        this.signer
      );
    } catch (error) {
      console.warn("Could not initialize blockchain components:", error);
    }
  }

  async initialize(): Promise<void> {
    console.log("TradingAgent initializing...");
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    console.log("TradingAgent initialized successfully");
  }

  // Trade execution method
  async executeTrade(tradeParams: TradeParams): Promise<string> {
    try {
      console.log("Executing trade:", tradeParams);

      // Validate trade parameters
      if (!this.isValidAddress(tradeParams.userAddress)) {
        throw new Error("Invalid user address");
      }

      if (!this.isValidAddress(tradeParams.tokenIn) || !this.isValidAddress(tradeParams.tokenOut)) {
        throw new Error("Invalid token address");
      }

      const amountIn = ethers.parseEther(tradeParams.amountIn);
      const expectedAmountOut = ethers.parseEther(tradeParams.expectedAmountOut);

      // Execute the trade
      const tx = await this.contract.executeTrade(
        tradeParams.userAddress,
        tradeParams.tokenIn,
        tradeParams.tokenOut,
        amountIn,
        expectedAmountOut,
        tradeParams.agentSignature,
        { gasLimit: 500000 }
      );

      console.log("Trade transaction sent:", tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Trade confirmed:", receipt);

      return `Trade executed successfully! 
- Transaction Hash: ${tx.hash}
- Token In: ${tradeParams.tokenIn}
- Token Out: ${tradeParams.tokenOut} 
- Amount: ${tradeParams.amountIn}
- Status: Confirmed`;
    } catch (error: any) {
      console.error("Trade execution error:", error);
      throw new Error(`Trade failed: ${error.message || error.toString()}`);
    }
  }

  // Deposit methods
  async depositETH(amount: string): Promise<string> {
    try {
      const value = ethers.parseEther(amount);
      const tx = await this.contract.depositETH({ value });
      await tx.wait();
      return `ETH deposit successful! Amount: ${amount} ETH, Tx: ${tx.hash}`;
    } catch (error: any) {
      throw new Error(`Deposit failed: ${error.message}`);
    }
  }

  async depositToken(tokenAddress: string, amount: string): Promise<string> {
    try {
      // Token ABI for approval
      const tokenAbi = ["function approve(address spender, uint256 amount) returns (bool)"];
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, this.signer);

      // Approve tokens
      const amountWei = ethers.parseEther(amount);
      const approveTx = await tokenContract.approve(this.config.contractAddress, amountWei);
      await approveTx.wait();

      // Deposit tokens
      const depositTx = await this.contract.depositToken(tokenAddress, amountWei);
      await depositTx.wait();

      return `Token deposit successful! Amount: ${amount}, Tx: ${depositTx.hash}`;
    } catch (error: any) {
      throw new Error(`Token deposit failed: ${error.message}`);
    }
  }

  // Withdrawal methods
  async withdrawETH(amount: string): Promise<string> {
    try {
      const tx = await this.contract.withdrawETH(ethers.parseEther(amount));
      await tx.wait();
      return `ETH withdrawal successful! Amount: ${amount} ETH, Tx: ${tx.hash}`;
    } catch (error: any) {
      throw new Error(`Withdrawal failed: ${error.message}`);
    }
  }

  async withdrawToken(token: string, amount: string): Promise<string> {
    try {
      const tx = await this.contract.withdrawToken(token, ethers.parseEther(amount));
      await tx.wait();
      return `Token withdrawal successful! Amount: ${amount}, Tx: ${tx.hash}`;
    } catch (error: any) {
      throw new Error(`Withdrawal failed: ${error.message}`);
    }
  }

  // Emergency withdrawal
  async emergencyWithdraw(token: string, amount: string): Promise<string> {
    try {
      const tx = await this.contract.emergencyWithdraw(token, ethers.parseEther(amount));
      await tx.wait();
      return `Emergency withdrawal executed for ${amount}`;
    } catch (error: any) {
      throw new Error(`Emergency withdrawal failed: ${error.message}`);
    }
  }

  // User management
  async registerUser(): Promise<string> {
    try {
      const tx = await this.contract.registerUser();
      await tx.wait();
      return "User registered successfully on the trading platform!";
    } catch (error: any) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async getUserInfo(userAddress: string) {
    try {
      const info = await this.contract.getUserInfo(userAddress);
      return info;
    } catch (error: any) {
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  async getUserBalance(userAddress: string, tokenAddress: string): Promise<string> {
    try {
      const balance = await this.contract.getUserBalance(userAddress, tokenAddress);
      return ethers.formatEther(balance);
    } catch (error: any) {
      throw new Error(`Balance check failed: ${error.message}`);
    }
  }

  // AI Agent management
  async registerAIAgent(agentName: string): Promise<string> {
    try {
      const tx = await this.contract.registerAIAgent(agentName);
      await tx.wait();
      return `AI Agent "${agentName}" registered successfully!`;
    } catch (error: any) {
      throw new Error(`Agent registration failed: ${error.message}`);
    }
  }

  async getAIAgentInfo(agentAddress: string) {
    try {
      const info = await this.contract.getAIAgentInfo(agentAddress);
      return info;
    } catch (error: any) {
      throw new Error(`Failed to get AI agent info: ${error.message}`);
    }
  }

  // Supported tokens
  async getSupportedTokens(): Promise<string[]> {
    try {
      return await this.contract.getSupportedTokens();
    } catch (error: any) {
      throw new Error(`Failed to get supported tokens: ${error.message}`);
    }
  }

  // Trades
  async getTrade(tradeId: number) {
    try {
      const trade = await this.contract.getTrade(tradeId);
      return trade;
    } catch (error: any) {
      throw new Error(`Failed to get trade: ${error.message}`);
    }
  }

  // Oracle & Price management
  async getLatestPrice(token: string): Promise<string> {
    try {
      const price = await this.contract.getLatestPrice(token);
      return price.toString();
    } catch (error: any) {
      throw new Error(`Failed to get latest price: ${error.message}`);
    }
  }

  async updatePrice(token: string, price: string): Promise<string> {
    try {
      const priceWei = ethers.parseUnits(price, 18);
      const tx = await this.contract.updatePrice(token, priceWei);
      await tx.wait();
      return `Price updated for token ${token}`;
    } catch (error: any) {
      throw new Error(`Price update failed: ${error.message}`);
    }
  }

  async updatePriceBatch(tokens: string[], prices: string[]): Promise<string> {
    try {
      const parsedPrices = prices.map(p => ethers.parseUnits(p, 18));
      const tx = await this.contract.updatePriceBatch(tokens, parsedPrices);
      await tx.wait();
      return 'Batch price update successful';
    } catch (error: any) {
      throw new Error(`Batch price update failed: ${error.message}`);
    }
  }

  // Token management
  async addSupportedToken(token: string): Promise<string> {
    try {
      const tx = await this.contract.addSupportedToken(token);
      await tx.wait();
      return `Token ${token} added to supported tokens`;
    } catch (error: any) {
      throw new Error(`Add token failed: ${error.message}`);
    }
  }

  async removeSupportedToken(token: string): Promise<string> {
    try {
      const tx = await this.contract.removeSupportedToken(token);
      await tx.wait();
      return `Token ${token} removed from supported tokens`;
    } catch (error: any) {
      throw new Error(`Remove token failed: ${error.message}`);
    }
  }

  // Platform fee
  async updatePlatformFee(newFee: string): Promise<string> {
    try {
      const feeWei = ethers.parseUnits(newFee, 18);
      const tx = await this.contract.updatePlatformFee(feeWei);
      await tx.wait();
      return 'Platform fee updated';
    } catch (error: any) {
      throw new Error(`Fee update failed: ${error.message}`);
    }
  }

  async getPlatformFee(): Promise<string> {
    try {
      const fee = await this.contract.platformFee();
      return fee.toString();
    } catch (error: any) {
      throw new Error(`Failed to get platform fee: ${error.message}`);
    }
  }

  // Pause/unpause contract
  async pause(): Promise<string> {
    try {
      const tx = await this.contract.pause();
      await tx.wait();
      return 'Contract paused';
    } catch (error: any) {
      throw new Error(`Pause failed: ${error.message}`);
    }
  }

  async unpause(): Promise<string> {
    try {
      const tx = await this.contract.unpause();
      await tx.wait();
      return 'Contract unpaused';
    } catch (error: any) {
      throw new Error(`Unpause failed: ${error.message}`);
    }
  }

  async isPaused(): Promise<boolean> {
    try {
      return await this.contract.paused();
    } catch (error: any) {
      throw new Error(`Failed to get paused status: ${error.message}`);
    }
  }

  // Ownership
  async transferOwnership(newOwner: string): Promise<string> {
    try {
      const tx = await this.contract.transferOwnership(newOwner);
      await tx.wait();
      return `Ownership transferred to ${newOwner}`;
    } catch (error: any) {
      throw new Error(`Ownership transfer failed: ${error.message}`);
    }
  }

  async renounceOwnership(): Promise<string> {
    try {
      const tx = await this.contract.renounceOwnership();
      await tx.wait();
      return 'Ownership renounced';
    } catch (error: any) {
      throw new Error(`Renounce ownership failed: ${error.message}`);
    }
  }

  // Utility: token amount to USD value
  async tokenAmountToUsd(token: string, amount: string, decimals: number): Promise<string> {
    try {
      const amountWei = ethers.parseUnits(amount, decimals);
      const usdValue = await this.contract.tokenAmountToUsd(token, amountWei, decimals);
      return usdValue.toString();
    } catch (error: any) {
      throw new Error(`Conversion to USD failed: ${error.message}`);
    }
  }

  // Chat method detecting trade intents
async chat(message: string): Promise<string> {
    console.log("=== TradingAgent.chat() called ===");
    console.log("Message received:", message);

    const lowerMsg = message.toLowerCase().trim();

    // ✅ FIXED: Only handle trade if message starts with /trade
    const isTradeCommand = lowerMsg.startsWith('/trade');
    
    if (isTradeCommand) {
      // Extract the actual query after /trade
      const tradeQuery = lowerMsg.replace('/trade', '').trim();
      
      if (this.isTradeQuery(tradeQuery) || tradeQuery.length === 0) {
        return this.handleTradeQuery(message, tradeQuery);
      }
      // If /trade is used but not trade-related, continue to AI
    }

    // For non-trade queries, call AI API
    return this.callAIAPI(message);
  }

  // ✅ FIXED: More specific trade query detection
  private isTradeQuery(message: string): boolean {
    // If message is empty after /trade, show trade help
    if (message.trim().length === 0) {
      return true;
    }

    const tradeActionKeywords = [
      'buy', 'sell', 'swap', 'exchange', 'execute',
      'deposit', 'withdraw', 'register'
    ];
    
    const tradeInfoKeywords = [
      'balance', 'portfolio', 'holdings', 'account'
    ];

    const words = message.toLowerCase().split(/\s+/);
    
    // Check for action keywords that should trigger trade execution
    const hasActionKeyword = tradeActionKeywords.some(keyword => 
      words.includes(keyword) || message.includes(keyword)
    );

    // Check for info keywords that should get balance info
    const hasInfoKeyword = tradeInfoKeywords.some(keyword => 
      words.includes(keyword) || message.includes(keyword)
    );

    // For questions about "what is trade", don't trigger actual trading
    const isQuestionAboutTrade = /what|how|explain|define/.test(message) && 
                                 /trade|trading|buy|sell/.test(message);

    return (hasActionKeyword || hasInfoKeyword) && !isQuestionAboutTrade;
  }

  private async handleTradeQuery(originalMessage: string, lowerMessage: string): Promise<string> {
    // Check if this is just a question about trading
    const isQuestion = /what|how|explain|define|tell me about/.test(lowerMessage);
    
    if (isQuestion) {
      // For questions about trading, use AI instead of executing trades
      return this.callAIAPI(originalMessage);
    }

    const tradeIntent = this.parseTradeIntent(originalMessage);

    if (tradeIntent.action === 'executeTrade') {
      try {
        // Validate token addresses before executing
        if (!this.isValidAddress(tradeIntent.params.tokenOut) || 
            tradeIntent.params.tokenOut === "0xYourTokenAddressHere") {
          return "❌ Please specify a valid token address for the trade. For example: '/trade buy 0.1 ETH for USDC'";
        }

        const result = await this.executeTrade(tradeIntent.params);
        return `✅ ${result}\n\nI've executed your trade on the blockchain. The transaction has been confirmed.`;
      } catch (error: any) {
        return `❌ Trade execution failed: ${error.message}\n\nPlease check your balances and try again.`;
      }
    } else if (tradeIntent.action === 'depositETH') {
      try {
        const result = await this.depositETH(tradeIntent.params.amountIn);
        return `✅ ${result}`;
      } catch (error: any) {
        return `❌ Deposit failed: ${error.message}`;
      }
    } else if (tradeIntent.action === 'registerUser') {
      try {
        const result = await this.registerUser();
        return `✅ ${result}`;
      } catch (error: any) {
        return `❌ Registration failed: ${error.message}`;
      }
    } else if (tradeIntent.action === 'getBalance') {
      try {
        // Handle balance queries
        const balance = await this.getUserBalance(tradeIntent.params.userAddress, tradeIntent.params.tokenAddress);
        return `💰 Your balance: ${balance} ${tradeIntent.params.tokenSymbol || 'tokens'}`;
      } catch (error: any) {
        return `❌ Balance check failed: ${error.message}`;
      }
    } else {
      // For general trade-related queries, use AI
      return this.callAIAPI(originalMessage);
    }
  }

  private parseTradeIntent(message: string): { action: string; params: any } {
    const lowerMsg = message.toLowerCase();

    // Handle balance queries
    if (lowerMsg.includes('balance') || lowerMsg.includes('holdings')) {
      return {
        action: 'getBalance',
        params: {
          userAddress: this.signer.address,
          tokenAddress: "0x0000000000000000000000000000000000000000", // ETH by default
          tokenSymbol: "ETH"
        }
      };
    }

    // Handle deposit queries
    if (lowerMsg.includes('deposit')) {
      return {
        action: 'depositETH',
        params: this.parseDepositParams(message)
      };
    }

    // Handle registration queries
    if (lowerMsg.includes('register')) {
      return { action: 'registerUser', params: {} };
    }

    // Handle trade queries (only if specific tokens are mentioned)
    if ((lowerMsg.includes('trade') || lowerMsg.includes('buy') || lowerMsg.includes('sell')) && 
        (lowerMsg.includes('eth') || lowerMsg.includes('usdc') || lowerMsg.includes('token'))) {
      return {
        action: 'executeTrade',
        params: this.parseTradeParams(message)
      };
    }

    // Default to info action for general trade questions
    return { action: 'info', params: {} };
  }

  private parseTradeParams(message: string): TradeParams {
    // Extract token names from message
    let tokenOut = "0xYourTokenAddressHere";
    
    if (message.toLowerCase().includes('usdc')) {
      tokenOut = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC mainnet address
    } else if (message.toLowerCase().includes('usdt')) {
      tokenOut = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT mainnet address
    } else if (message.toLowerCase().includes('dai')) {
      tokenOut = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI mainnet address
    }

    return {
      userAddress: this.signer.address,
      tokenIn: "0x0000000000000000000000000000000000000000", // ETH
      tokenOut: tokenOut,
      amountIn: "0.1",
      expectedAmountOut: "0.098",
      agentSignature: `AI Trade: ${message} - ${new Date().toISOString()}`
    };
  }
  // Update the trade query detection to be more specifi


  private parseDepositParams(message: string): { amountIn: string } {
    const amountMatch = message.match(/(\d+\.?\d*)\s*(eth|ether)/i);
    const amount = amountMatch ? amountMatch[1] : "0.1";

    return { amountIn: amount };
  }

  private async callAIAPI(message: string): Promise<string> {
    try {
      const apiUrl = '/api/ai-route';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      return data.reply || "Sorry, I couldn't generate a response.";
    } catch (err: any) {
      return `Sorry, I encountered an error: ${err.message}. Please try again.`;
    }
  }

  private isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }
}
