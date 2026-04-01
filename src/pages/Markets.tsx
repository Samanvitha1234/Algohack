import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Clock, Users, DollarSign, Search, Filter } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import toast from "react-hot-toast";
import { useQuery } from "../state/useQuery";
import { predictionMarketSDK } from "../utils/predictionContracts";
import type { Market } from "../types/market";

const Markets = () => {
  const { account } = useWallet();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newQuestion, setNewQuestion] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("crypto");
  const [newEndTime, setNewEndTime] = useState(0);
  const { data: markets = [], loading } = useQuery<Market[]>(() => predictionMarketSDK.listMarkets(), []);

  const categories = useMemo(
    () => ["all", ...new Set(markets.map((m) => m.category))],
    [markets]
  );

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch = market.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || market.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleMarketClick = (marketId: number) => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    navigate(`/market/${marketId}`);
  };

  const createMarket = async () => {
    if (!account) {
      toast.error("Connect wallet to create a market");
      return;
    }
    if (!newQuestion || !newDescription || !newEndTime) {
      toast.error("Fill all create-market fields");
      return;
    }

    if (!account) {
      toast.error("Connect wallet to create a market");
      return;
    }

    const result = await predictionMarketSDK.createMarket(newQuestion, newCategory, newDescription, newEndTime, account) as {
      txId?: string;
    };
    toast.success(`Market created${result?.txId ? ` (tx: ${result.txId})` : ""}. Refresh to see it.`);
    setNewQuestion("");
    setNewDescription("");
    setNewEndTime(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "resolved":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "locked":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
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
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">Prediction Markets</h1>
        <p className="text-gray-400 text-lg">Live orderbook and real-time mark pricing.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2 text-sm text-left">
          <input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Question"
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
          <input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description"
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="crypto">crypto</option>
            <option value="finance">finance</option>
            <option value="sports">sports</option>
          </select>
          <input
            value={newEndTime}
            onChange={(e) => setNewEndTime(Number(e.target.value))}
            placeholder="End UNIX timestamp"
            type="number"
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          />
          <button onClick={createMarket} className="px-4 py-2 bg-lime-500 text-black rounded-lg font-semibold">
            Create Market
          </button>
        </div>
      </motion.div>
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
                selectedCategory === category ? "bg-blue-600 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.map((market, index) => (
          <motion.div
            key={market.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => handleMarketClick(market.id)}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 cursor-pointer hover:bg-white/15 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(market.status)}`}>
                {market.status}
              </span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">{market.category}</span>
            </div>
            <h3 className="text-white font-semibold mb-4 line-clamp-3">{market.question}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 text-xs font-medium mb-1">Yes</div>
                <div className="text-white text-lg font-bold">{(market.yesPrice * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-400 text-xs font-medium mb-1">No</div>
                <div className="text-white text-lg font-bold">{(market.noPrice * 100).toFixed(1)}%</div>
              </div>
            </div>
            <div className="space-y-2 text-gray-400 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <DollarSign size={14} />
                  Volume
                </span>
                <span className="text-white font-medium">${market.volumeUsd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  Participants
                </span>
                <span className="text-white font-medium">{market.participants}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Ends
                </span>
                <span className="text-white font-medium">{new Date(market.endTime).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMarkets.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <TrendingUp size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No markets found</h3>
        </motion.div>
      )}
    </div>
  );
};

export default Markets;
