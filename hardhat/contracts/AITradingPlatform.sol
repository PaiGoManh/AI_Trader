// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @dev Minimal Chainlink AggregatorV3Interface used to read feeds if configured.
 * (We declare the interface here to avoid requiring the chainlink npm import.)
 */
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/**
 * @title AITradingPlatform
 * @dev Smart contract for AI-powered trading platform with price oracle support.
 * Supports Chainlink feeds and a custom off-chain updater (trusted oracle updater).
 */
contract AITradingPlatform is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Structs
    struct User {
        bool isRegistered;
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint256 balance;
        uint256 lastActivity;
        bool isActive;
    }

    struct Trade {
        uint256 id;
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOut;
        uint256 timestamp;
        bool isCompleted;
        string agentSignature; // AI agent decision signature
    }

    struct AIAgent {
        address agentAddress;
        string name;
        uint256 successRate; // Basis points (e.g., 7500 = 75%)
        uint256 totalTrades;
        uint256 successfulTrades;
        bool isActive;
    }

    // State variables
    mapping(address => User) public users;
    mapping(uint256 => Trade) public trades;
    mapping(address => AIAgent) public aiAgents;
    mapping(address => mapping(address => uint256)) public userTokenBalances;
    
    address[] public registeredUsers;
    address[] public activeAgents;
    uint256 public nextTradeId = 1;
    uint256 public platformFee = 100; // 1% in basis points
    uint256 public constant MAX_FEE = 500; // 5% maximum fee
    
    // Supported tokens
    mapping(address => bool) public supportedTokens;
    address[] public tokenList;

    // --- Price oracle state ---
    // Stored (manual) prices (price of 1 token unit in USD, scaled by PRICE_DECIMALS)
    mapping(address => uint256) public storedPriceUSD; // token => price (uint256)
    // Chainlink feed mapping: token => chainlink feed contract
    mapping(address => address) public chainlinkFeeds;
    // decimals for stored prices (common scaling)
    uint8 public constant PRICE_DECIMALS = 8; // storedPriceUSD has 8 decimals (like many feeds)
    // Trusted oracle updater address (off-chain process) that can call updatePrice
    address public oracleUpdater;

    // Events
    event UserRegistered(address indexed user, uint256 timestamp);
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdrawal(address indexed user, address indexed token, uint256 amount);
    event TradeExecuted(
        uint256 indexed tradeId,
        address indexed user,
        address indexed agent,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event AIAgentRegistered(address indexed agent, string name);
    event AIAgentUpdated(address indexed agent, uint256 successRate);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event FeeUpdated(uint256 newFee);

    // Oracle related events
    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);
    event PriceBatchUpdated(address[] tokens, uint256[] prices, uint256 timestamp);
    event ChainlinkFeedSet(address indexed token, address indexed feed);
    event OracleUpdaterSet(address indexed updater);

    // Modifiers
    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    modifier onlyActiveUser() {
        require(users[msg.sender].isActive, "User not active");
        _;
    }

    modifier onlyActiveAgent() {
        require(aiAgents[msg.sender].isActive, "Agent not active");
        _;
    }

    modifier validToken(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }

    modifier onlyOracleUpdaterOrOwner() {
        require(msg.sender == oracleUpdater || msg.sender == owner(), "Not oracle or owner");
        _;
    }

    constructor() {
        // Initialize with ETH as supported token (address(0) represents ETH)
        supportedTokens[address(0)] = true;
        tokenList.push(address(0));
    }

    // ----------------------------
    // User & Agent Management
    // ----------------------------
    function registerUser() external {
        require(!users[msg.sender].isRegistered, "User already registered");
        
        users[msg.sender] = User({
            isRegistered: true,
            totalDeposited: 0,
            totalWithdrawn: 0,
            balance: 0,
            lastActivity: block.timestamp,
            isActive: true
        });
        
        registeredUsers.push(msg.sender);
        emit UserRegistered(msg.sender, block.timestamp);
    }

    function registerAIAgent(string memory name) external {
        require(!aiAgents[msg.sender].isActive, "Agent already registered");
        require(bytes(name).length > 0, "Name cannot be empty");
        
        aiAgents[msg.sender] = AIAgent({
            agentAddress: msg.sender,
            name: name,
            successRate: 5000, // Start with 50% success rate
            totalTrades: 0,
            successfulTrades: 0,
            isActive: true
        });
        
        activeAgents.push(msg.sender);
        emit AIAgentRegistered(msg.sender, name);
    }

    // ----------------------------
    // Deposits / Withdrawals
    // ----------------------------
    function depositETH() external payable nonReentrant onlyRegisteredUser {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        users[msg.sender].balance += msg.value;
        users[msg.sender].totalDeposited += msg.value;
        users[msg.sender].lastActivity = block.timestamp;
        userTokenBalances[msg.sender][address(0)] += msg.value;
        
        emit Deposit(msg.sender, address(0), msg.value);
    }

    function depositToken(address token, uint256 amount) 
        external 
        nonReentrant 
        onlyRegisteredUser 
        validToken(token) 
    {
        require(amount > 0, "Deposit amount must be greater than 0");
        require(token != address(0), "Use depositETH for ETH deposits");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        userTokenBalances[msg.sender][token] += amount;
        users[msg.sender].lastActivity = block.timestamp;
        
        emit Deposit(msg.sender, token, amount);
    }

    function withdrawETH(uint256 amount) external nonReentrant onlyRegisteredUser {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(userTokenBalances[msg.sender][address(0)] >= amount, "Insufficient balance");
        
        userTokenBalances[msg.sender][address(0)] -= amount;
        users[msg.sender].totalWithdrawn += amount;
        users[msg.sender].lastActivity = block.timestamp;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit Withdrawal(msg.sender, address(0), amount);
    }

    function withdrawToken(address token, uint256 amount) 
        external 
        nonReentrant 
        onlyRegisteredUser 
        validToken(token) 
    {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(token != address(0), "Use withdrawETH for ETH withdrawals");
        require(userTokenBalances[msg.sender][token] >= amount, "Insufficient balance");
        
        userTokenBalances[msg.sender][token] -= amount;
        users[msg.sender].lastActivity = block.timestamp;
        
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Withdrawal(msg.sender, token, amount);
    }

    // ----------------------------
    // Trade Execution (agents)
    // ----------------------------
    function executeTrade(
        address user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 expectedAmountOut,
        string memory agentSignature
    ) 
        external 
        nonReentrant 
        onlyActiveAgent 
        validToken(tokenIn) 
        validToken(tokenOut) 
        whenNotPaused 
    {
        require(users[user].isActive, "User not active");
        require(userTokenBalances[user][tokenIn] >= amountIn, "Insufficient user balance");
        require(amountIn > 0, "Amount must be greater than 0");
        
        // Calculate fee
        uint256 fee = (amountIn * platformFee) / 10000;
        uint256 amountAfterFee = amountIn - fee;
        
        // Simulate trade execution (in real implementation, this would interact with DEX)
        uint256 actualAmountOut = _simulateTradeExecution(tokenIn, tokenOut, amountAfterFee);
        require(actualAmountOut >= (expectedAmountOut * 95) / 100, "Slippage too high");
        
        // Update balances
        userTokenBalances[user][tokenIn] -= amountIn;
        userTokenBalances[user][tokenOut] += actualAmountOut;
        
        // Record trade
        trades[nextTradeId] = Trade({
            id: nextTradeId,
            user: user,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            amountOut: actualAmountOut,
            timestamp: block.timestamp,
            isCompleted: true,
            agentSignature: agentSignature
        });
        
        // Update AI agent stats
        aiAgents[msg.sender].totalTrades++;
        if (actualAmountOut >= expectedAmountOut) {
            aiAgents[msg.sender].successfulTrades++;
        }
        _updateAgentSuccessRate(msg.sender);
        
        emit TradeExecuted(nextTradeId, user, msg.sender, tokenIn, tokenOut, amountIn, actualAmountOut);
        nextTradeId++;
    }

    function _simulateTradeExecution(address /* tokenIn */, address /* tokenOut */, uint256 amountIn) 
        private pure returns (uint256) 
    {
        return (amountIn * 98) / 100;
    }


    function _updateAgentSuccessRate(address agent) private {
        AIAgent storage aiAgent = aiAgents[agent];
        if (aiAgent.totalTrades > 0) {
            aiAgent.successRate = (aiAgent.successfulTrades * 10000) / aiAgent.totalTrades;
        }
        emit AIAgentUpdated(agent, aiAgent.successRate);
    }

    // ----------------------------
    // Supported tokens management
    // ----------------------------
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(!supportedTokens[token], "Token already supported");
        
        supportedTokens[token] = true;
        tokenList.push(token);
        emit TokenAdded(token);
    }

    function removeSupportedToken(address token) external onlyOwner {
        require(supportedTokens[token], "Token not supported");
        
        supportedTokens[token] = false;
        
        // Remove from tokenList array
        for (uint256 i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == token) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }
        
        emit TokenRemoved(token);
    }

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee cannot exceed maximum");
        platformFee = newFee;
        emit FeeUpdated(newFee);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = payable(owner()).call{value: amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    // ----------------------------
    // Oracle / Price Feed Functions
    // ----------------------------
    /**
     * @dev Set the Chainlink feed address for a token. Owner only.
     * If set, getLatestPrice will prefer Chainlink feed for that token.
     */
    function setChainlinkFeed(address token, address feed) external onlyOwner {
        require(token != address(0), "token may be zero for ETH representation");
        chainlinkFeeds[token] = feed;
        emit ChainlinkFeedSet(token, feed);
    }

    /**
     * @dev Set the oracle updater address (the off-chain service) that can call updatePrice/updatePriceBatch.
     */
    function setOracleUpdater(address updater) external onlyOwner {
        oracleUpdater = updater;
        emit OracleUpdaterSet(updater);
    }

    /**
     * @dev Update stored price for a token (price is USD scaled by PRICE_DECIMALS).
     * Callable by owner or oracleUpdater.
     */
    function updatePrice(address token, uint256 price) external onlyOracleUpdaterOrOwner {
        storedPriceUSD[token] = price;
        emit PriceUpdated(token, price, block.timestamp);
    }

    /**
     * @dev Update prices in batch. Arrays must match lengths.
     */
    function updatePriceBatch(address[] calldata tokens, uint256[] calldata prices) external onlyOracleUpdaterOrOwner {
        require(tokens.length == prices.length, "Length mismatch");
        for (uint256 i = 0; i < tokens.length; i++) {
            storedPriceUSD[tokens[i]] = prices[i];
        }
        emit PriceBatchUpdated(tokens, prices, block.timestamp);
    }

    /**
     * @dev Read latest price (USD scaled by PRICE_DECIMALS) for token.
     * If chainlink feed registered and returns valid value, use it; otherwise fallback to storedPriceUSD.
     * Reverts if neither is available (zero).
     */
    function getLatestPrice(address token) public view returns (uint256) {
        address feed = chainlinkFeeds[token];
        if (feed != address(0)) {
            // try read chainlink
            AggregatorV3Interface aggregator = AggregatorV3Interface(feed);
            (
                , 
                int256 answer,
                ,
                uint256 updatedAt,
                
            ) = aggregator.latestRoundData();

            // basic checks
            if (answer > 0 && updatedAt > 0) {
                uint8 decimals = aggregator.decimals();
                // normalize to PRICE_DECIMALS
                if (decimals == PRICE_DECIMALS) {
                    return uint256(answer);
                } else if (decimals > PRICE_DECIMALS) {
                    return uint256(answer) / (10 ** (decimals - PRICE_DECIMALS));
                } else {
                    return uint256(answer) * (10 ** (PRICE_DECIMALS - decimals));
                }
            }
        }

        uint256 stored = storedPriceUSD[token];
        require(stored > 0, "No price available");
        return stored;
    }

    /**
     * @dev Convert token amount to USD (returns uint256 scaled by PRICE_DECIMALS).
     * Example: tokenAmount = 2e18 (2 tokens with 18 decimals), tokenDecimals must be supplied.
     * Return is USD value scaled by PRICE_DECIMALS (e.g. if USD = 1.23 -> 123000000).
     *
     * NOTE: tokenDecimals is the decimals used by the ERC20 token (e.g. 18).
     */
    function tokenAmountToUsd(address token, uint256 tokenAmount, uint8 tokenDecimals) public view returns (uint256) {
        uint256 price = getLatestPrice(token); // price with PRICE_DECIMALS
        // USD value scaled: tokenAmount * price / (10 ** tokenDecimals)
        // To keep PRICE_DECIMALS scaling: result = tokenAmount * price / (10**tokenDecimals)
        // Be careful with overflow; tokenAmount and price are typically <= 1e36 in worst case; solidity 0.8 has safe arithmetic.
        return (tokenAmount * price) / (10 ** tokenDecimals);
    }

    // ----------------------------
    // View helpers
    // ----------------------------
    function getUserBalance(address user, address token) external view returns (uint256) {
        return userTokenBalances[user][token];
    }

    function getUserInfo(address user) external view returns (User memory) {
        return users[user];
    }

    function getAIAgentInfo(address agent) external view returns (AIAgent memory) {
        return aiAgents[agent];
    }

    function getTrade(uint256 tradeId) external view returns (Trade memory) {
        return trades[tradeId];
    }

    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }

    function getTotalUsers() external view returns (uint256) {
        return registeredUsers.length;
    }

    function getTotalAgents() external view returns (uint256) {
        return activeAgents.length;
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
