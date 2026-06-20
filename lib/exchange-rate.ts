const UPBIT_TICKER_URL = "https://api.upbit.com/v1/ticker?markets=KRW-USDT";

/** Current KRW price for 1 USDT, from Upbit's public ticker (no API key required). */
export async function getUsdtKrwRate(): Promise<number> {
  const res = await fetch(UPBIT_TICKER_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("UPBIT_FETCH_FAILED");
  const data = await res.json();
  const price = data?.[0]?.trade_price;
  if (typeof price !== "number" || price <= 0) throw new Error("UPBIT_BAD_RESPONSE");
  return price;
}
