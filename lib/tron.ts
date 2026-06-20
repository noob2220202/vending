import { config } from "./config";

const TRONGRID_BASE = "https://api.trongrid.io";

export interface Trc20Transfer {
  transactionId: string;
  from: string;
  to: string;
  amountUsdt: number;
  timestamp: number; // ms epoch (block_timestamp)
}

async function trongridFetch(path: string): Promise<unknown> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (config.tron.apiKey) headers["TRON-PRO-API-KEY"] = config.tron.apiKey;
  const res = await fetch(`${TRONGRID_BASE}${path}`, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`TRONGRID_HTTP_${res.status}`);
  return res.json();
}

/** Recent confirmed USDT-TRC20 transfers into the company wallet, newest first. */
export async function getIncomingUsdtTransfers(limit = 50): Promise<Trc20Transfer[]> {
  const wallet = config.tron.companyWallet;
  if (!wallet) throw new Error("COMPANY_WALLET_NOT_CONFIGURED");

  const data = (await trongridFetch(
    `/v1/accounts/${wallet}/transactions/trc20?contract_address=${config.tron.usdtContract}&limit=${limit}&order_by=block_timestamp,desc`
  )) as { data?: unknown[] };

  const items = Array.isArray(data?.data) ? data.data : [];
  return items
    .map((t) => t as Record<string, unknown>)
    .filter((t) => t.to === wallet)
    .map((t) => ({
      transactionId: String(t.transaction_id),
      from: String(t.from),
      to: String(t.to),
      amountUsdt: Number(t.value) / 1_000_000, // USDT-TRC20 has 6 decimals
      timestamp: Number(t.block_timestamp),
    }));
}

/** Look up one specific incoming transfer by TRON tx hash, for manual TXID submission. */
export async function findUsdtTransferByTxId(
  txId: string
): Promise<Trc20Transfer | null> {
  const transfers = await getIncomingUsdtTransfers(200);
  return transfers.find((t) => t.transactionId === txId) ?? null;
}
