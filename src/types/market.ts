export type MarketStatus = "open" | "locked" | "resolved";
export type Outcome = "yes" | "no";
export type Side = "buy" | "sell";

export interface Market {
  id: number;
  question: string;
  category: string;
  description: string;
  endTime: number;
  status: MarketStatus;
  yesPrice: number;
  noPrice: number;
  volumeUsd: number;
  participants: number;
}

export interface BookLevel {
  price: number;
  quantity: number;
}

export interface BookSnapshot {
  marketId: number;
  outcome: Outcome;
  bids: BookLevel[];
  asks: BookLevel[];
  bestBid: number | null;
  bestAsk: number | null;
  markPrice: number | null;
  depthUsd: number;
}

export interface Trade {
  id: string;
  marketId: number;
  outcome: Outcome;
  price: number;
  quantity: number;
  takerSide: Side;
  buyWallet: string;
  sellWallet: string;
  timestamp: number;
}
