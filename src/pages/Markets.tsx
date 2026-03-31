import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Users, DollarSign, Search, Filter } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import toast from "react-hot-toast";

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
}

const Markets = () => {
  const { account } = useWallet();
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = ["all", "sports", "politics", "crypto", "finance", "technology"];

  useEffect(() => {
    // Mock data - replace with actual blockchain data
    const mockMarkets: Market[] = [
      {
        id: "1",
        question: "Will Bitcoin reach $100,000 by end of 2024?",
        category: "crypto",
        endTime: new Date("2024-12-31"),
        totalVolume: 50000,
        participants: 234,
        yesPrice: 0.65,
        noPrice: 0.35,
        status: "active"
      },
      {
        id: "2", 
        question: "Will the US Fed cut interest rates in Q4 2024?",
        category: "finance",
        endTime: new Date("2024-12-31"),
        totalVolume: 75000,
        participants: 456,
        yesPrice: 0.42,
        noPrice: 0.58,
        status: "active"
      },
      {
        id: "3",
        question: "Will Ethereum 2.0 staking exceed 20% by year end?",
        category: "crypto",
        endTime: new Date("2024-12-31"),
        totalVolume: 30000,
        participants: 123,
        yesPrice: 0.71,
        noPrice: 0.29,
        status: "active"
      }
    ];

    setTimeout(() => {
      setMarkets(mockMarkets);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || market.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleMarketClick = (marketId: string) => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    navigate(`/market/${marketId}`);
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

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Prediction Markets
        </h1>
        <p className="text-gray-400 text-lg">
          Trade on the outcome of real-world events
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter size={18} />
            <span className="text-sm">Category:</span>
          </div>
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.map((market, index) => (
          <motion.div
            key={market.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ y: -5, boxShadow: "0px 20px 40px rgba(0,0,0,0.3)" }}
            onClick={() => handleMarketClick(market.id)}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 cursor-pointer hover:bg-white/15 transition-all duration-300"
          >
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(market.status)}`}>
                {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                {market.category.charAt(0).toUpperCase() + market.category.slice(1)}
              </span>
            </div>

            {/* Question */}
            <h3 className="text-white font-semibold mb-4 line-clamp-3">
              {market.question}
            </h3>

            {/* Price Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 text-xs font-medium mb-1">Yes</div>
                <div className="text-white text-lg font-bold">
                  {(market.yesPrice * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-400 text-xs font-medium mb-1">No</div>
                <div className="text-white text-lg font-bold">
                  {(market.noPrice * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2 text-gray-400 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <DollarSign size={14} />
                  Volume
                </span>
                <span className="text-white font-medium">
                  ${market.totalVolume.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  Participants
                </span>
                <span className="text-white font-medium">
                  {market.participants}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Ends
                </span>
                <span className="text-white font-medium">
                  {market.endTime.toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMarkets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <TrendingUp size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No markets found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filters
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Markets;
