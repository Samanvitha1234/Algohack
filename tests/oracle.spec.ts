import { describe, expect, it } from "vitest";
import { OracleAggregator } from "../backend/src/oracle/aggregator";

describe("oracle aggregator", () => {
  it("builds a quorum round with median price", async () => {
    const oracle = new OracleAggregator();
    const round = await oracle.buildRound("BTCUSD");
    expect(round.symbol).toBe("BTCUSD");
    expect(round.sources.length).toBe(3);
    expect(round.quorumReached).toBe(true);
    expect(round.medianPrice).toBeGreaterThan(0);
    expect(round.signatures.length).toBeGreaterThanOrEqual(2);
    expect(oracle.verifyRound(round)).toBe(true);
  });
});
