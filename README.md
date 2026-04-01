# Algorand Prediction Market

Hackathon-grade decentralized prediction market with:
- Algorand-first architecture (contracts + settlement path)
- Live orderbook with WebSocket updates
- Multi-source oracle aggregation with quorum metadata
- Real-time mark price and portfolio MTM

## Project Layout

- `smart_contracts/` - PuyaTs contract sources (prediction market + oracle registry)
- `backend/` - orderbook engine, oracle aggregation, websocket broadcast, API
- `src/` - React dApp (markets, market details, orderbook, portfolio)
- `scripts/` - deploy and seed scripts
- `tests/` - matching/oracle tests

## Architecture

The system follows a modular architecture:

- **Smart Contracts** → Handle prediction logic and settlement  
- **Backend Engine** → Orderbook matching + oracle aggregation  
- **Frontend dApp** → User interface for trading and analytics  
- **WebSocket Layer** → Real-time updates  

**Data Flow:**  
User → Frontend → Backend → Smart Contract → Blockchain

##  Workflow

1. User connects wallet  
2. User selects a prediction market  
3. Places buy/sell order  
4. Order matched via backend engine  
5. Oracle fetches real-world result  
6. Smart contract settles outcome  
7. Winners claim rewards  

## Quick Start

1) Install frontend dependencies:

```bash
npm install
Install backend dependencies:
npm --prefix backend install
Start backend:
npm run dev:backend
Start frontend:
npm run dev

Frontend defaults:

Web: http://localhost:5173
Backend API: http://localhost:8787
WebSocket: ws://localhost:8787/ws
Algorand + ARC Notes
Smart contract files are in smart_contracts/ with ARC-4 style method declarations.
Deploy script compiles and deploys TEAL artifacts for both prediction and oracle registry apps.
Backend and frontend calls are aligned to ABI-style encoded arguments for app methods.
Available Scripts
npm run dev - run frontend
npm run dev:backend - run backend API/ws
npm run test - run Vitest suite
npm run deploy:contracts - deploy prediction + oracle registry app
npm run seed:markets - seed orderbook depth
npm run db:generate - generate Prisma client
npm run db:push - push Prisma schema to PostgreSQL
Environment

Optional frontend env:

VITE_BACKEND_URL=http://localhost:8787
VITE_WS_URL=ws://localhost:8787/ws

Optional deployment env:

ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGO_TOKEN=
ALGOD_PORT=
DEPLOYER_MNEMONIC=...
PREDICTION_APP_ID=...      # set after deploy
ORACLE_REGISTRY_APP_ID=... # set after deploy
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prediction_market?schema=public

For backend Algorand integration run:

npm --prefix backend install
npm --prefix backend run dev

Then deploy contract and populate app id:

npm run deploy:contracts
# set PREDICTION_APP_ID + ORACLE_REGISTRY_APP_ID in .env based on output

Verify backend health and chain wiring:

curl http://localhost:8787/health

---

If you want, I can also make this **more attractive with badges + emojis + GitHub styling** 🔥
