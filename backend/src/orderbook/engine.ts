import crypto from "node:crypto";
import { Order, OrderBookStore, Outcome, Side, Trade } from "./store.js";

export interface PlaceOrderRequest {
  marketId: number;
  wallet: string;
  side: Side;
  outcome: Outcome;
  price: number;
  quantity: number;
}

export interface PlaceOrderResult {
  acceptedOrder: Order;
  trades: Trade[];
}

export class MatchingEngine {
  constructor(private readonly store: OrderBookStore) {}

  public placeOrder(input: PlaceOrderRequest): PlaceOrderResult {
    const order: Order = {
      id: crypto.randomUUID(),
      marketId: input.marketId,
      wallet: input.wallet,
      side: input.side,
      outcome: input.outcome,
      price: normalizePrice(input.price),
      quantity: input.quantity,
      remaining: input.quantity,
      timestamp: Date.now(),
    };

    const book = this.store.getOrders(input.marketId, input.outcome);
    const trades: Trade[] = [];

    if (order.side === "buy") {
      matchBuy(order, book.asks, trades);
      if (order.remaining > 0) {
        book.bids.push(order);
        book.bids.sort((a, b) => b.price - a.price || a.timestamp - b.timestamp);
      }
    } else {
      matchSell(order, book.bids, trades);
      if (order.remaining > 0) {
        book.asks.push(order);
        book.asks.sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);
      }
    }

    this.store.upsertBook(input.marketId, input.outcome, book);
    for (const trade of trades) {
      this.store.addTrade(input.marketId, input.outcome, trade);
    }

    return { acceptedOrder: order, trades };
  }
}

function matchBuy(taker: Order, asks: Order[], trades: Trade[]): void {
  while (taker.remaining > 0 && asks.length > 0) {
    const bestAsk = asks[0];
    if (bestAsk.price > taker.price) {
      break;
    }
    const qty = Math.min(taker.remaining, bestAsk.remaining);
    bestAsk.remaining -= qty;
    taker.remaining -= qty;
    trades.push(makeTrade(taker, bestAsk, qty, bestAsk.price, "buy"));
    if (bestAsk.remaining === 0) {
      asks.shift();
    }
  }
}

function matchSell(taker: Order, bids: Order[], trades: Trade[]): void {
  while (taker.remaining > 0 && bids.length > 0) {
    const bestBid = bids[0];
    if (bestBid.price < taker.price) {
      break;
    }
    const qty = Math.min(taker.remaining, bestBid.remaining);
    bestBid.remaining -= qty;
    taker.remaining -= qty;
    trades.push(makeTrade(taker, bestBid, qty, bestBid.price, "sell"));
    if (bestBid.remaining === 0) {
      bids.shift();
    }
  }
}

function makeTrade(taker: Order, maker: Order, quantity: number, price: number, takerSide: Side): Trade {
  return {
    id: crypto.randomUUID(),
    marketId: taker.marketId,
    outcome: taker.outcome,
    price,
    quantity,
    takerSide,
    buyWallet: takerSide === "buy" ? taker.wallet : maker.wallet,
    sellWallet: takerSide === "sell" ? taker.wallet : maker.wallet,
    timestamp: Date.now(),
  };
}

function normalizePrice(price: number): number {
  return Math.max(0.01, Math.min(0.99, Number(price.toFixed(4))));
}
