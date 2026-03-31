import algosdk from "algosdk";
import peraWallet from "./peraWallet";

export const algodClient = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");

export async function createAsset(form: Record<string, any>, account: string) {
  const params = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    sender: account,
    total: BigInt(form.total),
    decimals: Number(form.decimals),
    assetName: form.assetName,
    unitName: form.unitName,
    assetURL: form.url,
    defaultFrozen: false,
    manager: account,
    suggestedParams: params,
  });

  const txnGroup = [{ txn, signers: [account] }];
  const signedTxns = await peraWallet.signTransaction([txnGroup]);
  const { txid } = await algodClient.sendRawTransaction(signedTxns).do();

  await waitForConfirmation(algodClient, txid, 4);

  const ptx = await algodClient.pendingTransactionInformation(txid).do();
  return Number(ptx.assetIndex);
}

async function waitForConfirmation(client: algosdk.Algodv2, txid: string, timeout: number) {
  const status = await client.status().do();
  let currentRound =
    (typeof status.lastRound === "bigint" ? Number(status.lastRound) : status.lastRound) + 1;

  while (timeout-- > 0) {
    const pendingInfo = await client.pendingTransactionInformation(txid).do();
    if (pendingInfo.confirmedRound) return pendingInfo;
    await client.statusAfterBlock(currentRound++).do();
  }

  throw new Error(`Transaction ${txid} not confirmed within timeout`);
}
