import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import algosdk from "algosdk";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { MatchingEngine } from "../orderbook/engine.js";
import { OrderBookStore, Outcome } from "../orderbook/store.js";
import { OracleAggregator } from "../oracle/aggregator.js";
import { WsHub } from "../ws/hub.js";
import { prisma } from "../db/client.js";
import { callPredictionApp } from "../algorand/predictionApp.js";

interface Market {
  id: number;
  question: string;
  category: string;
  description: string;
  endTime: number;
  status: "open" | "locked" | "resolved";
  yesPrice: number;
  noPrice: number;
  volumeUsd: number;
  participants: number;
  resolution?: "yes" | "no" | null;
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 10_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const markets: Market[] = [];

const store = new OrderBookStore();
const engine = new MatchingEngine(store);
const oracle = new OracleAggregator();

const server = http.createServer(app);
const wsHub = new WsHub(server);

const ALGOD_TOKEN = process.env.ALGOD_TOKEN ?? "";
const ALGOD_SERVER = process.env.ALGOD_SERVER ?? "https://testnet-api.algonode.cloud";
const ALGOD_PORT = process.env.ALGOD_PORT ?? "";
const PREDICTION_APP_ID = Number(process.env.PREDICTION_APP_ID ?? "0");
const DEPLOYER_MNEMONIC = process.env.DEPLOYER_MNEMONIC ?? "";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY ?? "";

let algodClient: algosdk.Algodv2 | null = null;
let deployerAccount: algosdk.Account | null = null;

if (PREDICTION_APP_ID > 0 && DEPLOYER_MNEMONIC) {
  algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
  deployerAccount = algosdk.mnemonicToSecretKey(DEPLOYER_MNEMONIC);
}

const claimLedger = new Map<string, boolean>();

function requireAdmin(req: express.Request, res: express.Response): boolean {
  if (!ADMIN_API_KEY) return true;
  if (req.header("x-admin-key") === ADMIN_API_KEY) return true;
  res.status(401).json({ error: "Unauthorized admin action" });
  return false;
}

function computeWalletPositions(wallet: string, marketId: number) {
  const yesTrades = store.getTrades(marketId, "yes");
  const noTrades = store.getTrades(marketId, "no");

  const yesNet = yesTrades.reduce((sum, trade) => {
    if (trade.buyWallet === wallet) return sum + trade.quantity;
    if (trade.sellWallet === wallet) return sum - trade.quantity;
    return sum;
  }, 0);

  const noNet = noTrades.reduce((sum, trade) => {
    if (trade.buyWallet === wallet) return sum + trade.quantity;
    if (trade.sellWallet === wallet) return sum - trade.quantity;
    return sum;
  }, 0);

  return { yesNet, noNet };
}

async function invokePredictionApp(action: string, marketId: number, wallet?: string): Promise<void> {
  if (!algodClient || !deployerAccount || PREDICTION_APP_ID <= 0) {
    console.warn("Algorand app call skipped (not configured)");
    return;
  }
  const args: Array<string | number> = wallet ? [marketId, wallet] : [marketId];
  await callPredictionApp({
    algodClient,
    appId: PREDICTION_APP_ID,
    account: deployerAccount,
    method: action as "createMarket" | "commitMatchBatch" | "resolveMarket" | "claim",
    args,
  });
}

function hydrateMarketsFromDb(rows: Array<Record<string, unknown>>): Market[] {
  return rows.map((row) => ({
    id: Number(row.id),
    question: String(row.question),
    category: String(row.category),
    description: String(row.description),
    endTime: Number(row.endTime),
    status: row.status as "open" | "locked" | "resolved",
    yesPrice: Number(row.yesPrice),
    noPrice: Number(row.noPrice),
    volumeUsd: Number(row.volumeUsd),
    participants: Number(row.participants),
    resolution: (row.resolution as "yes" | "no" | null | undefined) ?? null,
  }));
}

async function bootstrapMarkets(): Promise<void> {
  const dbMarkets = await prisma.market.findMany({ orderBy: { id: "asc" } });
  if (dbMarkets.length === 0) {
    await prisma.market.create({
      data: {
        question: "Will BTC close above $100K before year-end?",
        category: "crypto",
        description: "Resolves true if BTC/USD crosses 100,000 on approved data sources before market close.",
        endTime: BigInt(Date.now() + 1000 * 60 * 60 * 24 * 60),
        status: "open",
        yesPrice: 0.58,
        noPrice: 0.42,
        volumeUsd: 125_000,
        participants: 415,
      },
    });
  }
  const refreshed = await prisma.market.findMany({ orderBy: { id: "asc" } });
  markets.splice(0, markets.length, ...hydrateMarketsFromDb(refreshed as unknown as Array<Record<string, unknown>>));
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "prediction-backend",
    algorand: PREDICTION_APP_ID > 0,
    algod: ALGOD_SERVER,
    appId: PREDICTION_APP_ID,
  });
});

app.get("/markets", (_req, res) => {
  res.json({ markets });
});

app.get("/markets/:id", (req, res) => {
  const marketId = Number(req.params.id);
  const market = markets.find((m) => m.id === marketId);
  if (!market) {
    return res.status(404).json({ error: "Market not found" });
  }
  const yesBook = store.getSnapshot(marketId, "yes");
  const noBook = store.getSnapshot(marketId, "no");
  return res.json({ market, books: { yes: yesBook, no: noBook } });
});

app.post("/markets", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const input = z
    .object({
      question: z.string().min(10),
      category: z.string().min(2),
      description: z.string().min(10),
      endTime: z.number().int().positive(),
    })
    .safeParse(req.body);
  if (!input.success) {
    return res.status(400).json({ error: "Invalid market payload", details: input.error.issues });
  }

  const created = await prisma.market.create({
    data: {
      question: input.data.question,
      category: input.data.category,
      description: input.data.description,
      endTime: BigInt(input.data.endTime),
      status: "open",
      yesPrice: 0.5,
      noPrice: 0.5,
      volumeUsd: 0,
      participants: 0,
    },
  });
  const market: Market = {
    id: created.id,
    question: created.question,
    category: created.category,
    description: created.description,
    endTime: Number(created.endTime),
    status: "open",
    yesPrice: 0.5,
    noPrice: 0.5,
    volumeUsd: 0,
    participants: 0,
    resolution: null,
  };
  markets.push(market);

  wsHub.broadcast("market.created", { market });
  return res.status(201).json({ market });
});

app.post("/markets/:id/resolve", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const marketId = Number(req.params.id);
  const sentiment = req.body.sentiment as "yes" | "no" | undefined;
  const market = markets.find((m) => m.id === marketId);
  if (!market) {
    return res.status(404).json({ error: "Market not found" });
  }

  if (market.status !== "open") {
    return res.status(400).json({ error: "Market is not open" });
  }

  let outcome: "yes" | "no";
  if (sentiment) {
    outcome = sentiment;
  } else {
    const oracleResult = await oracle.buildRound("BTCUSD");
    outcome = oracleResult.medianPrice >= 0.5 ? "yes" : "no";
  }

  market.status = "resolved";
  market.resolution = outcome;
  await prisma.market.update({
    where: { id: marketId },
    data: {
      status: "resolved",
      resolution: outcome,
    },
  });

  try {
    await invokePredictionApp("resolveMarket", marketId);
  } catch (e) {
    console.error("Failed to invoke resolveMarket on contract", e);
  }

  wsHub.broadcast("market.resolved", { market });
  return res.json({ market });
});

app.post("/markets/:id/claim", async (req, res) => {
  const marketId = Number(req.params.id);
  const claimInput = z.object({ wallet: z.string().min(20) }).safeParse(req.body);
  if (!claimInput.success) {
    return res.status(400).json({ error: "Invalid claim payload", details: claimInput.error.issues });
  }
  const wallet = claimInput.data.wallet;
  if (!wallet) {
    return res.status(400).json({ error: "Missing wallet address" });
  }

  const market = markets.find((m) => m.id === marketId);
  if (!market) {
    return res.status(404).json({ error: "Market not found" });
  }

  if (market.status !== "resolved" || !market.resolution) {
    return res.status(400).json({ error: "Market is not resolved yet" });
  }

  const claimKey = `${marketId}:${wallet}`;
  if (claimLedger.get(claimKey)) {
    return res.status(409).json({ error: "Already claimed" });
  }

  const positions = computeWalletPositions(wallet, marketId);
  const winningQty = market.resolution === "yes" ? positions.yesNet : positions.noNet;
  const payout = Math.max(0, winningQty) * 1.0;

  claimLedger.set(claimKey, true);
  await prisma.claim.upsert({
    where: { marketId_wallet: { marketId, wallet } },
    create: { marketId, wallet, payout },
    update: { payout },
  });

  try {
    await invokePredictionApp("claim", marketId, wallet);
  } catch (e) {
    console.error("Failed to invoke claim on contract", e);
  }

  wsHub.broadcast("market.claim", { marketId, wallet, payout });
  return res.json({ marketId, wallet, payout });
});

app.get("/markets/:id/book/:outcome", (req, res) => {
  const marketId = Number(req.params.id);
  const outcome = req.params.outcome as Outcome;
  if (outcome !== "yes" && outcome !== "no") {
    return res.status(400).json({ error: "Outcome must be yes|no" });
  }
  const snapshot = store.getSnapshot(marketId, outcome);
  const trades = store.getTrades(marketId, outcome);
  return res.json({ snapshot, trades });
});

app.post("/markets/:id/orders", async (req, res) => {
  const marketId = Number(req.params.id);
  const market = markets.find((m) => m.id === marketId);
  if (!market) {
    return res.status(404).json({ error: "Market not found" });
  }
  const orderInput = z.object({
    wallet: z.string().min(20),
    side: z.enum(["buy", "sell"]),
    outcome: z.enum(["yes", "no"]),
    price: z.number().min(0.01).max(0.99),
    quantity: z.number().positive(),
  }).safeParse(req.body);
  if (!orderInput.success) {
    return res.status(400).json({ error: "Invalid order payload", details: orderInput.error.issues });
  }
  const { wallet, side, outcome, price, quantity } = orderInput.data;

  const result = engine.placeOrder({
    marketId,
    wallet,
    side,
    outcome,
    price,
    quantity,
  });

  const snapshot = store.getSnapshot(marketId, outcome);
  const mark = snapshot.markPrice ?? market.yesPrice;
  market.yesPrice = outcome === "yes" ? mark : Number((1 - mark).toFixed(4));
  market.noPrice = Number((1 - market.yesPrice).toFixed(4));
  market.volumeUsd += result.trades.reduce((sum, t) => sum + t.price * t.quantity, 0);
  await prisma.market.update({
    where: { id: marketId },
    data: {
      yesPrice: market.yesPrice,
      noPrice: market.noPrice,
      volumeUsd: market.volumeUsd,
    },
  });
  await prisma.order.upsert({
    where: { id: result.acceptedOrder.id },
    create: {
      id: result.acceptedOrder.id,
      marketId: result.acceptedOrder.marketId,
      wallet: result.acceptedOrder.wallet,
      side: result.acceptedOrder.side,
      outcome: result.acceptedOrder.outcome,
      price: result.acceptedOrder.price,
      quantity: result.acceptedOrder.quantity,
      remaining: result.acceptedOrder.remaining,
      timestamp: BigInt(result.acceptedOrder.timestamp),
    },
    update: {
      remaining: result.acceptedOrder.remaining,
    },
  });

  for (const trade of result.trades) {
    await prisma.trade.upsert({
      where: { id: trade.id },
      create: {
        id: trade.id,
        marketId: trade.marketId,
        outcome: trade.outcome,
        price: trade.price,
        quantity: trade.quantity,
        takerSide: trade.takerSide,
        buyWallet: trade.buyWallet,
        sellWallet: trade.sellWallet,
        timestamp: BigInt(trade.timestamp),
      },
      update: {},
    });
  }

  wsHub.broadcast("book.updated", {
    marketId,
    outcome,
    snapshot,
    trades: result.trades,
  });
  wsHub.broadcast("market.updated", { market });

  try {
    await invokePredictionApp("commitMatchBatch", marketId);
  } catch (e) {
    console.error("Failed to commit match batch to algorand app", e);
  }

  return res.json(result);
});

app.post("/oracle/rounds", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const symbol = String(req.body.symbol ?? "BTCUSD");
  const round = await oracle.buildRound(symbol);
  const verified = oracle.verifyRound(round);
  if (!verified) {
    return res.status(400).json({ error: "Oracle signatures did not satisfy quorum" });
  }
  await prisma.oracleRound.upsert({
    where: { id: round.roundId },
    create: {
      id: round.roundId,
      symbol: round.symbol,
      medianPrice: round.medianPrice,
      minPrice: round.minPrice,
      maxPrice: round.maxPrice,
      sourcesJson: JSON.stringify(round.sources),
      signedByJson: JSON.stringify(round.signedBy),
      quorum: round.quorumReached,
      timestamp: BigInt(round.timestamp),
    },
    update: {},
  });
  wsHub.broadcast("oracle.round", round);
  return res.json({ round });
});

app.get("/portfolio/:wallet", (req, res) => {
  const wallet = req.params.wallet;
  const positions = markets.map((m) => {
    const yesTrades = store.getTrades(m.id, "yes");
    const noTrades = store.getTrades(m.id, "no");
    const yesBought = yesTrades.filter((t) => t.buyWallet === wallet).reduce((s, t) => s + t.quantity, 0);
    const yesSold = yesTrades.filter((t) => t.sellWallet === wallet).reduce((s, t) => s + t.quantity, 0);
    const noBought = noTrades.filter((t) => t.buyWallet === wallet).reduce((s, t) => s + t.quantity, 0);
    const noSold = noTrades.filter((t) => t.sellWallet === wallet).reduce((s, t) => s + t.quantity, 0);
    const yesNet = yesBought - yesSold;
    const noNet = noBought - noSold;
    const mark = m.yesPrice;
    return {
      marketId: m.id,
      question: m.question,
      yesNet,
      noNet,
      markYes: mark,
      markNo: 1 - mark,
      mtmUsd: yesNet * mark + noNet * (1 - mark),
    };
  });
  res.json({ wallet, positions });
});

app.get("/oracle/rounds/:roundId", (req, res) => {
  const round = oracle.getRound(req.params.roundId);
  if (!round) {
    return res.status(404).json({ error: "Round not found" });
  }
  return res.json({ round });
});

app.get("/oracle/latest", async (_req, res) => {
  const latest = await prisma.oracleRound.findFirst({ orderBy: { createdAt: "desc" } });
  if (!latest) {
    return res.status(404).json({ error: "No oracle rounds found yet" });
  }
  return res.json({
    round: {
      roundId: latest.id,
      symbol: latest.symbol,
      medianPrice: latest.medianPrice,
      minPrice: latest.minPrice,
      maxPrice: latest.maxPrice,
      sources: JSON.parse(latest.sourcesJson),
      signedBy: JSON.parse(latest.signedByJson),
      quorumReached: latest.quorum,
      timestamp: Number(latest.timestamp),
    },
  });
});

const port = Number(process.env.PORT ?? "8787");
bootstrapMarkets()
  .then(() => server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Prediction backend running on :${port}`);
  }))
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error("Failed to bootstrap backend", e);
    process.exit(1);
  });
