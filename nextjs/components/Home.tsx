import React from "react";
import TradingGraph, { TradeData } from "../components/ui/trading-graph";
import DashboardBox from "../components/ui/dashboard-card";
import { FaExchangeAlt, FaArrowDown, FaArrowUp, FaWallet } from "react-icons/fa";

const tradeData: TradeData[] = [
  { date: "Mon", trades: 14 },
  { date: "Tue", trades: 29 },
  { date: "Wed", trades: 23 },
  { date: "Thu", trades: 17 },
  { date: "Fri", trades: 31 },
  { date: "Sat", trades: 28 },
  { date: "Sun", trades: 19 }
];

type RecentTx = { type: string; asset: string; amount: string; time: string };
const recent: RecentTx[] = [
  { type: "Buy", asset: "ETH", amount: "0.5", time: "2h ago" },
  { type: "Sell", asset: "BTC", amount: "0.02", time: "6h ago" }
];

const HomeDashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <DashboardBox
          title="Recent Transactions"
          stat={`${recent.length} txns`}
          icon={<FaExchangeAlt />}
        >
          <ul className="mt-2 text-xs text-gray-300">
            {recent.map((tx, i) => (
              <li key={i}>
                {tx.type} {tx.amount} {tx.asset} <span className="ml-2 text-gray-400">{tx.time}</span>
              </li>
            ))}
          </ul>
        </DashboardBox>
        <DashboardBox
          title="Deposits"
          stat="₹95,000"
          icon={<FaArrowDown className="text-green-400" />}
        >
          <div className="text-xs text-gray-400 mt-1">This week</div>
        </DashboardBox>
        <DashboardBox
          title="Withdrawals"
          stat="₹17,000"
          icon={<FaArrowUp className="text-red-400" />}
        >
          <div className="text-xs text-gray-400 mt-1">This week</div>
        </DashboardBox>
        <DashboardBox
          title="Account Summary"
          stat="₹1,45,000"
          icon={<FaWallet className="text-yellow-300" />}
        >
          <div className="text-xs text-gray-400 mt-1">Portfolio Value</div>
        </DashboardBox>
      </div>
      <div className="bg-[#181c24] p-6 rounded-lg shadow mb-3">
        <h2 className="text-2xl font-bold mb-2 text-white">Trading Activity (7d)</h2>
        <TradingGraph data={tradeData} />
      </div>

      {/* 4-Dashboard Boxes */}

    </div>
  );
};

export default HomeDashboard;
