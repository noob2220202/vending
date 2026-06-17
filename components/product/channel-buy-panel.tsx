"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";

export function ChannelBuyPanel({
  channel,
}: {
  channel: { id: string; title: string; price: number; available: boolean };
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  function item() {
    return {
      key: `channel-${channel.id}`,
      type: "CHANNEL" as const,
      refId: channel.id,
      title: channel.title,
      amount: channel.price,
    };
  }

  if (!channel.available) {
    return (
      <Button className="w-full" disabled>
        판매 완료된 채널입니다
      </Button>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="secondary"
        onClick={() => {
          add(item());
          router.push("/cart");
        }}
      >
        장바구니
      </Button>
      <Button
        variant="gradient"
        onClick={() => {
          add(item());
          router.push("/checkout");
        }}
      >
        바로 구매
      </Button>
    </div>
  );
}
