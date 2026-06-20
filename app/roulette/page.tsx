import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RouletteWheel } from "@/components/roulette-wheel";

export const dynamic = "force-dynamic";

export default async function RoulettePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return <RouletteWheel />;
}
