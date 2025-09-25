# Trading AI Assistant 🤖📈

An intelligent AI-powered trading companion designed to make financial markets accessible to everyone, from complete beginners to experienced traders.

## 🌟 Overview

Trading AI Assistant is your personal trading mentor that simplifies complex market concepts and provides real-time guidance. Built with modern web technologies and blockchain integration, it offers an intuitive platform for learning market analysis, developing strategies, and understanding trading fundamentals in a conversational, user-friendly interface.

## ✨ Features

### 🎓 Beginner-Friendly Learning
- **Interactive Tutorials**: Step-by-step guides for trading newcomers
- **Glossary of Terms**: Instant explanations of market terminology
- **Strategy Breakdowns**: Learn various trading approaches with practical examples
- **Risk Management Education**: Essential skills for safe trading practices

### 🤖 AI-Powered Assistance
- **Personalized Learning Paths**: Adaptive content based on your experience level
- **Real-time Market Analysis**: AI-driven insights into current market trends
- **Strategy Recommendations**: Tailored suggestions for different market conditions
- **Q&A Support**: Get instant answers to your trading questions

### 🔧 Technical Features
- **Web3 Integration**: Secure wallet connection and blockchain interactions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Data**: Live market data and analytics
- **Modern UI/UX**: Clean, intuitive interface built with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PaiGoManh/AI_Trader.git
cd AI_Trader
```

### Installation

1. Clone or navigate to your project folder.

2. Change directory to the Next.js app:

    ```
    cd nextjs-app
    ```

3. Install dependencies:

    ```
    npm install
    ```

4. Run the development server:

    ```
    npm run dev
    ```

5. Open your browser:

    ```
    http://localhost:3000
    ```
##Create a .env.local file in the root directory with the following structure (USE YOUR OWN VALUES):

# WalletConnect Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Blockchain Network Configuration
NEXT_PUBLIC_RPC_URL=your_bsc_rpc_url_here
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here

# API Keys for Market Data
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key_here
COINGECKO_API_KEY=your_coingecko_api_key_here

# AI Services Configuration
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here

# ⚠️ SECURITY CRITICAL - NEVER SHARE OR COMMIT
# Use this only for development, remove for production
NEXT_PUBLIC_PRIVATE_KEY=your_private_key_here


## 📋 How to Get New Values

### WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in to your account
3. Click "Create New Project"
4. Enter your project name and description
5. Copy the generated Project ID
6. Add it to your `.env.local` file

### CoinGecko API Key
1. Register at [CoinGecko API](https://www.coingecko.com/en/api/pricing)
2. Choose the free or paid plan based on your needs
3. Go to your account dashboard
4. Navigate to the API section
5. Generate a new API key
6. Copy the key to your `.env.local` file

### OpenAI/OpenRouter Keys
1. Log into your [OpenRouter](https://openrouter.ai/) account
2. Go to the "Keys" section in your dashboard
3. Generate new API keys
4. **Important**: Revoke the exposed keys immediately
5. Copy the new keys to your `.env.local` file

### Private Key from MetaMask
**⚠️ Extreme Caution**: Private keys should never be shared or exposed publicly. Only use for development.

#### Method 1: Export from Existing Account
1. Open MetaMask browser extension
2. Click on the account icon (top right)
3. Select "Account details"
4. Click "Export private key"
5. Enter your password to reveal the private key
6. Copy the key (without the "0x" prefix)
