const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
  });
}

function safeText(value, maxLength = 1000) {
  if (value === undefined || value === null) return "";
  return String(value).slice(0, maxLength);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "GET" && url.pathname === "/") {
      return json({
        service: "SMS Forwarder",
        status: "ok",
        usage: "POST JSON with sender, message, and optional receivedAt",
      });
    }

    if (request.method !== "POST" || !["/", "/sms"].includes(url.pathname)) {
      return json({ error: "Not found" }, 404);
    }

    const expectedKey = env.SMS_FORWARDER_API_KEY;
    const providedKey =
      request.headers.get("X-API-Key") ||
      request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

    if (!expectedKey || !providedKey || providedKey !== expectedKey) {
      return json({ error: "Unauthorized" }, 401);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Request body must be valid JSON" }, 400);
    }

    const sender = safeText(payload.sender ?? payload.from ?? "未知寄件者", 200);
    const message = safeText(payload.message ?? payload.text ?? payload.body, 3500);
    const receivedAt = safeText(payload.receivedAt ?? payload.time ?? new Date().toISOString(), 100);

    if (!message.trim()) {
      return json({ error: "Missing message" }, 400);
    }

    if (!env.DISCORD_WEBHOOK_URL) {
      return json({ error: "Discord webhook is not configured" }, 500);
    }

    const discordPayload = {
      username: "SMS Forwarder",
      allowed_mentions: { parse: [] },
      embeds: [
        {
          title: "📩 收到新簡訊",
          color: 5793266,
          fields: [
            { name: "📱 寄件者", value: sender || "未知寄件者", inline: true },
            { name: "🕒 收到時間", value: receivedAt || "未知時間", inline: true },
            { name: "💬 簡訊內容", value: message || "(空白)", inline: false },
          ],
          footer: { text: "iPhone SMS Forwarder" },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    let discordResponse;
    try {
      discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload),
      });
    } catch {
      return json({ error: "Could not reach Discord" }, 502);
    }

    if (!discordResponse.ok) {
      return json({ error: "Discord rejected the message", status: discordResponse.status }, 502);
    }

    return json({ ok: true });
  },
};
