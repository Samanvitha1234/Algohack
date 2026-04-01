# Architecture

## Components

- Frontend React dApp for market UX and wallet connection
- Backend service for low-latency orderbook + matching + persistence
- Oracle aggregator service collecting multiple sources with signature quorum
- Algorand contract layer for settlement and claims
- PostgreSQL + Prisma for durable market/order/trade/claim/oracle state

## Data Flow

1. User places order from UI.
2. Backend matching engine matches and updates orderbook.
3. Matched trades and market state are persisted to PostgreSQL.
4. Backend emits updates over WebSocket.
5. Match batches are committed to Algorand app methods.
6. Oracle rounds aggregate source prices, include reporter signatures, and enforce quorum.
7. Market resolution references verified oracle rounds.
8. Claims are replay-protected and written to DB + on-chain call path.
