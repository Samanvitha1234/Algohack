import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, ArrowUpDown, BarChart3, ExternalLink } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import toast from "react-hot-toast";

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  cumulative: number;
}

interface Market {
  id: string;
  question: string;
  yesPrice: number;
  noPrice: number;
}

interface Trade {
  id: string;
  timestamp: Date;
  price: number;
  amount: number;
  type: "buy" | "sell";
  total: number;
}

const OrderBook = () => {
  const { id } = useParams<{ id: string }>();
  const { account } = useWallet();
  const navigate = useNavigate();
  const [market, setMarket] = useState<Market | null>(null);
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[], asks: OrderBookEntry[] }>({ bids: [], asks: [] });
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    // Mock data - replace with actual blockchain data
    const mockMarket: Market = {
      id: id || "1",
      question: "Will Bitcoin reach $100,000 by end of 2024?",
      yesPrice: 0.65,
      noPrice: 0.35
    };

    const mockOrderBook = {
      bids: [
        { price: 0.64, amount: 100, total: 64, cumulative: 64 },
        { price: 0.63, amount: 200, total: 126, cumulative: 190 },
        { price: 0.62, amount: 150, total: 93, cumulative: 283 },
        { price: 0.61, amount: 300, total: 183, cumulative: 466 },
        { price: 0.60, amount: 250, total: 150, cumulative: 616 },
        { price: 0.59, amount: 180, total: 106.2, cumulative: 722.2 },
        { price: 0.58, amount: 220, total: 127.6, cumulative: 849.8 },
        { price: 0.57, amount: 160, total: 91.2, cumulative: 941 },
      ].reverse(),
      asks: [
        { price: 0.66, amount: 120, total: 79.2, cumulative: 79.2 },
        { price: 0.67, amount: 180, total: 120.6, cumulative: 199.8 },
        { price: 0.68, amount: 200, total: 136, cumulative: 335.8 },
        { price: 0.69, amount: 150, total: 103.5, cumulative: 439.3 },
        { price: 0.70, amount: 100, total: 70, cumulative: 509.3 },
        { price: 0.71, amount: 130, total: 92.3, cumulative: 601.6 },
        { price: 0.72, amount: 170, total: 122.4, cumulative: 724 },
        { price: 0.73, amount: 140, total: 102.2, cumulative: 826.2 },
      ]
    };

    const mockTrades: Trade[] = [
      { id: "1", timestamp: new Date(Date.now() - 60000), price: 0.65, amount: 50, type: "buy", total: 32.5 },
      { id: "2", timestamp: new Date(Date.now() - 120000), price: 0.64, amount: 75, type: "sell", total: 48 },
      { id: "3", timestamp: new Date(Date.now() - 180000), price: 0.65, amount: 100, type: "buy", total: 65 },
      { id: "4", timestamp: new Date(Date.now() - 240000), price: 0.63, amount: 25, type: "buy", total: 15.75 },
      { id: "5", timestamp: new Date(Date.now() - 300000), price: 0.66, amount: 60, type: "sell", total: 39.6 },
      { id: "6", timestamp: new Date(Date.now() - 360000), price: 0.64, amount: 80, type: "buy", total: 51.2 },
    ];

    setTimeout(() => {
      setMarket(mockMarket);
      setOrderBook(mockOrderBook);
      setRecentTrades(mockTrades);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handlePlaceOrder = () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (orderType === "limit" && (!price || parseFloat(price) <= 0)) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Mock transaction - replace with actual blockchain transaction
    const orderPrice = orderType === "limit" ? parseFloat(price) : market?.yesPrice || 0;
    const total = parseFloat(amount) * orderPrice;
    
    toast.success(`${side === "buy" ? "Buy" : "Sell"} order placed: ${amount} shares at $${orderPrice.toFixed(2)}`);
    setPrice("");
    setAmount("");
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
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
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate(`/market/${market.id}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Market
          </motion.button>
          <div className="h-8 w-px bg-gray-600"></div>
          <h1 className="text-2xl font-bold text-white">
            Order Book
          </h1>
        </div>
        <button
          onClick={() => navigate(`/market/${market.id}`)}
          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-sm"
        >
          <ExternalLink size={14} />
          Market Details
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Book */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              {market.question}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 text-sm font-medium mb-1">Yes Price</div>
                <div className="text-white text-xl font-bold">
                  ${(market.yesPrice * 100).toFixed(2)}
                </div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-400 text-sm font-medium mb-1">No Price</div>
                <div className="text-white text-xl font-bold">
                  ${(market.noPrice * 100).toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Book Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Order Book
            </h2>
            
            <div className="space-y-4">
              {/* Asks */}
              <div>
                <h3 className="text-red-400 font-medium mb-2">Asks (Sell Orders)</h3>
                <div className="space-y-1">
                  {orderBook.asks.map((ask, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-2 text-sm py-1 hover:bg-white/5 cursor-pointer"
                      onClick={() => setPrice(ask.price.toString())}
                    >
                      <div className="text-red-400 font-medium">${ask.price.toFixed(2)}</div>
                      <div className="text-white">{ask.amount}</div>
                      <div className="text-gray-400">${ask.total.toFixed(2)}</div>
                      <div className="text-gray-500">{ask.cumulative.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spread */}
              <div className="border-t border-b border-gray-600 py-2">
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-gray-400">Spread</div>
                  <div></div>
                  <div></div>
                  <div className="text-yellow-400 font-medium">
                    {orderBook.asks.length > 0 && orderBook.bids.length > 0
                      ? (orderBook.asks[0].price - orderBook.bids[orderBook.bids.length - 1].price).toFixed(2)
                      : "0.00"}
                  </div>
                </div>
              </div>

              {/* Bids */}
              <div>
                <h3 className="text-green-400 font-medium mb-2">Bids (Buy Orders)</h3>
                <div className="space-y-1">
                  {orderBook.bids.map((bid, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-2 text-sm py-1 hover:bg-white/5 cursor-pointer"
                      onClick={() => setPrice(bid.price.toString())}
                    >
                      <div className="text-green-400 font-medium">${bid.price.toFixed(2)}</div>
                      <div className="text-white">{bid.amount}</div>
                      <div className="text-gray-400">${bid.total.toFixed(2)}</div>
                      <div className="text-gray-500">{bid.cumulative.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Headers */}
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mt-4 pt-4 border-t border-gray-600">
              <div>Price</div>
              <div>Amount</div>
              <div>Total</div>
              <div>Cumulative</div>
            </div>
          </motion.div>

          {/* Recent Trades */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Recent Trades</h2>
            <div className="space-y-2">
              {recentTrades.map((trade, index) => (
                <div key={trade.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    {trade.type === "buy" ? (
                      <TrendingUp size={16} className="text-green-400" />
                    ) : (
                      <TrendingDown size={16} className="text-red-400" />
                    )}
                    <span className="text-white font-medium">${trade.price.toFixed(2)}</span>
                    <span className="text-gray-400">{trade.amount}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white">${trade.total.toFixed(2)}</div>
                    <div className="text-gray-400 text-xs">{formatTime(trade.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Trading Panel */}
        <div className="space-y-6">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Place Order</h2>
            
            {/* Order Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Order Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrderType("limit")}
                  className={`py-2 px-4 rounded-lg font-medium transition-all ${
                    orderType === "limit"
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  Limit
                </button>
                <button
                  onClick={() => setOrderType("market")}
                  className={`py-2 px-4 rounded-lg font-medium transition-all ${
                    orderType === "market"
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  Market
                </button>
              </div>
            </div>

            {/* Side */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Side
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSide("buy")}
                  className={`py-2 px-4 rounded-lg font-medium transition-all ${
                    side === "buy"
                      ? "bg-green-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setSide("sell")}
                  className={`py-2 px-4 rounded-lg font-medium transition-all ${
                    side === "sell"
                      ? "bg-red-600 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Price (only for limit orders) */}
            {orderType === "limit" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Total */}
            {(amount && (orderType === "market" || price)) && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Total</div>
                <div className="text-lg font-semibold text-white">
                  ${(
                    parseFloat(amount) * 
                    (orderType === "market" ? market.yesPrice : parseFloat(price || "0"))
                  ).toFixed(2)}
                </div>
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={!account || !amount || parseFloat(amount) <= 0 || (orderType === "limit" && (!price || parseFloat(price) <= 0))}
              className={`w-full py-3 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                side === "buy"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {!account ? "Connect Wallet" : `Place ${side === "buy" ? "Buy" : "Sell"} Order`}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
