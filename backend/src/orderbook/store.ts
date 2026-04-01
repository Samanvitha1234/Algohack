export type Side = "buy" | "sell";
export type Outcome = "yes" | "no";

export interface Order {
  id: string;
  marketId: number;
  wallet: string;
  side: Side;
  outcome: Outcome;
  price: number;
  quantity: number;
  remaining: number;
  timestamp: number;
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

export interface OrderBookSnapshot {
  marketId: number;
  outcome: Outcome;
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
  bestBid: number | null;
  bestAsk: number | null;
  markPrice: number | null;
  depthUsd: number;
}

export class OrderBookStore {
  private readonly books = new Map<string, { bids: Order[]; asks: Order[] }>();
  private readonly trades = new Map<string, Trade[]>();

  public getBookKey(marketId: number, outcome: Outcome): string {
    return `${marketId}:${outcome}`;
  }

  public getOrders(marketId: number, outcome: Outcome): { bids: Order[]; asks: Order[] } {
    const key = this.getBookKey(marketId, outcome);
    const book = this.books.get(key);
    if (!book) {
      const next = { bids: [], asks: [] };
      this.books.set(key, next);
      return next;
    }
    return book;
  }

  public upsertBook(marketId: number, outcome: Outcome, book: { bids: Order[]; asks: Order[] }): void {
    this.books.set(this.getBookKey(marketId, outcome), book);
  }

  public addTrade(marketId: number, outcome: Outcome, trade: Trade): void {
    const key = this.getBookKey(marketId, outcome);
    const list = this.trades.get(key) ?? [];
    list.unshift(trade);
    this.trades.set(key, list.slice(0, 100));
  }

  public getTrades(marketId: number, outcome: Outcome): Trade[] {
    return this.trades.get(this.getBookKey(marketId, outcome)) ?? [];
  }

  public getSnapshot(marketId: number, outcome: Outcome): OrderBookSnapshot {
    const { bids, asks } = this.getOrders(marketId, outcome);
    const bidMap = aggregateByPrice(bids);
    const askMap = aggregateByPrice(asks);
    const bestBid = bids.length > 0 ? bids[0].price : null;
    const bestAsk = asks.length > 0 ? asks[0].price : null;
    const markPrice = bestBid !== null && bestAsk !== null ? (bestBid + bestAsk) / 2 : bestBid ?? bestAsk;
    const depthUsd =
      [...bidMap.entries(), ...askMap.entries()].reduce((sum, [price, qty]) => sum + price * qty, 0);

    return {
      marketId,
      outcome,
      bids: [...bidMap.entries()].map(([price, quantity]) => ({ price, quantity })),
      asks: [...askMap.entries()].map(([price, quantity]) => ({ price, quantity })),
      bestBid,
      bestAsk,
      markPrice,
      depthUsd,
    };
  }
}

function aggregateByPrice(orders: Order[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const order of orders) {
    map.set(order.price, (map.get(order.price) ?? 0) + order.remaining);
  }
  return map;
}
