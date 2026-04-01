import algosdk from "algosdk";
import peraWallet from "./peraWallet";
import { algodClient, waitForConfirmation } from "./algorand";
import { getBook, getMarket, getMarkets, placeOrder, triggerOracleRound, createMarket, resolveMarket, claimMarket } from "../services/api";
import type { BookSnapshot, Market, Outcome, Trade } from "../types/market";

const APP_ID = Number(import.meta.env.VITE_PREDICTION_APP_ID ?? "0");

function encodeArg(value: string | number): Uint8Array {
  if (typeof value === "number") {
    return algosdk.ABIType.from("uint64").encode(BigInt(value));
  }
  return algosdk.ABIType.from("string").encode(value);
}

async function sendTxns(txns: Array<{ txn: algosdk.Transaction; signers: string[] }>) {
  if (!txns.length) throw new Error("No transactions to send");

  const signedTxns = await peraWallet.signTransaction([txns]);
  const sent = await algodClient.sendRawTransaction(signedTxns).do() as any;
  const txId = sent.txId || sent.txID;
  if (!txId) throw new Error("Could not get txId after sending transaction");

  const status = await algodClient.status().do();
  const nextRound = Number(status.lastRound) + 1;
  await algodClient.statusAfterBlock(nextRound).do();
  await waitForConfirmation(algodClient, txId, 4);

  return txId;
}

export class PredictionMarketSDK {
  public async listMarkets(): Promise<Market[]> {
    return getMarkets();
  }

  public async getMarketDetails(
    marketId: number
  ): Promise<{ market: Market; books: { yes: BookSnapshot; no: BookSnapshot } }> {
    return getMarket(marketId);
  }

  public async getOrderBook(marketId: number, outcome: Outcome): Promise<{ snapshot: BookSnapshot; trades: Trade[] }> {
    return getBook(marketId, outcome);
  }

  public async placeOrder(
    wallet: string,
    marketId: number,
    side: "buy" | "sell",
    outcome: Outcome,
    price: number,
    quantity: number
  ): Promise<unknown> {
    if (APP_ID > 0) {
      let txId: string | undefined;
      try {
        const params = await algodClient.getTransactionParams().do();
        const argList = [
          new TextEncoder().encode("commitMatchBatch"),
          encodeArg(marketId),
          encodeArg(wallet),
          encodeArg(wallet),
          encodeArg(outcome === "yes" ? 1 : 0),
          encodeArg(quantity),
          encodeArg(Math.floor(price * 1_000_000)),
        ];

        const txn = algosdk.makeApplicationNoOpTxnFromObject({
          sender: wallet,
          appIndex: APP_ID,
          suggestedParams: params,
          appArgs: argList,
          note: new TextEncoder().encode(`order:${marketId}:${side}`),
        });
        txId = await sendTxns([{ txn, signers: [wallet] }]);
      } catch (error) {
        console.warn("On-chain order call failed, continuing with backend settlement", error);
      }
      await placeOrder({ wallet, marketId, side, outcome, price, quantity });
      return { txId, proof: { network: "algorand", appId: APP_ID } };
    }

    return placeOrder({ wallet, marketId, side, outcome, price, quantity });
  }

  public async triggerOracle(symbol: string): Promise<unknown> {
    return triggerOracleRound(symbol);
  }

  public async createMarket(question: string, category: string, description: string, endTime: number, creator?: string): Promise<unknown> {
    if (APP_ID > 0 && creator) {
      let txId: string | undefined;
      try {
        const params = await algodClient.getTransactionParams().do();
        const txn = algosdk.makeApplicationNoOpTxnFromObject({
          sender: creator,
          appIndex: APP_ID,
          suggestedParams: params,
          appArgs: [
            new TextEncoder().encode("createMarket"),
            encodeArg(question),
            encodeArg(category),
            encodeArg(endTime),
          ],
        });
        txId = await sendTxns([{ txn, signers: [creator] }]);
      } catch (error) {
        console.warn("On-chain createMarket call failed, continuing with backend creation", error);
      }
      await createMarket({ question, category, description, endTime });
      return { txId, proof: { network: "algorand", appId: APP_ID } };
    }

    return createMarket({ question, category, description, endTime });
  }

  public async resolveMarket(marketId: number, sentiment?: "yes" | "no", signer?: string): Promise<unknown> {
    if (APP_ID > 0 && signer && sentiment) {
      let txId: string | undefined;
      try {
        const params = await algodClient.getTransactionParams().do();
        const txn = algosdk.makeApplicationNoOpTxnFromObject({
          sender: signer,
          appIndex: APP_ID,
          suggestedParams: params,
          appArgs: [
            new TextEncoder().encode("resolveMarket"),
            encodeArg(marketId),
            encodeArg(sentiment === "yes" ? 1 : 0),
          ],
        });
        txId = await sendTxns([{ txn, signers: [signer] }]);
      } catch (error) {
        console.warn("On-chain resolve call failed, continuing with backend resolution", error);
      }
      await resolveMarket(marketId, sentiment);
      return { txId, proof: { network: "algorand", appId: APP_ID } };
    }

    return resolveMarket(marketId, sentiment);
  }

  public async claimMarket(marketId: number, wallet: string): Promise<unknown> {
    if (APP_ID > 0) {
      let txId: string | undefined;
      try {
        const params = await algodClient.getTransactionParams().do();
        const txn = algosdk.makeApplicationNoOpTxnFromObject({
          sender: wallet,
          appIndex: APP_ID,
          suggestedParams: params,
          appArgs: [
            new TextEncoder().encode("claim"),
            encodeArg(marketId),
            encodeArg(wallet),
          ],
        });
        txId = await sendTxns([{ txn, signers: [wallet] }]);
      } catch (error) {
        console.warn("On-chain claim call failed, continuing with backend claim", error);
      }
      await claimMarket(marketId, wallet);
      return { txId, proof: { network: "algorand", appId: APP_ID } };
    }

    return claimMarket(marketId, wallet);
  }
}

export const predictionMarketSDK = new PredictionMarketSDK();
