import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/Home";
import MarketsPage from "./pages/Markets";
import Footer from "./components/Footer";
import { WalletProvider } from "./context/WalletContext";
import { Toaster } from "react-hot-toast";
import MarketDetails from "./pages/MarketDetails";
import PortfolioPage from "./pages/Portfolio";
import OrderBook from "./pages/OrderBook";

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-blue-950 text-white">
          <Navbar />
          <main className="flex-grow pt-24 px-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/markets" element={<MarketsPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/market/:id" element={<MarketDetails />} />
              <Route path="/orderbook/:id" element={<OrderBook />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </Router>
    </WalletProvider>
  );
}




export default App;
