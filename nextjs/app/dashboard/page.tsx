'use client';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import TransactionList from '../../components/TransactionList';
import Home from '../../components/Home';
import Agent from '../../components/Agent';
import Coins from '../../components/Coins';
import { Bot } from "lucide-react";
import contractABI from '../../abi/AITradingPlatform.json';


// import AgentInterface from '../../components/AgentInterface'; // Uncomment if/when available

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedTab === 'transactions' && isConnected && address) {
      setIsLoading(true);
      setError('');
      fetch(`/api/transactions?address=${address}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch transactions');
          return res.json();
        })
        .then(data => setTransactions(data))
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [selectedTab, isConnected, address]);

  if (!isConnected) {
    return <p className="pl-64 pt-16 text-white">Please connect your wallet to access the dashboard.</p>;
  }

  return (
    <div className="h-screen bg-[#0b0d12]">
      <Sidebar selectedTab={selectedTab} onSelectTab={setSelectedTab} />
      <Header />
      <main className="pl-64 pt-16 h-screen min-h-screen ">
      <div className="p-8 text-white w-[98%] border border-gray-800 ml-4 mt-4 h-[calc(100vh-4rem-2rem)] overflow-y-auto">          
        {selectedTab === 'dashboard' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
                    <Home />
                  </div>
                )}
          {selectedTab === 'agent' && (
            <div>
              {/* <div className="flex-shrink-0 border-b border-gray-200 bg-[#0b0d12] text-white p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-medium text-white">Trading AI Agent</h1>
                    <p className="text-sm text-gray-500">
                      Ready to help with trading
                    </p>
                  </div>
                </div>
              </div> */}
            <Agent
              config={{
                openaiApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || '',
                contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
                contractABI: contractABI.abi, // Use the imported ABI
                privateKey: process.env.NEXT_PUBLIC_PRIVATE_KEY || '',
              }}
            />
            </div>
          )}
          {selectedTab === 'transactions' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Transactions</h2>
              {/* <TransactionList  /> */}
            </div>
          )}
          {selectedTab === 'coins' && (
            <div>
              <Coins />
            </div>  
          )}
        </div>
      </main>
    </div>
  );
}
