import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Clock, Eye, EyeOff } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import toast from "react-hot-toast";

interface Position {
  id: string;
  marketQuestion: string;
  marketCategory: string;
  outcome: "yes" | "no";
  amount: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  status: "active" | "won" | "lost";
  endTime: Date;
}

interface Transaction {
  id: string;
  type: "buy" | "sell" | "win" | "loss";
  marketQuestion: string;
  outcome: "yes" | "no";
  amount: number;
  price: number;
  total: number;
  timestamp: Date;
}

const Portfolio = () => {
  const { account } = useWallet();
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"positions" | "transactions">("positions");

  useEffect(() => {
    if (!account) {
      setLoading(false);
      return;
    }

    // Mock data - replace with actual blockchain data
    const mockPositions: Position[] = [
      {
        id: "1",
        marketQuestion: "Will Bitcoin reach $100,000 by end of 2024?",
        marketCategory: "crypto",
        outcome: "yes",
        amount: 100,
        avgPrice: 0.60,
        currentPrice: 0.65,
        value: 108.33,
        pnl: 8.33,
        pnlPercent: 8.33,
        status: "active",
        endTime: new Date("2024-12-31")
      },
      {
        id: "2",
        marketQuestion: "Will the US Fed cut interest rates in Q4 2024?",
        marketCategory: "finance",
        outcome: "no",
        amount: 50,
        avgPrice: 0.55,
        currentPrice: 0.58,
        value: 86.21,
        pnl: 36.21,
        pnlPercent: 72.42,
        status: "active",
        endTime: new Date("2024-12-31")
      },
      {
        id: "3",
        marketQuestion: "Will Ethereum 2.0 staking exceed 20%?",
        marketCategory: "crypto",
        outcome: "yes",
        amount: 75,
        avgPrice: 0.70,
        currentPrice: 0.71,
        value: 76.07,
        pnl: 1.07,
        pnlPercent: 1.43,
        status: "won",
        endTime: new Date("2024-06-30")
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: "1",
        type: "buy",
        marketQuestion: "Will Bitcoin reach $100,000 by end of 2024?",
        outcome: "yes",
        amount: 100,
        price: 0.60,
        total: 60,
        timestamp: new Date("2024-01-15")
      },
      {
        id: "2",
        type: "buy",
        marketQuestion: "Will the US Fed cut interest rates in Q4 2024?",
        outcome: "no",
        amount: 50,
        price: 0.55,
        total: 27.5,
        timestamp: new Date("2024-02-20")
      },
      {
        id: "3",
        type: "win",
        marketQuestion: "Will Ethereum 2.0 staking exceed 20%?",
        outcome: "yes",
        amount: 75,
        price: 1.00,
        total: 75,
        timestamp: new Date("2024-06-30")
      }
    ];

    setTimeout(() => {
      setPositions(mockPositions);
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, [account]);

  const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "won": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "lost": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy": return <TrendingUp size={16} className="text-green-400" />;
      case "sell": return <TrendingDown size={16} className="text-red-400" />;
      case "win": return <DollarSign size={16} className="text-green-400" />;
      case "loss": return <DollarSign size={16} className="text-red-400" />;
      default: return null;
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Wallet size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your portfolio and trading history
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Portfolio
        </h1>
        <p className="text-gray-400 text-lg">
          Track your positions and trading performance
        </p>
      </motion.div>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Value</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="text-2xl font-bold text-white">
            {showBalance ? `$${totalValue.toFixed(2)}` : "•••••"}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total P&L</span>
            {totalPnL >= 0 ? (
              <TrendingUp size={16} className="text-green-400" />
            ) : (
              <TrendingDown size={16} className="text-red-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
            {showBalance ? `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}` : "•••••"}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">P&L %</span>
            {totalPnLPercent >= 0 ? (
              <TrendingUp size={16} className="text-green-400" />
            ) : (
              <TrendingDown size={16} className="text-red-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${totalPnLPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
            {showBalance ? `${totalPnLPercent >= 0 ? "+" : ""}${totalPnLPercent.toFixed(2)}%` : "•••••"}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Positions</span>
            <Wallet size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {positions.length}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-1 mb-6 bg-white/10 backdrop-blur-md rounded-xl p-1 max-w-md"
      >
        <button
          onClick={() => setActiveTab("positions")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === "positions"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Positions
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === "transactions"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Transactions
        </button>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
      >
        {activeTab === "positions" ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Your Positions</h2>
            
            {positions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No positions yet</h3>
                <p className="text-gray-500">Start trading to build your portfolio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div
                    key={position.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1 line-clamp-2">
                          {position.marketQuestion}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {position.marketCategory}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(position.status)}`}>
                            {position.status}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {position.endTime.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-white font-semibold">
                          ${position.value.toFixed(2)}
                        </div>
                        <div className={`text-sm font-medium ${position.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Outcome</span>
                        <div className="text-white font-medium">
                          {position.outcome.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Amount</span>
                        <div className="text-white font-medium">
                          {position.amount}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Avg Price</span>
                        <div className="text-white font-medium">
                          ${position.avgPrice.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Current</span>
                        <div className="text-white font-medium">
                          ${position.currentPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No transactions yet</h3>
                <p className="text-gray-500">Your trading history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h4 className="text-white font-medium">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </h4>
                        <p className="text-gray-400 text-sm line-clamp-1">
                          {transaction.marketQuestion}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {transaction.type === "buy" ? "-" : "+"}${transaction.total.toFixed(2)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {transaction.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Portfolio;
