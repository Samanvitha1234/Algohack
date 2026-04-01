import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { predictionMarketSDK } from "../utils/predictionContracts";
import type { BookSnapshot, Outcome, Trade } from "../types/market";
import { useWallet } from "../context/WalletContext";
import { useRealtime } from "../hooks/useRealtime";

const OrderBook = () => {
  const { id } = useParams<{ id: string }>();
  const { account } = useWallet();
  const [outcome, setOutcome] = useState<Outcome>("yes");
  const [book, setBook] = useState<BookSnapshot | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");

  useEffect(() => {
    if (!id) return;
    predictionMarketSDK
      .getOrderBook(Number(id), outcome)
      .then((res) => {
        setBook(res.snapshot);
        setTrades(res.trades);
      })
      .catch(() => toast.error("Failed to load orderbook"));
  }, [id, outcome]);

  const onRealtime = useCallback(
    (event: string, payload: unknown) => {
      if (event !== "book.updated") return;
      const data = payload as { marketId: number; outcome: Outcome; snapshot: BookSnapshot; trades: Trade[] };
      if (data.marketId === Number(id) && data.outcome === outcome) {
        setBook(data.snapshot);
        setTrades((prev) => [...data.trades, ...prev].slice(0, 30));
      }
    },
    [id, outcome]
  );
  useRealtime(onRealtime);

  async function place() {
    if (!account || !id) return;
    const result = await predictionMarketSDK.placeOrder(account, Number(id), side, outcome, Number(price), Number(qty)) as {
      txId?: string;
    };
    setQty("");
    setPrice("");
    toast.success(`Order submitted${result?.txId ? ` (tx: ${result.txId})` : ""}`);
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6 text-white">
      <h1 className="text-3xl font-bold">Live Orderbook</h1>
      <div className="flex gap-3">
        <button onClick={() => setOutcome("yes")} className={`px-4 py-2 rounded ${outcome === "yes" ? "bg-green-600" : "bg-white/10"}`}>
          YES
        </button>
        <button onClick={() => setOutcome("no")} className={`px-4 py-2 rounded ${outcome === "no" ? "bg-red-600" : "bg-white/10"}`}>
          NO
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/10 border border-white/20 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-green-400 mb-2">Bids</h3>
              {(book?.bids ?? []).map((b, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{(b.price * 100).toFixed(2)}%</span>
                  <span>{b.quantity.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-red-400 mb-2">Asks</h3>
              {(book?.asks ?? []).map((a, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{(a.price * 100).toFixed(2)}%</span>
                  <span>{a.quantity.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-gray-300 text-sm">
            Mark: {book?.markPrice ? `${(book.markPrice * 100).toFixed(2)}%` : "--"} | Depth: ${book?.depthUsd.toFixed(2) ?? "--"}
          </div>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold">Place Order</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className={`rounded py-2 ${side === "buy" ? "bg-green-600" : "bg-white/10"}`} onClick={() => setSide("buy")}>
              Buy
            </button>
            <button className={`rounded py-2 ${side === "sell" ? "bg-red-600" : "bg-white/10"}`} onClick={() => setSide("sell")}>
              Sell
            </button>
          </div>
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity" className="w-full rounded bg-black/20 px-3 py-2" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (0-1)" className="w-full rounded bg-black/20 px-3 py-2" />
          <button onClick={place} className="w-full rounded py-2 bg-blue-600">
            Submit
          </button>
        </div>
      </div>
      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
        <h3 className="mb-3 font-semibold">Recent Trades</h3>
        {trades.map((t) => (
          <div key={t.id} className="flex justify-between text-sm py-1 border-b border-white/10 last:border-0">
            <span>{new Date(t.timestamp).toLocaleTimeString()}</span>
            <span>{t.takerSide.toUpperCase()}</span>
            <span>{(t.price * 100).toFixed(2)}%</span>
            <span>{t.quantity.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
