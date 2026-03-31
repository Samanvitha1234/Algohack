import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, TrendingUp, Menu, X, Sparkles, Wallet } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { account, connect, disconnect } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  const handleCopy = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        // fallback for older browsers
        setCopied(false);
      }
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="backdrop-blur-xl bg-gradient-to-r from-slate-900/90 via-blue-900/80 to-slate-900/90 shadow-2xl shadow-blue-500/10 px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 border-b border-gradient-to-r from-transparent via-blue-400/30 to-transparent"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/"
            className="flex items-center gap-3 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent hover:from-blue-300 hover:via-cyan-300 hover:to-blue-400 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg"
            aria-label="Algorand Prediction Market - Go to homepage"
          >
            <motion.div 
              className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg group-hover:shadow-blue-500/25"
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <TrendingUp size={24} strokeWidth={2.5} className="text-white" />
            </motion.div>
            <span className="hidden sm:inline">Prediction Market</span>
            <span className="sm:hidden">Predict</span>
          </Link>
        </motion.div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-1 items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                location.pathname === "/" 
                  ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25" 
                  : "text-gray-200 hover:text-white hover:bg-white/10"
              }`}
            >
              Home
              {location.pathname === "/" && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          </motion.div>
          {account && (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/markets"
                  className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    location.pathname === "/markets" 
                      ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25" 
                      : "text-gray-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Markets
                  {location.pathname === "/markets" && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/portfolio"
                  className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    location.pathname === "/portfolio" 
                      ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25" 
                      : "text-gray-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Portfolio
                  {location.pathname === "/portfolio" && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </motion.div>

            </>
            
          )}

          {account ? (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3"
              >
                <motion.span
                  className="relative group bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-4 py-2 rounded-xl text-xs font-mono tracking-wide cursor-pointer hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  title="Copy wallet address to clipboard"
                  onClick={handleCopy}
                  whileHover={{ y: -2 }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Copy wallet address ${account?.slice(0, 6)}...${account?.slice(-4)} to clipboard`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCopy();
                    }
                  }}
                >
                  <Wallet size={14} className="inline mr-2" />
                  {account.slice(0, 6)}...{account.slice(-4)}
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.05 }}
                  />
                </motion.span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={disconnect}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs rounded-xl hover:from-red-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Disconnect wallet"
                >
                  <LogOut size={14} />
                  <span className="hidden lg:inline">Disconnect</span>
                </motion.button>
              </motion.div>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={connect}
              className="relative flex items-center gap-2 overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white text-sm font-semibold transition-all duration-300 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg hover:shadow-blue-500/25 group"
              aria-label="Connect your wallet to access prediction market features"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              />
              <div className="z-10 flex items-center gap-2">
                <Wallet size={18} />
                <span>Connect Wallet</span>
                <Sparkles size={16} className="animate-pulse" />
              </div>
            </motion.button>
          )}
        </div>

        {/* Hamburger (Mobile) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 hover:text-white hover:from-blue-600/40 hover:to-cyan-600/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <motion.div
            animate={{ rotate: menuOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.div>
        </motion.button>
      </motion.nav>

      {/* Enhanced Toast notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-60"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl shadow-2xl shadow-emerald-500/25 flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles size={18} className="text-emerald-200" />
              </motion.div>
              <span className="font-medium">Address copied to clipboard!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.1 }}
              className="fixed top-0 right-0 w-80 h-full bg-gradient-to-b from-slate-900 via-blue-900/50 to-slate-900 backdrop-blur-xl shadow-2xl shadow-blue-500/20 z-40 pt-24 px-6 space-y-8 md:hidden border-l border-blue-400/20"
              id="mobile-menu"
              role="menu"
              aria-label="Mobile navigation menu"
            >
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === "/"
                    ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg"
                    : "text-gray-200 hover:text-white hover:bg-white/10"
                }`}
              >
                🏠 Home
              </Link>
            </motion.div>
            {account && (
              <>
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    to="/markets"
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      location.pathname === "/markets"
                        ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg"
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    📈 Markets
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to="/portfolio"
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      location.pathname === "/portfolio"
                        ? "text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg"
                        : "text-gray-200 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    � Portfolio
                  </Link>
                </motion.div>
              </>
            )}

            {account ? (
              <>
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 border-t border-white/10"
                >
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-4 py-3 rounded-xl text-sm font-mono tracking-wide cursor-pointer hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300 shadow-lg flex items-center gap-2"
                    title="Copy address"
                    onClick={handleCopy}
                  >
                    <Wallet size={16} />
                    {account.slice(0, 8)}...{account.slice(-6)}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => {
                      disconnect();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white text-sm rounded-xl hover:from-red-500 hover:to-pink-500 transition-all duration-300 shadow-lg"
                  >
                    <LogOut size={16} />
                    Disconnect Wallet
                  </button>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-4 border-t border-white/10"
              >
                <button
                  onClick={() => {
                    connect();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white text-sm rounded-xl hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg"
                >
                  <Wallet size={18} />
                  Connect Wallet
                  <Sparkles size={16} className="animate-pulse" />
                </button>
              </motion.div>
            )}
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
