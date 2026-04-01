import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import toast from "react-hot-toast";
import { predictionMarketSDK } from "../utils/predictionContracts";
import type { BookSnapshot, Market } from "../types/market";
import { useRealtime } from "../hooks/useRealtime";
import { getLatestOracleRound, type OracleRoundPayload } from "../services/api";
import { getErrorMessage } from "../utils/errors";

const MarketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { account } = useWallet();
  const navigate = useNavigate();
  const [market, setMarket] = useState<Market | null>(null);
  const [yesBook, setYesBook] = useState<BookSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [outcome, setOutcome] = useState<"yes" | "no">("yes");
  const [oracleRound, setOracleRound] = useState<OracleRoundPayload | null>(null);

  useEffect(() => {
    if (!id) return;
    predictionMarketSDK
      .getMarketDetails(Number(id))
      .then((res) => {
        setMarket(res.market);
        setYesBook(res.books.yes);
      })
      .catch(() => toast.error("Could not load market"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    getLatestOracleRound().then(setOracleRound);
  }, []);

  const onRealtime = useCallback(
    (event: string, payload: unknown) => {
      if (event === "market.updated") {
        const data = payload as { market: Market };
        if (data.market.id === Number(id)) {
          setMarket(data.market);
        }
      }
      if (event === "book.updated") {
        const data = payload as { marketId: number; outcome: "yes" | "no"; snapshot: BookSnapshot };
        if (data.marketId === Number(id) && data.outcome === "yes") {
          setYesBook(data.snapshot);
        }
      }
    },
    [id]
  );
  useRealtime(onRealtime);

  async function place() {
    if (!id || !account) {
      toast.error("Connect wallet first");
      return;
    }
    const quantity = Number(qty);
    const limitPrice = Number(price);
    if (quantity <= 0 || limitPrice <= 0) {
      toast.error("Invalid quantity or price");
      return;
    }
    try {
      const result = await predictionMarketSDK.placeOrder(account, Number(id), "buy", outcome, limitPrice, quantity) as {
        txId?: string;
      };
      toast.success(`Order placed${result?.txId ? ` (tx: ${result.txId})` : ""}`);
      setQty("");
      setPrice("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Order failed"));
    }
  }

  async function resolve() {
    if (!id || !account) return;
    try {
      const currentOutcome = market?.yesPrice && market?.noPrice && market.yesPrice >= market.noPrice ? "yes" : "no";
      const result = await predictionMarketSDK.resolveMarket(Number(id), currentOutcome, account) as { txId?: string };
      toast.success(`Market resolved${result?.txId ? ` (tx: ${result.txId})` : ""}`);
      setMarket((m) => (m ? { ...m, status: "resolved", resolution: currentOutcome } as any : m));
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not resolve market"));
    }
  }

  async function claim() {
    if (!id || !account) return;
    try {
      const claimResult = await predictionMarketSDK.claimMarket(Number(id), account);
      toast.success(`Claim broadcasted (tx: ${(claimResult as any).txId ?? "n/a"})`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Claim failed"));
    }
  }

  if (loading) {
    return <div className="text-white text-center py-24">Loading market...</div>;
  }
  if (!market) {
    return <div className="text-white text-center py-24">Market not found.</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      <motion.button onClick={() => navigate("/markets")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={20} />
        Back to Markets
      </motion.button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-white mb-2">{market.question}</h1>
            <p className="text-gray-400 mb-4">{market.description}</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-green-400">YES {(market.yesPrice * 100).toFixed(2)}%</div>
              <div className="text-red-400">NO {(market.noPrice * 100).toFixed(2)}%</div>
              <div className="text-yellow-400">MARK {((yesBook?.markPrice ?? market.yesPrice) * 100).toFixed(2)}%</div>
            </div>
            {oracleRound && (
              <div className="mt-4 text-xs text-gray-300 border-t border-white/10 pt-3">
                Oracle: {oracleRound.symbol} | quorum: {oracleRound.quorumReached ? "reached" : "not reached"} | median: {oracleRound.medianPrice}
              </div>
            )}
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl text-white font-semibold">YES Orderbook</h2>
              <button onClick={() => navigate(`/orderbook/${market.id}`)} className="text-blue-400 flex gap-1 items-center">
                <ExternalLink size={14} /> Full View
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-green-400 mb-2">Bids</h3>
                {(yesBook?.bids ?? []).slice(0, 8).map((b, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{(b.price * 100).toFixed(2)}%</span>
                    <span>{b.quantity.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-red-400 mb-2">Asks</h3>
                {(yesBook?.asks ?? []).slice(0, 8).map((a, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{(a.price * 100).toFixed(2)}%</span>
                    <span>{a.quantity.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl p-6 h-fit">
          <h2 className="text-xl text-white font-semibold mb-4">Trade</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button className={`py-2 rounded ${outcome === "yes" ? "bg-green-600" : "bg-white/10"}`} onClick={() => setOutcome("yes")}>
                YES
              </button>
              <button className={`py-2 rounded ${outcome === "no" ? "bg-red-600" : "bg-white/10"}`} onClick={() => setOutcome("no")}>
                NO
              </button>
            </div>
            <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity" className="w-full px-3 py-2 bg-black/20 rounded" />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Limit price (0-1)" className="w-full px-3 py-2 bg-black/20 rounded" />
            <button onClick={place} className="w-full py-2 bg-blue-600 rounded text-white">
              Place Order
            </button>            {market?.status === "open" && (
              <button onClick={resolve} className="w-full py-2 bg-yellow-600 rounded text-white">
                Resolve Market (oracle)
              </button>
            )}
            {market?.status === "resolved" && account && (
              <button onClick={claim} className="w-full py-2 bg-green-700 rounded text-white">
                Claim Winnings
              </button>
            )}          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetails;
