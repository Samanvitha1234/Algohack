import { useNavigate } from "react-router-dom";
import algorandLogo from "/algorand.svg";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  Link as LinkIcon,
  TrendingUp,
  BarChart3,
  Wallet,
} from "lucide-react";
import { useWallet } from "../context/WalletContext";

const Home = () => {
  const navigate = useNavigate();
  const { connect, account } = useWallet();
  
  const boxes = [
    {
      icon: <LinkIcon size={28} />,
      title: "Connect Wallet",
      desc: "Easily connect your Algorand Testnet wallet via Pera Wallet.",
      onClick: () => {
        if (account) {
          toast.error("Wallet already connected ✅");
        } else {
          connect();
        }
      },
    },
    {
      icon: <TrendingUp size={28} />,
      title: "Browse Markets",
      desc: "Explore active prediction markets and place your bets.",
      onClick: () => navigate("/markets"),
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Live Orderbook",
      desc: "View real-time trading data and market depth.",
      onClick: () => navigate("/markets"),
    },
    {
      icon: <Wallet size={28} />,
      title: "Portfolio",
      desc: "Track your positions and view trading history.",
      onClick: () => navigate("/portfolio"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-900 px-4 pt-5 pb-10 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-10 max-w-5xl w-full text-center border border-white/10">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center space-y-4"
        >
          <img src={algorandLogo} alt="Algorand" className="w-16 h-16" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Algorand Prediction Market
          </h1>
          <p className="text-gray-300 text-lg max-w-xl">
            Trade on real-world events with decentralized prediction markets on Algorand.
            Connect your wallet, browse markets, and start predicting outcomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {boxes.map(({ icon, title, desc, onClick }, idx) => (
            <motion.button
              key={idx}
              onClick={onClick}
              whileHover={{ y: -6, boxShadow: "0px 12px 30px rgba(0,0,0,0.3)" }}
              transition={{ type: "spring", stiffness: 200 }}
              className="rounded-xl bg-white/10 text-white p-6 text-left space-y-3 backdrop-blur-lg border border-white/10 text-left hover:bg-white/20 focus:outline-none"
            >
              <div className="text-blue-400">{icon}</div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-gray-200">{desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
