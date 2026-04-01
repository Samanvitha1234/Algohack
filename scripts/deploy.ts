import "dotenv/config";
import algosdk from "algosdk";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function compileFile(algod: algosdk.Algodv2, relativePath: string): Promise<Uint8Array> {
  const source = await readFile(path.resolve(__dirname, "..", relativePath), "utf8");
  const compiled = await algod.compile(source).do();
  return new Uint8Array(Buffer.from(compiled.result, "base64"));
}

async function deployApp(
  algod: algosdk.Algodv2,
  deployer: algosdk.Account,
  approvalProgram: Uint8Array,
  clearProgram: Uint8Array
): Promise<string> {
  const params = await algod.getTransactionParams().do();
  const tx = algosdk.makeApplicationCreateTxnFromObject({
    sender: deployer.addr,
    suggestedParams: params,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram,
    clearProgram,
    numGlobalInts: 16,
    numGlobalByteSlices: 16,
    numLocalInts: 8,
    numLocalByteSlices: 8,
  });
  const signed = tx.signTxn(deployer.sk);
  const submit = await algod.sendRawTransaction(signed).do();
  const result = await algosdk.waitForConfirmation(algod, submit.txid, 4);
  const appId =
    (result as Record<string, unknown>)["application-index"] ??
    (result as Record<string, unknown>).applicationIndex;
  if (!appId) {
    throw new Error("Deploy succeeded but application id was not found in confirmation response");
  }
  return appId.toString().replace(/n$/, "");
}

async function deploy(): Promise<void> {
  const algod = new algosdk.Algodv2(
    process.env.ALGOD_TOKEN ?? "",
    process.env.ALGOD_SERVER ?? "https://testnet-api.algonode.cloud",
    process.env.ALGOD_PORT ?? ""
  );

  const accountMnemonic = process.env.DEPLOYER_MNEMONIC;
  if (!accountMnemonic) {
    throw new Error("DEPLOYER_MNEMONIC env var is required");
  }
  const deployer = algosdk.mnemonicToSecretKey(accountMnemonic);

  const predictionApproval = await compileFile(algod, "smart_contracts/prediction_market/approval.teal");
  const predictionClear = await compileFile(algod, "smart_contracts/prediction_market/clear.teal");
  const oracleApproval = await compileFile(algod, "smart_contracts/oracle_registry/approval.teal");
  const oracleClear = await compileFile(algod, "smart_contracts/oracle_registry/clear.teal");

  const predictionAppId = await deployApp(algod, deployer, predictionApproval, predictionClear);
  const oracleRegistryAppId = await deployApp(algod, deployer, oracleApproval, oracleClear);

  // eslint-disable-next-line no-console
  console.log("Deployed prediction app id:", predictionAppId);
  // eslint-disable-next-line no-console
  console.log("Deployed oracle registry app id:", oracleRegistryAppId);
  // eslint-disable-next-line no-console
  console.log("Set in .env:");
  // eslint-disable-next-line no-console
  console.log(`PREDICTION_APP_ID=${predictionAppId}`);
  // eslint-disable-next-line no-console
  console.log(`ORACLE_REGISTRY_APP_ID=${oracleRegistryAppId}`);
  // eslint-disable-next-line no-console
  console.log(`VITE_PREDICTION_APP_ID=${predictionAppId}`);
}

deploy().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
