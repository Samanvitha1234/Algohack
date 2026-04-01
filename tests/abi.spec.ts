import { describe, expect, it } from "vitest";
import { buildPredictionAppArgs } from "../backend/src/algorand/predictionApp";

describe("prediction app arg builder", () => {
  it("builds app args with operation prefix", () => {
    const args = buildPredictionAppArgs("resolveMarket", [1]);
    expect(args.length).toBe(2);
    expect(new TextDecoder().decode(args[0])).toBe("resolveMarket");
    expect(args[1].byteLength).toBeGreaterThan(0);
  });
});
