import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Users, DollarSign, BarChart3, ExternalLink } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import toast from "react-hot-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Market {
  id: string;
  question: string;
  category: string;
  endTime: Date;
  totalVolume: number;
  participants: number;
  yesPrice: number;
  noPrice: number;
  status: "active" | "resolved" | "upcoming";
  resolution?: boolean;
  description: string;
}

interface PriceHistory {
  time: string;
  yesPrice: number;
  noPrice: number;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

const MarketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { account } = useWallet();
  const navigate = useNavigate();
  const [market, setMarket] = useState<Market | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[], asks: OrderBookEntry[] }>({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState<"yes" | "no">("yes");

  useEffect(() => {
    // Mock data - replace with actual blockchain data
    const mockMarket: Market = {
      id: id || "1",
      question: "Will Bitcoin reach $100,000 by end of 2024?",
      category: "crypto",
      endTime: new Date("2024-12-31"),
      totalVolume: 50000,
      participants: 234,
      yesPrice: 0.65,
      noPrice: 0.35,
      status: "active",
      description: "This market resolves to 'Yes' if Bitcoin (BTC) reaches a price of $100,000 USD or higher at any point before December 31, 2024, 23:59:59 UTC. The price will be determined by the median price across major exchanges including Binance, Coinbase, and Kraken."
    };

    const mockPriceHistory: PriceHistory[] = [
      { time: "Jan", yesPrice: 0.45, noPrice: 0.55 },
      { time: "Feb", yesPrice: 0.52, noPrice: 0.48 },
      { time: "Mar", yesPrice: 0.58, noPrice: 0.42 },
      { time: "Apr", yesPrice: 0.61, noPrice: 0.39 },
      { time: "May", yesPrice: 0.63, noPrice: 0.37 },
      { time: "Jun", yesPrice: 0.65, noPrice: 0.35 },
    ];

    const mockOrderBook = {
      bids: [
        { price: 0.64, amount: 100, total: 64 },
        { price: 0.63, amount: 200, total: 126 },
        { price: 0.62, amount: 150, total: 93 },
        { price: 0.61, amount: 300, total: 183 },
        { price: 0.60, amount: 250, total: 150 },
      ],
      asks: [
        { price: 0.66, amount: 120, total: 79.2 },
        { price: 0.67, amount: 180, total: 120.6 },
        { price: 0.68, amount: 200, total: 136 },
        { price: 0.69, amount: 150, total: 103.5 },
        { price: 0.70, amount: 100, total: 70 },
      ]
    };

    setTimeout(() => {
      setMarket(mockMarket);
      setPriceHistory(mockPriceHistory);
      setOrderBook(mockOrderBook);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handlePlaceBet = () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }
    
    // Mock transaction - replace with actual blockchain transaction
    toast.success(`Placed ${selectedOutcome} bet of ${betAmount} ALGO`);
    setBetAmount("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "resolved": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "upcoming": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

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

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Market not found</h2>
          <button
            onClick={() => navigate("/markets")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Markets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => navigate("/markets")}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Markets
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(market.status)}`}>
                {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                {market.category.charAt(0).toUpperCase() + market.category.slice(1)}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">
              {market.question}
            </h1>

            <p className="text-gray-400 mb-6">
              {market.description}
            </p>

            {/* Price Display */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-medium">Yes</span>
                  <TrendingUp size={16} className="text-green-400" />
                </div>
                <div className="text-white text-2xl font-bold">
                  {(market.yesPrice * 100).toFixed(0)}%
                </div>
                <div className="text-gray-400 text-sm">
                  ${market.yesPrice.toFixed(2)}
                </div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-400 font-medium">No</span>
                  <TrendingDown size={16} className="text-red-400" />
                </div>
                <div className="text-white text-2xl font-bold">
                  {(market.noPrice * 100).toFixed(0)}%
                </div>
                <div className="text-gray-400 text-sm">
                  ${market.noPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Price Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Price History
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Area
                  type="monotone"
                  dataKey="yesPrice"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Yes Price"
                />
                <Area
                  type="monotone"
                  dataKey="noPrice"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="No Price"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Order Book */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Order Book</h2>
              <button
                onClick={() => navigate(`/orderbook/${market.id}`)}
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-sm"
              >
                <ExternalLink size={14} />
                Full View
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Bids */}
              <div>
                <h3 className="text-green-400 font-medium mb-3">Bids (Buy Yes)</h3>
                <div className="space-y-2">
                  {orderBook.bids.map((bid, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-400">${bid.price.toFixed(2)}</span>
                      <span className="text-white">{bid.amount}</span>
                      <span className="text-gray-400">${bid.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asks */}
              <div>
                <h3 className="text-red-400 font-medium mb-3">Asks (Sell Yes)</h3>
                <div className="space-y-2">
                  {orderBook.asks.map((ask, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-400">${ask.price.toFixed(2)}</span>
                      <span className="text-white">{ask.amount}</span>
                      <span className="text-gray-400">${ask.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Stats */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Market Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <DollarSign size={16} />
                  Volume
                </span>
                <span className="text-white font-medium">
                  ${market.totalVolume.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <Users size={16} />
                  Participants
                </span>
                <span className="text-white font-medium">
                  {market.participants}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <Clock size={16} />
                  Ends
                </span>
                <span className="text-white font-medium">
                  {market.endTime.toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Place Bet */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Place Bet</h2>
            
            <div className="space-y-4">
              {/* Outcome Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Outcome
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedOutcome("yes")}
                    className={`py-2 px-4 rounded-lg font-medium transition-all ${
                      selectedOutcome === "yes"
                        ? "bg-green-600 text-white"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setSelectedOutcome("no")}
                    className={`py-2 px-4 rounded-lg font-medium transition-all ${
                      selectedOutcome === "no"
                        ? "bg-red-600 text-white"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (ALGO)
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Potential Return */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Potential Return</div>
                  <div className="text-lg font-semibold text-white">
                    {selectedOutcome === "yes"
                      ? (parseFloat(betAmount) / market.yesPrice).toFixed(2)
                      : (parseFloat(betAmount) / market.noPrice).toFixed(2)} ALGO
                  </div>
                </div>
              )}

              {/* Place Bet Button */}
              <button
                onClick={handlePlaceBet}
                disabled={!account || !betAmount || parseFloat(betAmount) <= 0}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!account ? "Connect Wallet" : "Place Bet"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetails;
