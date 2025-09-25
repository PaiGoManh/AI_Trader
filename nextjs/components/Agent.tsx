"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Menu, History } from "lucide-react";
import { TradingAgent, TradingAgentConfig } from "../lib/trading-agent";
import ChatHistorySidebar from "./ChatHistorySidebar";
import { ChatSession, ChatMessage } from "../types/chat";
import { CheckCircle, XCircle, Loader } from 'lucide-react';

type TradingAgentUIProps = {
  config: TradingAgentConfig;
};

// Generate a unique ID for sessions
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const TradingAgentUI: React.FC<TradingAgentUIProps> = ({ config }) => {
  const agentRef = useRef<TradingAgent | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [tradeConfirmation, setTradeConfirmation] = useState<any>(null);
  const [isProcessingTrade, setIsProcessingTrade] = useState(false);
  
  // Chat history state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('trading-agent-sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(sessionsWithDates);
        
        // Set the most recent session as current
        if (sessionsWithDates.length > 0) {
          setCurrentSessionId(sessionsWithDates[0].id);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('trading-agent-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Get current session messages
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const chatLog = currentSession?.messages || [];

  // Initialize agent
  useEffect(() => {
    const initAgent = async () => {
      try {
        agentRef.current = new TradingAgent(config);
        await agentRef.current.initialize();
        
        // Create first session if no sessions exist
        if (sessions.length === 0) {
          createNewSession();
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        addMessageToCurrentSession('agent', `Failed to initialize trading agent: ${errorMessage}`);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initAgent();
  }, [config]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [{
        id: generateId(),
        role: 'agent',
        content: "Hello! I'm your AI trading agent. I can help you with market analysis, portfolio management, risk assessment, and executing trades. What would you like to know?",
        timestamp: new Date()
      }]
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const addMessageToCurrentSession = (role: 'user' | 'agent', content: string) => {
    if (!currentSessionId) return;

    const newMessage: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date()
    };

    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, newMessage],
          updatedAt: new Date(),
          title: session.messages.length === 1 ? content : session.title
        };
      }
      return session;
    }));
  };


  const executeTrade = async (tradeParams: any) => {
    setIsProcessingTrade(true);
    try {
      const result = await agentRef.current!.executeTrade(tradeParams);
      addMessageToCurrentSession('agent', result);
    } catch (error: any) {
      addMessageToCurrentSession('agent', `Trade failed: ${error.message}`);
    } finally {
      setIsProcessingTrade(false);
      setTradeConfirmation(null);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !agentRef.current || isLoading || isInitializing) return;

    const userMessage = inputMessage.trim();
    
    // ✅ FIXED: Only check for trade if message starts with /trade
    const lowerMsg = userMessage.toLowerCase();
    const isTradeCommand = lowerMsg.startsWith('/trade');
    
    if (isTradeCommand) {
      // Extract the actual query after /trade
      const tradeQuery = lowerMsg.replace('/trade', '').trim();
      
      // Check if the trade query contains trade-related keywords
      const tradeKeywords = ['trade', 'buy', 'sell', 'swap', 'deposit', 'withdraw', 'balance', 'register'];
      const isTradeRelated = tradeKeywords.some(keyword => tradeQuery.includes(keyword)) || tradeQuery.length === 0;

      if (isTradeRelated && agentRef.current) {
        // For trade messages, show confirmation dialog
        const tradeParams = parseTradeParams(userMessage);
        setTradeConfirmation(tradeParams);
        addMessageToCurrentSession('user', userMessage);
        setInputMessage("");
        return;
      }
      // If /trade is used but not trade-related, continue to normal AI processing
    }

    // For non-trade messages, proceed normally
    addMessageToCurrentSession('user', userMessage);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await agentRef.current.chat(userMessage);
      addMessageToCurrentSession('agent', response);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      addMessageToCurrentSession('agent', `I apologize, but I encountered an error: ${errorMessage}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

// Add trade parameter parsing function
const parseTradeParams = (message: string): any => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('deposit') && lowerMsg.includes('eth')) {
    const amountMatch = message.match(/(\d+\.?\d*)\s*(eth|ether)/i);
    return {
      action: 'depositETH',
      amountIn: amountMatch ? amountMatch[1] : "0.1",
      userAddress: "user-address-here" // You'll need to get this from user context
    };
  }
  
  // Add more trade type parsing as needed
  return {
    action: 'executeTrade',
    tokenIn: "0x0000000000000000000000000000000000000000", // ETH
    tokenOut: "0xYourTokenAddress", 
    amountIn: "0.1",
    expectedAmountOut: "0.098",
    agentSignature: `Trade: ${message}`
  };
};

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (sessionId === currentSessionId) {
        setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };



  return (
    <div className="flex h-full bg-[#0b0d12]">
      {/* Chat History Sidebar */}
      <ChatHistorySidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={createNewSession}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col border border-gray-700 ml-4 mt-[-2%] rounded-lg ">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 ">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-800 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">AI Trading Agent</h1>
              <p className="text-sm text-gray-400">Real-time market analysis and trading assistance</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg hidden lg:flex"
          >
            <History className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {chatLog.map((entry) => (
              <div key={entry.id} className="group">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      entry.role === "user"
                        ? "bg-blue-100"
                        : "bg-gradient-to-br from-orange-400 to-red-500"
                    }`}
                  >
                    {entry.role === "user" ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {entry.role === "user" ? "You" : "Trading Agent"}
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(entry.timestamp)}</span>
                    </div>
                    <div className="prose max-w-none text-white text-sm leading-relaxed mt-2">
                      <div className="whitespace-pre-wrap">{entry.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">Trading Agent</span>
                      <span className="text-xs text-gray-500">thinking...</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-gray-200 bg-[#0b0d12] px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-[#0b0d12] text-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <textarea
                className="w-full px-4 py-3 pr-12 resize-none border-0 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-0 text-white"
                rows={1}
                placeholder={
                  isInitializing
                    ? "Initializing agent..."
                    : agentRef.current
                    ? "Ask me about trades, portfolio analysis, market trends..."
                    : "Agent offline..."
                }
                disabled={!agentRef.current || isLoading || isInitializing}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={onKeyDown}
                style={{ minHeight: "44px", maxHeight: "120px" }}
              />

              <button
                className={`absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                  !agentRef.current || isLoading || !inputMessage.trim() || isInitializing
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700"
                }`}
                disabled={!agentRef.current || isLoading || !inputMessage.trim() || isInitializing}
                onClick={sendMessage}
              >
                <Send className="w-4 h-4 " />
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-400 text-center">
              Trading agent can make mistakes. Verify important information and manage risk carefully.
            </div>
          </div>
        </div>

        {tradeConfirmation && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-white mb-4">Confirm Trade</h3>
          
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Action:</span>
              <span className="text-white">{tradeConfirmation.action}</span>
            </div>
            {tradeConfirmation.amountIn && (
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="text-white">{tradeConfirmation.amountIn}</span>
              </div>
            )}
          </div>

          {isProcessingTrade ? (
            <div className="flex items-center justify-center mt-4">
              <Loader className="w-5 h-5 animate-spin text-orange-500 mr-2" />
              <span className="text-white">Processing transaction...</span>
            </div>
          ) : (
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setTradeConfirmation(null)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => executeTrade(tradeConfirmation)}
                className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    )}
      </div>
    </div>
  );
};

export default TradingAgentUI;