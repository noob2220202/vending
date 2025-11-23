import { DISCORD_WEBHOOK_URL } from './config';

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  image?: {
    url: string;
  };
  footer?: {
    text: string;
  };
  timestamp?: string;
}

interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  embeds: DiscordEmbed[];
}

export async function sendDiscordWebhook(embed: DiscordEmbed) {
  try {
    const payload: DiscordWebhookPayload = {
      username: "핵스팟 [24H]",
      embeds: [{ ...embed, timestamp: new Date().toISOString() }]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

export async function sendDiscordWebhookCustom(webhookUrl: string, payload: DiscordWebhookPayload) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

export function createPurchaseEmbed(userId: string, userName: string, productName: string, planDay: string, price: number, quantity: number, productImageUrl?: string) {
  const embed: DiscordEmbed = {
    title: "Purchase",
    color: 0xFFD700,
    fields: [
      {
        name: "사용자",
        value: `${userName} (${userId})`,
        inline: true
      },
      {
        name: "제품",
        value: `${productName} | ${planDay}`,
        inline: true
      },
      {
        name: "원래 가격",
        value: `${price.toLocaleString()}원`,
        inline: true
      },
      {
        name: "지불 금액",
        value: `${(price * quantity).toLocaleString()}원`,
        inline: true
      },
      {
        name: "수량",
        value: `${quantity}`,
        inline: true
      }
    ],
    timestamp: new Date().toISOString()
  };

  if (productImageUrl) {
    embed.image = {
      url: productImageUrl
    };
  }

  const payload: DiscordWebhookPayload = {
    username: "핵스팟 [24H]",
    embeds: [embed]
  };

  return payload;
}

