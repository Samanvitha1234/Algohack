# Judge Demo Script

1. Deploy contracts: `npm run deploy:contracts` and copy app IDs to `.env`.
2. Start backend: `npm run dev:backend`.
3. Start frontend: `npm run dev`.
4. Open `GET /health` and show `appId` plus algod network target.
5. Open Markets page and place BUY/SELL orders from two wallets.
6. Show live WebSocket updates (`book.updated`, `market.updated`) and mark-price movement.
7. Trigger oracle round via `POST /oracle/rounds` and show quorum/signatures.
8. Resolve market and claim from wallet; show transaction IDs and proof metadata in responses.
9. Show database durability by restarting backend and reloading markets/trades/claims.
10. Explain ARC method surface, replay/idempotency protections, and scalability stack (PostgreSQL + WS).
