# AI-Powered Crypto Trading Platform

## Architecture Overview

This is a production-ready, modular crypto trading platform featuring AI-powered signals, smart contract integration, and real-time analytics.

### Tech Stack
- **Frontend**: Next.js 13+, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Web3**: Ethers.js, Hardhat
- **AI/ML**: Python microservice with REST API
- **Authentication**: JWT + Wallet Connect
- **Real-time**: WebSockets for live data

### Project Structure
```
/
├── frontend/                 # Next.js application
│   ├── components/          # Reusable UI components
│   ├── pages/              # Next.js pages
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configurations
│   └── types/              # TypeScript type definitions
├── backend/                 # Node.js/Express API
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic services
│   └── utils/              # Helper utilities
├── contracts/               # Smart contracts (Hardhat)
│   ├── contracts/          # Solidity contracts
│   ├── scripts/            # Deployment scripts
│   └── test/               # Contract tests
├── ai-module/              # AI/ML microservice
│   ├── services/           # AI service implementations
│   ├── models/             # ML models
│   └── api/                # REST API endpoints
└── shared/                 # Shared types and utilities
```

### Key Features
1. **Authentication**: Email/password + Web3 wallet integration
2. **Dashboard**: Customizable widgets with real-time data
3. **Trading**: Smart contract-powered buy/sell operations
4. **AI Signals**: Machine learning-based trading recommendations
5. **Portfolio**: Real-time tracking and analytics
6. **Security**: JWT tokens, encrypted data, secure smart contracts

### Getting Started
1. Install dependencies: `npm install`
2. Set up environment variables
3. Run development servers: `npm run dev`
4. Deploy contracts to testnet: `npm run deploy:testnet`

## Security Considerations
- All sensitive data encrypted at rest
- Smart contracts audited and tested
- JWT tokens with proper expiration
- Rate limiting on API endpoints
- Input validation and sanitization