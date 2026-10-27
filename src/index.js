const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

function authorized(request, env) {
  const expected = env.SMS_FORWARDER_API_KEY;
  const provided = request.headers.get("X-API-Key") ||
    request.headers.get("Authorization")?.replace(/^Bearer\\s+/i, "");
  return Boolean(expected && provided && provided === expected);
}

function page() {
  return new Response(`<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><title>Chi SMS Inbox</title>
<style>
:root{color-scheme:dark;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#101114;color:#eee}
*{box-sizing:border-box}body{margin:0 auto;padding:24px 16px;max-width:860px}header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:24px}
h1{font-size:24px;margin:0}p{color:#a3a3ad}.panel,.sms{background:#191a20;border:1px solid #30313a;border-radius:14px;padding:16px;margin:12px 0}
input,button{font:inherit;border-radius:9px;padding:11px 12px;border:1px solid #3a3b45;background:#111216;color:#eee}
input{width:100%;margin:7px 0 12px}button{cursor:pointer;background:#292b35}button:hover{background:#383a46}
.actions{display:flex;gap:8px;flex-wrap:wrap}.meta{color:#9b9ca8;font-size:13px;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
.message{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;margin-top:12px}.sender{font-weight:650;font-size:16px}
.hidden{display:none!important}.status{min-height:22px;color:#b7b8c4;font-size:14px}#items{margin-top:18px}
</style></head><body>
<header><div><h1>Chi SMS Inbox</h1><p>你的簡訊收件匣</p></div><button id="logout" class="hidden">登出</button></header>
<section id="login" class="panel"><h2>登入收件匣</h2><p>輸入 SMS Forwarder API Key 以讀取簡訊。</p>
<form id="loginForm"><input id="key" type="password" autocomplete="off" placeholder="API Key" required><button type="submit">登入</button></form><div id="loginStatus" class="status"></div></section>
<section id="inbox" class="hidden"><div class="panel"><input id="search" type="search" placeholder="搜尋寄件者或簡訊內容"><div class="actions"><button id="refresh">重新整理</button><button id="test">新增測試訊息</button><span id="count" class="status"></span></div></div><div id="status" class="status"></div><div id="items"></div></section>
<script>
let apiKey="";
const $=id=>document.getElementById(id);
function showInbox(on){$("login").classList.toggle("hidden",on);$("inbox").classList.toggle("hidden",!on);$("logout").classList.toggle("hidden",!on);}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function load(){ $("status").textContent="載入中…";try{const r=await fetch("/api/messages",{headers:{"X-API-Key":apiKey}});if(r.status===401)throw Error("API Key 無效，請重新登入。");if(!r.ok)throw Error("讀取失敗："+r.status);const data=await r.json();window.smsMessages=data.messages||[];render();$("status").textContent="";}catch(e){$("status").textContent=e.message;}}
function render(){const q=$("search").value.trim().toLowerCase();const list=(window.smsMessages||[]).filter(m=>(m.sender+" "+m.message).toLowerCase().includes(q));$("count").textContent=list.length+" 則簡訊";$("items").innerHTML=list.map(m=>'<article class="sms"><div class="meta"><span class="sender">'+esc(m.sender)+'</span><time>'+esc(m.received_at)+'</time></div><div class="message">'+esc(m.message)+'</div></article>').join("")||'<div class="panel">沒有符合的簡訊</div>';}
$("loginForm").addEventListener("submit",async e=>{e.preventDefault();apiKey=$("key").value;$("loginStatus").textContent="驗證中…";try{const r=await fetch("/api/messages",{headers:{"X-API-Key":apiKey}});if(!r.ok)throw Error("驗證失敗，請確認 API Key。");const data=await r.json();window.smsMessages=data.messages||[];$("key").value="";showInbox(true);render();$("loginStatus").textContent="";}catch(err){apiKey="";$("loginStatus").textContent=err.message;}});
$("refresh").addEventListener("click",load);$("test").addEventListener("click",async()=>{const b=$("test");b.disabled=true;$("status").textContent="正在寫入測試訊息…";try{const r=await fetch("/api/test",{method:"POST",headers:{"X-API-Key":apiKey}});if(!r.ok)throw Error("測試寫入失敗："+r.status);await load();$("status").textContent="測試訊息已寫入資料庫並重新載入。";}catch(e){$("status").textContent=e.message;}finally{b.disabled=false;}});$("search").addEventListener("input",render);$("logout").addEventListener("click",()=>{apiKey="";window.smsMessages=[];$("items").innerHTML="";showInbox(false);}); 
</script></body></html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "GET" && url.pathname === "/") return page();

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ service: "SMS Forwarder", status: "ok" });
    }

    if (request.method === "GET" && url.pathname === "/api/messages") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
      if (!env.SMS_DB) return json({ error: "Database is not configured" }, 503);
      try {
        const result = await env.SMS_DB.prepare(
          "SELECT id, sender, message, received_at FROM messages ORDER BY id DESC LIMIT 500"
        ).all();
        return json({ messages: result.results || [] });
      } catch {
        return json({ error: "Could not read messages" }, 500);
      }
    }

    if (request.method === "POST" && url.pathname === "/api/test") {
      if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);
      if (!env.SMS_DB) return json({ error: "Database is not configured" }, 503);
      const receivedAt = new Date().toISOString();
      try {
        await env.SMS_DB.prepare(
          "INSERT INTO messages (sender, message, received_at) VALUES (?, ?, ?)"
        ).bind("Chi SMS 網站測試", "這是一則測試訊息，用來確認資料庫寫入與收件匣顯示正常。", receivedAt).run();
        return json({ ok: true, saved: true });
      } catch {
        return json({ error: "Could not save test message to database" }, 500);
      }
    }

    if (request.method !== "POST" || !["/", "/sms"].includes(url.pathname)) {
      return json({ error: "Not found" }, 404);
    }

    if (!authorized(request, env)) return json({ error: "Unauthorized" }, 401);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Request body must be valid JSON" }, 400);
    }

    const sender = safeText(payload.sender ?? payload.from ?? "未知寄件者", 200);
    const message = safeText(payload.message ?? payload.text ?? payload.body, 3500);
    const receivedAt = safeText(payload.receivedAt ?? payload.time ?? new Date().toISOString(), 100);
    if (!message.trim()) return json({ error: "Missing message" }, 400);

    if (env.SMS_DB) {
      try {
        await env.SMS_DB.prepare(
          "INSERT INTO messages (sender, message, received_at) VALUES (?, ?, ?)"
        ).bind(sender || "未知寄件者", message, receivedAt || new Date().toISOString()).run();
      } catch {
        return json({ error: "Could not save message to database" }, 500);
      }
    }

    if (!env.DISCORD_WEBHOOK_URL) return json({ error: "Discord webhook is not configured" }, 500);

    const discordPayload = {
      username: "SMS Forwarder",
      allowed_mentions: { parse: [] },
      embeds: [{
        title: "📩 收到新簡訊",
        color: 5793266,
        fields: [
          { name: "📱 寄件者", value: sender || "未知寄件者", inline: true },
          { name: "🕒 收到時間", value: receivedAt || "未知時間", inline: true },
          { name: "💬 簡訊內容", value: message || "(空白)", inline: false },
        ],
        footer: { text: "iPhone SMS Forwarder" },
        timestamp: new Date().toISOString(),
      }],
    };

    let discordResponse;
    try {
      discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload),
      });
    } catch {
      return json({ error: "Could not reach Discord", saved: Boolean(env.SMS_DB) }, 502);
    }

    if (!discordResponse.ok) {
      return json({ error: "Discord rejected the message", status: discordResponse.status, saved: Boolean(env.SMS_DB) }, 502);
    }
    return json({ ok: true, saved: Boolean(env.SMS_DB) });
  },
};
