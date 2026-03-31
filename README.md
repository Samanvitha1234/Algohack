# 📈 Algorand Prediction Market DApp

A modern, responsive decentralized prediction market platform on the Algorand blockchain. This DApp enables users to trade on the outcome of real-world events using a live orderbook system with real-time price feeds and seamless Pera Wallet integration.

![Prediction Market Interface](https://github.com/user-attachments/assets/4a262e6c-adc9-4ebe-a5bb-15f275406d28)

## ✨ Features

- 🔗 **Wallet Integration**: Connect with Pera Wallet for secure transactions
- � **Live Orderbook**: Real-time trading with advanced order matching
- 📈 **Price Charts**: Interactive charts showing market trends and historical data
- 🎯 **Smart Contracts**: Secure betting, automated pooling, and winning claims
- 📡 **Oracle System**: Multi-source oracle integration for real-time price feeds
- 📱 **Responsive Design**: Modern UI with glass morphism and smooth animations
- 🔍 **Market Discovery**: Advanced search and filtering capabilities
- 💼 **Portfolio Tracking**: Monitor positions and trading performance
- 🌙 **Dark Theme**: Beautiful dark theme with gradient backgrounds
- ⚡ **Real-time Updates**: Live market data and instant trade execution

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Blockchain**: Algorand SDK, Pera Wallet Connect
- **Charts**: Recharts for price visualization
- **Smart Contracts**: TEAL-based prediction market contracts
- **Oracle System**: Multi-source price feed aggregation
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Pera Wallet** (mobile app or browser extension)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/VJLIVE/Algorand-Prediction-Market-DApp.git
cd Algorand-Prediction-Market-DApp
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Pera Wallet Setup

1. **Mobile App**:
   - Download Pera Wallet from [App Store](https://apps.apple.com/app/pera-algo-wallet/id1459898525) or [Google Play](https://play.google.com/store/apps/details?id=com.algorand.android)
   - Create or import an Algorand wallet
   - Switch to **Testnet** in settings

2. **Browser Extension**:
   - Install [Pera Wallet Extension](https://chrome.google.com/webstore/detail/pera-wallet/dfkdjkdlikeabgfcejfngafbehjogpd)
   - Set up your wallet and switch to Testnet

3. **Get Testnet ALGO**:
   - Visit [Algorand Testnet Dispenser](https://algorand-testnet-dispenser.vercel.app/)
   - Enter your wallet address
   - Receive free testnet ALGO for transactions

## 💻 Usage Guide

### 1. Connect Your Wallet

1. Open the application
2. Click **Connect Wallet** in the navigation
3. Select Pera Wallet
4. Approve the connection in your wallet

### 2. Browse Markets

1. Navigate to **Markets** page
2. Browse active prediction markets
3. Use filters to find markets by category:
   - **Crypto**: Bitcoin, Ethereum, and other cryptocurrency prices
   - **Politics**: Election outcomes and policy decisions
   - **Finance**: Stock market movements and economic indicators
   - **Technology**: Product launches and company milestones

### 3. Place Trades

1. Click on any market to view details
2. Analyze the orderbook and price charts
3. Select your outcome (Yes/No)
4. Choose order type:
   - **Market Order**: Execute immediately at current price
   - **Limit Order**: Set your desired price
5. Enter amount and confirm transaction

### 4. Monitor Portfolio

1. Navigate to **Portfolio** page
2. View your active positions
3. Track P&L and trading history
4. Claim winnings from resolved markets

## 📁 Project Structure

```
src/
├── components/
│   ├── Footer.tsx          # Application footer
│   ├── Navbar.tsx          # Navigation with wallet connection
│   └── ProgressBar.tsx     # Loading progress indicator
├── context/
│   └── WalletContext.tsx   # Wallet state management
├── pages/
│   ├── Home.tsx           # Landing page
│   ├── Markets.tsx        # Market listing and discovery
│   ├── MarketDetails.tsx  # Individual market details
│   ├── OrderBook.tsx      # Advanced orderbook view
│   └── Portfolio.tsx      # User portfolio tracking
├── utils/
│   ├── algorand.ts        # Algorand blockchain utilities
│   ├── peraWallet.ts      # Pera Wallet configuration
│   └── predictionContracts.ts # Smart contract interfaces
├── App.tsx                # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## 🎨 Features Breakdown

### Core Functionality

- **🔐 Wallet Integration**: Secure connection with Pera Wallet
- **� Live Trading**: Real-time orderbook and price discovery
- **⛓️ Smart Contracts**: TEAL-based prediction market contracts
- **� Price Charts**: Interactive historical price visualization
- **� Portfolio Management**: Track positions and performance

### User Experience

- **🎭 Animations**: Smooth Framer Motion transitions
- **🔍 Market Discovery**: Advanced search and filtering
- **📱 Responsive**: Mobile-first responsive design
- **🌙 Dark Mode**: Modern dark theme with gradients
- **🔔 Notifications**: Toast notifications for user feedback

### Technical Features

- **⚡ Performance**: Optimized with Vite and React 19
- **🛡️ Type Safety**: Full TypeScript implementation
- **🔧 State Management**: React Context for global state
- **📦 Bundle Optimization**: Efficient code splitting
- **📡 Oracle Integration**: Multi-source price feeds
- **🔄 Real-time Updates**: WebSocket connections for live data

## 🔧 Advanced Configuration

### Custom Algorand Network

To use a different Algorand network, modify `src/utils/algorand.ts`:

```typescript
// For MainNet
export const algodClient = new algosdk.Algodv2("", "https://mainnet-api.algonode.cloud", "");

// For Private Network
export const algodClient = new algosdk.Algodv2("your-token", "http://localhost:4001", "");
```

### Custom Oracle Feeds

Update the oracle system in `src/utils/predictionContracts.ts`:

```typescript
// Add custom price feeds
oracleSystem.updatePrice("CUSTOM/USD", 1000);
```

### Environment Variables

```env
# Optional
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_ALGOD_TOKEN=
```

## 📱 Mobile Support

The application is fully responsive and supports:

- **Touch Gestures**: Smooth touch interactions
- **Mobile Wallets**: Pera Wallet mobile app integration
- **Responsive Layout**: Optimized for all screen sizes
- **Touch-Friendly**: Large buttons and touch targets

## 🔧 Troubleshooting

### Common Issues

**1. Wallet Connection Failed**
```
Solution: Ensure Pera Wallet is installed and set to Testnet
```

**2. Transaction Failed**
```
Check: Sufficient ALGO balance in testnet wallet
Verify: Wallet is connected and approved transaction
```

**3. Market Data Not Loading**
```
Issue: Oracle connection or network connectivity
Solution: Check internet connection and try refreshing
```

**4. Charts Not Displaying**
```
Issue: Browser compatibility or data format
Solution: Try a different browser or clear cache
```

### Debug Mode

Enable debug logging by adding to your environment:

```env
VITE_DEBUG=true
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables if needed
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for type safety
- Follow React best practices
- Write meaningful commit messages
- Test on both desktop and mobile
- Ensure responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Algorand Foundation** for the excellent blockchain platform
- **Pera Wallet** for seamless wallet integration
- **React Team** for the amazing framework
- **Tailwind CSS** for beautiful styling utilities
- **Recharts** for powerful charting capabilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/VJLIVE/Algorand-Prediction-Market-DApp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/VJLIVE/Algorand-Prediction-Market-DApp/discussions)
- **Discord**: [Algorand Discord](https://discord.gg/algorand)

## 🔗 Useful Links

- [Algorand Developer Portal](https://developer.algorand.org/)
- [Pera Wallet Documentation](https://docs.perawallet.app/)
- [Algorand TestNet Dispenser](https://algorand-testnet-dispenser.vercel.app/)
- [TEAL Language Guide](https://developer.algorand.org/docs/get-details/teal/)

---

**Happy Trading! 📈✨**
