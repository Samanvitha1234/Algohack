import { Contract, abimethod } from "@algorandfoundation/algorand-typescript";

type Status = "open" | "locked" | "resolved" | "claimable";

interface MarketRecord {
  id: bigint;
  question: string;
  category: string;
  endTime: bigint;
  status: Status;
  resolution: bigint;
  totalYes: bigint;
  totalNo: bigint;
  claimedYes: bigint;
  claimedNo: bigint;
  settledPoolMicroAlgos: bigint;
}

export class PredictionMarketApp extends Contract {
  private readonly markets = new Map<bigint, MarketRecord>();
  private readonly yesBalances = new Map<string, bigint>();
  private readonly noBalances = new Map<string, bigint>();
  private readonly claims = new Map<string, boolean>();
  private readonly processedMatchBatches = new Map<string, boolean>();
  private nextMarketId: bigint = 1n;
  private protocolFeeBps: bigint = 100n;

  @abimethod({ onCreate: "require" })
  public create(initialFeeBps: bigint): void {
    this.protocolFeeBps = initialFeeBps;
  }

  @abimethod()
  public createMarket(question: string, category: string, endTime: bigint): bigint {
    const marketId = this.nextMarketId;
    const market: MarketRecord = {
      id: marketId,
      question,
      category,
      endTime,
      status: "open",
      resolution: 0n,
      totalYes: 0n,
      totalNo: 0n,
      claimedYes: 0n,
      claimedNo: 0n,
      settledPoolMicroAlgos: 0n,
    };
    this.markets.set(marketId, market);
    this.nextMarketId += 1n;
    return marketId;
  }

  @abimethod()
  public commitMatchBatch(
    marketId: bigint,
    buyer: string,
    seller: string,
    outcome: bigint,
    quantity: bigint,
    price: bigint
  ): void {
    const market = this.mustGetMarket(marketId);
    if (quantity <= 0n || price <= 0n) {
      throw new Error("invalid quantity or price");
    }
    const batchKey = `${marketId}:${buyer}:${seller}:${outcome}:${quantity}:${price}`;
    if (this.processedMatchBatches.get(batchKey)) {
      throw new Error("batch already committed");
    }
    this.processedMatchBatches.set(batchKey, true);

    if (market.status !== "open") {
      throw new Error("market not open");
    }
    if (outcome === 1n) {
      market.totalYes += quantity * price;
      market.settledPoolMicroAlgos += quantity * price;
      this.yesBalances.set(`${marketId}:${buyer}`, (this.yesBalances.get(`${marketId}:${buyer}`) ?? 0n) + quantity);
      this.yesBalances.set(`${marketId}:${seller}`, (this.yesBalances.get(`${marketId}:${seller}`) ?? 0n) - quantity);
    } else {
      market.totalNo += quantity * price;
      market.settledPoolMicroAlgos += quantity * price;
      this.noBalances.set(`${marketId}:${buyer}`, (this.noBalances.get(`${marketId}:${buyer}`) ?? 0n) + quantity);
      this.noBalances.set(`${marketId}:${seller}`, (this.noBalances.get(`${marketId}:${seller}`) ?? 0n) - quantity);
    }
  }

  @abimethod()
  public resolveMarket(marketId: bigint, oracleOutcome: bigint): void {
    const market = this.mustGetMarket(marketId);
    if (market.status !== "open") {
      throw new Error("market must be open");
    }
    market.status = "resolved";
    market.resolution = oracleOutcome;
  }

  @abimethod()
  public claim(marketId: bigint, user: string): bigint {
    const market = this.mustGetMarket(marketId);
    if (market.status !== "resolved" && market.status !== "claimable") {
      throw new Error("market not claimable");
    }
    market.status = "claimable";
    const claimKey = `${marketId}:${user}`;
    if (this.claims.get(claimKey)) {
      throw new Error("already claimed");
    }
    this.claims.set(claimKey, true);

    const yesPos = this.yesBalances.get(`${marketId}:${user}`) ?? 0n;
    const noPos = this.noBalances.get(`${marketId}:${user}`) ?? 0n;
    const winningShares = market.resolution === 1n ? yesPos : noPos;
    const grossPayout = winningShares * 1_000_000n;
    const fee = (grossPayout * this.protocolFeeBps) / 10_000n;
    if (market.resolution === 1n) {
      market.claimedYes += winningShares;
    } else {
      market.claimedNo += winningShares;
    }
    return grossPayout - fee;
  }

  @abimethod({ readonly: true })
  public getMarket(marketId: bigint): string {
    const market = this.mustGetMarket(marketId);
    return JSON.stringify(market);
  }

  private mustGetMarket(marketId: bigint): MarketRecord {
    const market = this.markets.get(marketId);
    if (!market) {
      throw new Error("market not found");
    }
    return market;
  }
}
