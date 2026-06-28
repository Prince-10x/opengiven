import {
  rpc,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
  Address,
  xdr,
} from "@stellar/stellar-sdk";

type ScVal = xdr.ScVal;

const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
  "Test SDF Network ; September 2015";
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

const server = new rpc.Server(RPC_URL);

export function getContract() {
  if (!CONTRACT_ADDRESS)
    throw new Error("Contract address not configured");
  return new Contract(CONTRACT_ADDRESS);
}

// --- ScVal conversion helpers ---
export function toScValString(v: string): ScVal {
  return nativeToScVal(v, { type: "string" });
}

export function toScValU64(v: number): ScVal {
  return nativeToScVal(v, { type: "u64" });
}

export function toScValI128(v: number | string): ScVal {
  return nativeToScVal(v, { type: "i128" });
}

export function toScValAddress(v: string): ScVal {
  return new Address(v).toScVal();
}

// --- Contract interaction helpers ---

export async function readContract(method: string, args: ScVal[], source?: string) {
  const contract = getContract();
  const call = contract.call(method, ...args);

  const account = source
    ? await server.getAccount(source)
    : await server.getAccount(
        "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      );

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(call)
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) throw new Error(sim.error);

  const results = sim.result?.retval;
  if (!results) throw new Error("No result from contract");

  return scValToNative(results);
}

export async function buildContractTx(method: string, args: ScVal[], source: string) {
  const contract = getContract();
  const call = contract.call(method, ...args);

  const account = await server.getAccount(source);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(call)
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) throw new Error(sim.error);

  const prepared = rpc.assembleTransaction(tx, sim);
  return prepared.build();
}

export async function getTxStatus(hash: string) {
  const result = await server.getTransaction(hash);
  return result.status;
}

export { RPC_URL, NETWORK_PASSPHRASE, CONTRACT_ADDRESS, server };
