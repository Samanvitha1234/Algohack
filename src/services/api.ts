import axios from "axios";
import type { BookSnapshot, Market, Outcome, Trade } from "../types/market";

const baseURL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8787";
const client = axios.create({ baseURL });
const adminKey = import.meta.env.VITE_ADMIN_API_KEY;

if (adminKey) {
  client.defaults.headers.common["x-admin-key"] = adminKey;
}

export async function getMarkets(): Promise<Market[]> {
  const { data } = await client.get<{ markets: Market[] }>("/markets");
  return data.markets;
}

export async function getMarket(marketId: number): Promise<{ market: Market; books: { yes: BookSnapshot; no: BookSnapshot } }> {
  const { data } = await client.get(`/markets/${marketId}`);
  return data;
}

export async function getBook(
  marketId: number,
  outcome: Outcome
): Promise<{ snapshot: BookSnapshot; trades: Trade[] }> {
  const { data } = await client.get(`/markets/${marketId}/book/${outcome}`);
  return data;
}

export async function placeOrder(payload: {
  marketId: number;
  wallet: string;
  side: "buy" | "sell";
  outcome: Outcome;
  price: number;
  quantity: number;
}): Promise<unknown> {
  const { data } = await client.post(`/markets/${payload.marketId}/orders`, payload);
  return data;
}

export async function triggerOracleRound(symbol: string): Promise<unknown> {
  const { data } = await client.post("/oracle/rounds", { symbol });
  return data;
}

export interface OracleRoundPayload {
  roundId: string;
  symbol: string;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  sources: Array<{ source: string; symbol: string; price: number; timestamp: number }>;
  signedBy: string[];
  quorumReached: boolean;
  timestamp: number;
}

export async function getLatestOracleRound(): Promise<OracleRoundPayload | null> {
  try {
    const { data } = await client.get<{ round: OracleRoundPayload }>("/oracle/latest");
    return data.round;
  } catch {
    return null;
  }
}

export async function getPortfolio(wallet: string): Promise<{
  wallet: string;
  positions: Array<{
    marketId: number;
    question: string;
    yesNet: number;
    noNet: number;
    markYes: number;
    markNo: number;
    mtmUsd: number;
  }>;
}> {
  const { data } = await client.get(`/portfolio/${wallet}`);
  return data;
}

export async function createMarket(payload: {
  question: string;
  category: string;
  description: string;
  endTime: number;
}) {
  const { data } = await client.post(`/markets`, payload);
  return data;
}

export async function resolveMarket(marketId: number, sentiment?: "yes" | "no") {
  const { data } = await client.post(`/markets/${marketId}/resolve`, { sentiment });
  return data;
}

export async function claimMarket(marketId: number, wallet: string) {
  const { data } = await client.post(`/markets/${marketId}/claim`, { wallet });
  return data;
}

export function getWsUrl(): string {
  const wsBase = import.meta.env.VITE_WS_URL ?? "ws://localhost:8787/ws";
  return wsBase;
}
