import algosdk from "algosdk";

function abiEncodeUint64(value: number): Uint8Array {
  return algosdk.ABIType.from("uint64").encode(BigInt(value));
}

function abiEncodeString(value: string): Uint8Array {
  return algosdk.ABIType.from("string").encode(value);
}

export type PredictionMethod = "createMarket" | "commitMatchBatch" | "resolveMarket" | "claim";

export function buildPredictionAppArgs(method: PredictionMethod, args: Array<string | number>): Uint8Array[] {
  const encoded: Uint8Array[] = [new TextEncoder().encode(method)];
  for (const arg of args) {
    if (typeof arg === "number") {
      encoded.push(abiEncodeUint64(arg));
    } else {
      encoded.push(abiEncodeString(arg));
    }
  }
  return encoded;
}

export async function callPredictionApp(params: {
  algodClient: algosdk.Algodv2;
  appId: number;
  account: algosdk.Account;
  method: PredictionMethod;
  args: Array<string | number>;
}): Promise<string> {
  const suggestedParams = await params.algodClient.getTransactionParams().do();
  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    sender: params.account.addr,
    appIndex: params.appId,
    suggestedParams,
    appArgs: buildPredictionAppArgs(params.method, params.args),
  });
  const signedTxn = txn.signTxn(params.account.sk);
  const sendResult = await params.algodClient.sendRawTransaction(signedTxn).do() as unknown as {
    txId?: string;
    txID?: string;
  };
  const txId = sendResult.txId ?? sendResult.txID ?? "";
  if (!txId) {
    throw new Error("Failed to get txId from sendRawTransaction response");
  }
  await algosdk.waitForConfirmation(params.algodClient, txId, 4);
  return txId;
}
