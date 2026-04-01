import { describe, it, expect } from "vitest";
import { MatchingEngine } from "../backend/src/orderbook/engine";
import { OrderBookStore } from "../backend/src/orderbook/store";

describe("prediction market matching", () => {
  it("matches crossing orders and updates mark", () => {
    const store = new OrderBookStore();
    const engine = new MatchingEngine(store);

    engine.placeOrder({
      marketId: 1,
      wallet: "maker",
      side: "sell",
      outcome: "yes",
      price: 0.6,
      quantity: 100,
    });

    const result = engine.placeOrder({
      marketId: 1,
      wallet: "taker",
      side: "buy",
      outcome: "yes",
      price: 0.61,
      quantity: 40,
    });

    expect(result.trades.length).toBe(1);
    expect(result.trades[0].quantity).toBe(40);
    const snap = store.getSnapshot(1, "yes");
    expect(snap.markPrice).toBeTypeOf("number");
  });
});
