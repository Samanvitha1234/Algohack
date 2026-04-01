export type MarketStatus = "open" | "locked" | "resolved" | "claimable";

export interface MarketConfig {
  question: string;
  category: string;
  descriptionHash: string;
  endTime: bigint;
  oracleSymbol: string;
  creatorFeeBps: bigint;
}

export interface OracleRoundRef {
  roundId: string;
  medianPrice: bigint;
  resolvedOutcome: boolean;
  timestamp: bigint;
}
