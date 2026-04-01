import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getPortfolio } from "../services/api";

interface Position {
  marketId: number;
  question: string;
  yesNet: number;
  noNet: number;
  markYes: number;
  markNo: number;
  mtmUsd: number;
}

const Portfolio = () => {
  const { account } = useWallet();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    getPortfolio(account)
      .then((res) => setPositions(res.positions))
      .finally(() => setLoading(false));
  }, [account]);

  if (!account) {
    return <div className="text-center text-white py-24">Connect wallet to view portfolio.</div>;
  }
  if (loading) {
    return <div className="text-center text-white py-24">Loading portfolio...</div>;
  }

  const total = positions.reduce((sum, p) => sum + p.mtmUsd, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Portfolio</h1>
      <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-6">
        <div className="text-gray-400 text-sm">Mark-to-market value</div>
        <div className="text-2xl font-bold">${total.toFixed(2)}</div>
      </div>
      <div className="space-y-3">
        {positions.map((p) => (
          <div key={p.marketId} className="bg-white/10 border border-white/20 rounded-xl p-4">
            <h3 className="font-semibold">{p.question}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mt-2">
              <div>YES Net: {p.yesNet.toFixed(2)}</div>
              <div>NO Net: {p.noNet.toFixed(2)}</div>
              <div>YES Mark: {(p.markYes * 100).toFixed(2)}%</div>
              <div>NO Mark: {(p.markNo * 100).toFixed(2)}%</div>
              <div>MTM: ${p.mtmUsd.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
