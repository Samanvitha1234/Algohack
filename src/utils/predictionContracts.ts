import algosdk from "algosdk";
import { algodClient } from "./algorand";

// Prediction Market Smart Contract Interface
export interface PredictionMarketContract {
  appId: number;
  appAddress: string;
  creator: string;
  question: string;
  category: string;
  endTime: number;
  resolution?: boolean;
  resolved: boolean;
  yesAssetId?: number;
  noAssetId?: number;
  poolBalance: number;
  totalVolume: number;
}

export interface MarketPosition {
  marketId: number;
  user: string;
  yesShares: number;
  noShares: number;
  avgYesPrice: number;
  avgNoPrice: number;
}

export interface Order {
  id: string;
  marketId: number;
  user: string;
  side: "buy" | "sell";
  outcome: "yes" | "no";
  price: number;
  amount: number;
  filled: number;
  timestamp: number;
  status: "open" | "filled" | "cancelled";
}

// Smart Contract Methods
export class PredictionMarketSDK {
  private client: algosdk.Algodv2;

  constructor() {
    this.client = algodClient;
  }

  // Create a new prediction market
  async createMarket(
    creator: string,
    question: string,
    category: string,
    endTime: number
  ): Promise<number> {
    try {
      const suggestedParams = await this.client.getTransactionParams().do();
      
      // Mock compiled programs for demonstration
      const approvalProgram = new Uint8Array([1, 32, 1, 22, 34, 1, 1, 1, 0, 81]);
      const clearProgram = new Uint8Array([1, 32, 1, 22, 34, 1, 1, 1, 0, 81]);

      const createAppTx = algosdk.makeApplicationCreateTxnFromObject({
        sender: creator,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: approvalProgram,
        clearProgram: clearProgram,
        numGlobalByteSlices: 4,
        numGlobalInts: 4,
        numLocalByteSlices: 2,
        numLocalInts: 4,
        appArgs: [
          new TextEncoder().encode(question),
          new TextEncoder().encode(category),
          algosdk.encodeUint64(endTime)
        ]
      });

      return createAppTx.appIndex || 0;
    } catch (error) {
      console.error("Error creating market:", error);
      throw error;
    }
  }

  // Place a buy/sell order
  async placeOrder(
    user: string,
    marketId: number,
    side: "buy" | "sell",
    outcome: "yes" | "no",
    price: number,
    amount: number
  ): Promise<string> {
    try {
      const suggestedParams = await this.client.getTransactionParams().do();
      
      const appCallTx = algosdk.makeApplicationCallTxnFromObject({
        sender: user,
        appIndex: marketId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode(side),
          new TextEncoder().encode(outcome),
          algosdk.encodeUint64(Math.floor(price * 100)), // Store as integer
          algosdk.encodeUint64(amount)
        ],
        suggestedParams,
        foreignAssets: [] // Will be populated with YES/NO asset IDs
      });

      // Add payment transaction for the order
      const paymentTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: user,
        receiver: algosdk.getApplicationAddress(marketId),
        amount: Math.floor(price * amount * 1000000), // Convert to microAlgos
        suggestedParams
      });

      // Group transactions
      const txGroup = [paymentTx, appCallTx];
      algosdk.assignGroupID(txGroup);

      return txGroup[0].txID();
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  }

  // Cancel an order
  async cancelOrder(user: string, orderId: string): Promise<string> {
    try {
      const suggestedParams = await this.client.getTransactionParams().do();
      
      const appCallTx = algosdk.makeApplicationCallTxnFromObject({
        sender: user,
        appIndex: 0, // This would be the market app ID
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode("cancel"),
          new TextEncoder().encode(orderId)
        ],
        suggestedParams
      });

      return appCallTx.txID();
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  }

  // Resolve a market (creator only)
  async resolveMarket(
    creator: string,
    marketId: number,
    outcome: boolean
  ): Promise<string> {
    try {
      const suggestedParams = await this.client.getTransactionParams().do();
      
      const appCallTx = algosdk.makeApplicationCallTxnFromObject({
        sender: creator,
        appIndex: marketId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode("resolve"),
          algosdk.encodeUint64(outcome ? 1 : 0)
        ],
        suggestedParams
      });

      return appCallTx.txID();
    } catch (error) {
      console.error("Error resolving market:", error);
      throw error;
    }
  }

  // Claim winnings from resolved market
  async claimWinnings(user: string, marketId: number): Promise<string> {
    try {
      const suggestedParams = await this.client.getTransactionParams().do();
      
      const appCallTx = algosdk.makeApplicationCallTxnFromObject({
        sender: user,
        appIndex: marketId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [
          new TextEncoder().encode("claim")
        ],
        suggestedParams
      });

      return appCallTx.txID();
    } catch (error) {
      console.error("Error claiming winnings:", error);
      throw error;
    }
  }

  // Get market information
  async getMarketInfo(marketId: number): Promise<PredictionMarketContract | null> {
    try {
      const appInfo = await this.client.getApplicationByID(marketId).do();
      
      if (!appInfo || !appInfo.params) {
        return null;
      }

      const globalState = appInfo.params.globalState || [];
      
      const parseState = (key: string): any => {
        const state = globalState.find((s: any) => 
          atob(s.key) === key
        );
        return state ? state.value.uint : null;
      };

      const parseStringState = (key: string): string => {
        const state = globalState.find((s: any) => 
          atob(s.key) === key
        );
        return state ? atob(state.value.bytes) : "";
      };

      return {
        appId: marketId,
        appAddress: algosdk.getApplicationAddress(marketId),
        creator: appInfo.params.creator.toString(),
        question: parseStringState("Question"),
        category: parseStringState("Category"),
        endTime: parseState("EndTime") || 0,
        resolution: parseState("Resolution") === 1,
        resolved: parseState("Resolved") === 1,
        poolBalance: parseState("PoolBalance") || 0,
        totalVolume: parseState("TotalVolume") || 0
      };
    } catch (error) {
      console.error("Error getting market info:", error);
      return null;
    }
  }

  // Get user's positions in a market
  async getUserPositions(user: string, marketId: number): Promise<MarketPosition | null> {
    try {
      const accountInfo = await this.client.accountInformation(user).do();
      
      const appLocalState = accountInfo.appsLocalState?.find(
        (app: any) => app.id === marketId
      );

      if (!appLocalState) {
        return null;
      }

      const parseState = (key: string): number => {
        const state = appLocalState.keyValue?.find((s: any) => 
          atob(s.key) === key
        );
        return state ? Number(state.value.uint) : 0;
      };

      return {
        marketId,
        user,
        yesShares: parseState("YesShares"),
        noShares: parseState("NoShares"),
        avgYesPrice: parseState("AvgYesPrice") / 100, // Convert back from integer
        avgNoPrice: parseState("AvgNoPrice") / 100
      };
    } catch (error) {
      console.error("Error getting user positions:", error);
      return null;
    }
  }

  // Get order book for a market
  async getOrderBook(): Promise<{ bids: Order[], asks: Order[] }> {
    try {
      // This would typically query off-chain storage or a separate order book contract
      // For now, return empty order book
      return {
        bids: [],
        asks: []
      };
    } catch (error) {
      console.error("Error getting order book:", error);
      return { bids: [], asks: [] };
    }
  }
}

// Oracle system for real-time price feeds
export class OracleSystem {
  private priceFeeds: Map<string, number> = new Map();

  constructor() {
    this.initializePriceFeeds();
  }

  private async initializePriceFeeds() {
    // Initialize with mock data - replace with real oracle feeds
    this.priceFeeds.set("BTC/USD", 65000);
    this.priceFeeds.set("ETH/USD", 3500);
    this.priceFeeds.set("SPY", 450);
    this.priceFeeds.set("QQQ", 380);
  }

  // Get current price for a symbol
  async getPrice(symbol: string): Promise<number> {
    // In production, this would fetch from multiple oracle sources
    const price = this.priceFeeds.get(symbol);
    if (price === undefined) {
      throw new Error(`Price feed not available for ${symbol}`);
    }
    return price;
  }

  // Update price from oracle source
  async updatePrice(symbol: string, price: number): Promise<void> {
    this.priceFeeds.set(symbol, price);
    
    // In production, this would verify the price from multiple sources
    // and update the on-chain oracle contract
  }

  // Verify price from multiple sources
  async verifyPrice(): Promise<boolean> {
    // Mock verification - in production, check multiple sources
    return true;
  }

  // Get historical prices
  async getHistoricalPrices(symbol: string, days: number): Promise<{ timestamp: number, price: number }[]> {
    // Mock historical data - in production, fetch from oracle or external API
    const prices = [];
    const currentPrice = this.priceFeeds.get(symbol) || 0;
    
    for (let i = days; i >= 0; i--) {
      const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000);
      const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
      const price = currentPrice * (1 + variance);
      prices.push({ timestamp, price });
    }
    
    return prices;
  }
}

// Export singleton instances
export const predictionMarketSDK = new PredictionMarketSDK();
export const oracleSystem = new OracleSystem();
