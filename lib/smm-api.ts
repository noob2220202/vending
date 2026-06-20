import { config } from "./config";

// Adapter for the de-facto standard SMM reseller panel API ("Perfect Panel"
// compatible): single endpoint, POST key+action. Swapping providers only
// means changing SMM_API_URL/SMM_API_KEY, not this adapter.

export interface SmmService {
  service: string;
  name: string;
  type: string;
  rate: string;
  min: string;
  max: string;
  category?: string;
}

async function call(params: Record<string, string>): Promise<any> {
  const { apiUrl, apiKey } = config.smm;
  if (!apiUrl || !apiKey) throw new Error("SMM_API_NOT_CONFIGURED");

  const body = new URLSearchParams({ key: apiKey, ...params });
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`SMM_API_HTTP_${res.status}`);

  const data = await res.json();
  if (data?.error) throw new Error(`SMM_API_ERROR: ${data.error}`);
  return data;
}

export async function placeOrder(
  serviceId: string,
  link: string,
  quantity: number
): Promise<{ orderId: string }> {
  const data = await call({
    action: "add",
    service: serviceId,
    link,
    quantity: String(quantity),
  });
  if (!data?.order) throw new Error("SMM_API_NO_ORDER_ID");
  return { orderId: String(data.order) };
}

export async function getOrderStatus(
  orderId: string
): Promise<{ status: string; remains: number }> {
  const data = await call({ action: "status", order: orderId });
  return {
    status: String(data?.status ?? "Unknown"),
    remains: Number(data?.remains ?? 0),
  };
}

export async function getServices(): Promise<SmmService[]> {
  const data = await call({ action: "services" });
  return Array.isArray(data) ? data : [];
}

export async function getBalance(): Promise<{ balance: number; currency: string }> {
  const data = await call({ action: "balance" });
  return { balance: Number(data?.balance ?? 0), currency: String(data?.currency ?? "USD") };
}
