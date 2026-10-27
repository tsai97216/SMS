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
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f6f8fc">
<meta name="description" content="Chi SMS 簡訊收件匣">
<link rel="icon" type="image/png" href="https://raw.githubusercontent.com/tsai97216/chi-design-system/main/logo/blue-w.png">
<title>Chi SMS · 簡訊收件匣</title>
<link rel="stylesheet" href="https://chi.qzz.io/chi-design-system/tokens.css">
<link rel="stylesheet" href="https://chi.qzz.io/chi-design-system/components.css">
<link rel="stylesheet" href="https://chi.qzz.io/chi-design-system/navigation.css">
<style>
:root{font-synthesis:none}
html{min-height:100%;scroll-behavior:smooth}
body.chi-page{display:flex;min-height:100vh;min-height:100dvh;flex-direction:column}
.chi-site-header__inner{min-height:64px}
.sms-brand{display:inline-flex;align-items:center;gap:.65rem;color:var(--chi-color-text-strong);text-decoration:none;font-weight:750;letter-spacing:-.02em}
.sms-brand img{display:block;width:2rem;height:2rem;object-fit:contain}
.sms-brand .logo-dark{display:none}
[data-chi-theme=dark] .sms-brand .logo-light{display:none}
[data-chi-theme=dark] .sms-brand .logo-dark{display:block}
.sms-header-actions{display:flex;align-items:center;gap:.5rem}
.sms-theme{max-width:9rem;min-height:40px;padding:.4rem .6rem;border:1px solid var(--chi-color-border-strong);border-radius:var(--chi-radius-md);background:var(--chi-color-surface);color:var(--chi-color-text);font:inherit;font-size:var(--chi-text-sm)}
.sms-main{flex:1;width:min(calc(100% - 2.5rem),880px);margin:0 auto;padding:2.25rem 0 4rem}
.sms-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;margin-bottom:1.75rem}
.sms-page-head h1{margin:0;color:var(--chi-color-text-strong);font-size:var(--chi-text-2xl);line-height:var(--chi-leading-tight);letter-spacing:-.035em}
.sms-page-head p{margin:.55rem 0 0;color:var(--chi-color-text-muted)}
.sms-section-label{margin:0 0 .75rem;color:var(--chi-color-text-muted);font-size:var(--chi-text-xs);font-weight:700;letter-spacing:.07em}
.sms-login{max-width:480px;margin:3rem auto}
.sms-login h2{margin:0;color:var(--chi-color-text-strong);font-size:var(--chi-text-xl)}
.sms-login .chi-description{margin:.5rem 0 1.25rem;text-align:left;font-size:var(--chi-text-sm)}
.sms-form{display:flex;flex-direction:column;gap:.85rem}
.sms-field{display:flex;flex-direction:column;gap:.4rem}
.sms-toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:.75rem;margin-bottom:1rem}
.sms-toolbar-actions{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.sms-list{display:flex;flex-direction:column;gap:.75rem}
.sms-item{padding:1.1rem 1.2rem;border:1px solid var(--chi-color-border);border-radius:var(--chi-radius-lg);background:var(--chi-color-surface)}
.sms-item-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
.sms-sender{margin:0;color:var(--chi-color-text-strong);font-size:var(--chi-text-md);font-weight:700;overflow-wrap:anywhere}
.sms-time{flex:none;color:var(--chi-color-text-muted);font-size:var(--chi-text-xs);text-align:right}
.sms-message{margin:.85rem 0 0;color:var(--chi-color-text);white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.75}
.sms-code-row{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-top:1rem;padding:.7rem .8rem;border:1px solid var(--chi-color-accent-border);border-radius:var(--chi-radius-md);background:var(--chi-color-accent-soft)}
.sms-code-label{display:block;margin-bottom:.1rem;color:var(--chi-color-text-muted);font-size:var(--chi-text-xs)}
.sms-code{color:var(--chi-color-text-strong);font-family:var(--chi-font-mono);font-size:1.35rem;font-weight:750;letter-spacing:.08em;overflow-wrap:anywhere}
.sms-item-actions{display:flex;justify-content:flex-end;gap:.5rem;flex-wrap:wrap;margin-top:1rem}
.sms-item-actions .chi-button{min-height:36px;padding-inline:.8rem;font-size:var(--chi-text-xs)}
.sms-hidden{display:none!important}
.sms-status{min-height:1.5rem;margin:.5rem 0;color:var(--chi-color-text-muted);font-size:var(--chi-text-sm)}
.sms-toast{position:fixed;right:1rem;bottom:1rem;z-index:50;max-width:min(26rem,calc(100vw - 2rem));padding:.75rem 1rem;border:1px solid var(--chi-color-border-strong);border-radius:var(--chi-radius-md);background:var(--chi-color-surface-raised);color:var(--chi-color-text);box-shadow:var(--chi-shadow-md)}
.sms-footer{border-top:1px solid var(--chi-color-border);background:var(--chi-color-surface)}
.sms-footer-inner{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:1rem;padding-block:1rem;color:var(--chi-color-text-muted);font-size:var(--chi-text-xs)}
.sms-footer a{color:inherit;text-decoration:none}
.sms-footer a:hover{color:var(--chi-color-accent)}
button:disabled{opacity:.6;cursor:wait}
@media(max-width:620px){
 .chi-container{width:calc(100% - 1.5rem)}
 .sms-main{width:calc(100% - 1.5rem);padding-top:1.5rem}
 .sms-page-head{align-items:flex-start;flex-direction:column}
 .sms-toolbar{grid-template-columns:1fr}
 .sms-toolbar-actions{justify-content:space-between}
 .sms-item{padding:1rem}
 .sms-item-head{flex-direction:column;gap:.35rem}
 .sms-time{text-align:left}
 .sms-footer-inner{align-items:flex-start;flex-direction:column;justify-content:center;gap:.25rem}
 .sms-theme{max-width:7.5rem}
}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
</style>
</head>
<body class="chi-page">
<a class="chi-skip-link" href="#main-content">跳至主要內容</a>
<header class="chi-site-header">
  <div class="chi-container chi-site-header__inner">
    <a class="sms-brand" href="/" aria-label="Chi SMS 首頁">
      <img class="logo-light" src="https://raw.githubusercontent.com/tsai97216/chi-design-system/main/logo/blue-b.png" alt="">
      <img class="logo-dark" src="https://raw.githubusercontent.com/tsai97216/chi-design-system/main/logo/blue-w.png" alt="">
      <span>CHI SMS</span>
    </a>
    <div class="sms-header-actions">
      <select id="theme" class="sms-theme" aria-label="色彩主題">
        <option value="system">跟隨系統</option>
        <option value="light">淺色</option>
        <option value="dark">深色</option>
      </select>
      <button id="logout" class="chi-button sms-hidden" type="button">登出</button>
    </div>
  </div>
</header>
<main class="sms-main" id="main-content" tabindex="-1">
  <section id="login" class="chi-panel sms-login">
    <p class="sms-section-label">PRIVATE INBOX</p>
    <h2>登入簡訊收件匣</h2>
    <p class="chi-description">使用 SMS Forwarder API Key 驗證身分。金鑰只在目前頁面記憶體中使用，不會儲存到瀏覽器。</p>
    <form id="loginForm" class="sms-form">
      <label class="sms-field"><span class="chi-label">API Key</span><input id="key" class="chi-input" type="password" autocomplete="off" placeholder="輸入 API Key" required></label>
      <button class="chi-button chi-button--primary" type="submit">登入收件匣</button>
    </form>
    <p id="loginStatus" class="sms-status" role="status" aria-live="polite"></p>
  </section>
  <section id="inbox" class="sms-hidden">
    <div class="sms-page-head">
      <div><p class="sms-section-label">MESSAGES</p><h1>簡訊收件匣</h1><p>集中查看轉發簡訊，驗證碼可直接複製。</p></div>
      <span id="count" class="chi-badge">0 則簡訊</span>
    </div>
    <div class="sms-toolbar">
      <input id="search" class="chi-input" type="search" placeholder="搜尋寄件者或簡訊內容" aria-label="搜尋寄件者或簡訊內容">
      <div class="sms-toolbar-actions">
        <button id="refresh" class="chi-button" type="button">重新整理</button>
        <button id="test" class="chi-button" type="button">新增測試訊息</button>
      </div>
    </div>
    <p id="status" class="sms-status" role="status" aria-live="polite"></p>
    <div id="items" class="sms-list"></div>
  </section>
</main>
<footer class="sms-footer"><div class="chi-container sms-footer-inner"><span>CHI SMS · 私人簡訊收件匣</span><a href="https://chi.qzz.io/chi-design-system/" target="_blank" rel="noreferrer">Chi Design System</a></div></footer>
<div id="toast" class="sms-toast sms-hidden" role="status" aria-live="polite"></div>
<script>
(() => {
  const root = document.documentElement;
  const themeSelect = document.getElementById("theme");
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const savedTheme = () => { try { return localStorage.getItem("chi-sms-theme") || "system"; } catch { return "system"; } };
  let theme = savedTheme();
  function applyTheme(value) {
    theme = value;
    if (value === "dark" || (value === "system" && media.matches)) root.setAttribute("data-chi-theme", "dark");
    else root.removeAttribute("data-chi-theme");
    themeSelect.value = value;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = root.getAttribute("data-chi-theme") === "dark" ? "#17191f" : "#f6f8fc";
  }
  applyTheme(theme);
  themeSelect.addEventListener("change", () => {
    applyTheme(themeSelect.value);
    try { localStorage.setItem("chi-sms-theme", themeSelect.value); } catch {}
  });
  media.addEventListener?.("change", () => { if (theme === "system") applyTheme("system"); });

  let apiKey = "";
  let toastTimer;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  function showToast(message) {
    $("toast").textContent = message;
    $("toast").classList.remove("sms-hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.add("sms-hidden"), 2200);
  }
  function showInbox(on) {
    $("login").classList.toggle("sms-hidden", on);
    $("inbox").classList.toggle("sms-hidden", !on);
    $("logout").classList.toggle("sms-hidden", !on);
  }
  function extractCode(message) {
    const text = String(message || "");
    const runs = [...text.matchAll(/[0-9]{4,8}/g)];
    const keywords = /驗證碼|verification\s*code|one[- ]time\s*code|\bOTP\b/i;
    for (const run of runs) {
      const nearby = text.slice(Math.max(0, run.index - 36), Math.min(text.length, run.index + run[0].length + 36));
      if (keywords.test(nearby)) return run[0];
    }
    return runs.length === 1 ? runs[0][0] : "";
  }
  function formatDate(value) {
    if (!value) return "時間未知";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  }
  async function copyText(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      showToast(label + "已複製");
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand("copy");
      area.remove();
      showToast(copied ? label + "已複製" : "複製失敗，請手動選取文字");
    }
  }
  async function load() {
    $("status").textContent = "正在載入簡訊…";
    try {
      const response = await fetch("/api/messages", { headers: { "X-API-Key": apiKey } });
      if (response.status === 401) throw new Error("API Key 無效，請重新登入。");
      if (!response.ok) throw new Error("讀取失敗，請稍後重試（" + response.status + "）。");
      const data = await response.json();
      window.smsMessages = data.messages || [];
      render();
      $("status").textContent = "";
    } catch (error) {
      $("status").textContent = error.message || "讀取失敗。";
    }
  }
  function render() {
    const query = $("search").value.trim().toLocaleLowerCase();
    const messages = (window.smsMessages || []).filter(message => (String(message.sender || "") + " " + String(message.message || "")).toLocaleLowerCase().includes(query));
    const codes = messages.filter(message => extractCode(message.message)).length;
    $("count").textContent = messages.length + " 則簡訊" + (codes ? " · " + codes + " 則含驗證碼" : "");
    if (!messages.length) {
      $("items").innerHTML = '<div class="chi-empty"><p>目前沒有符合的簡訊</p><p class="chi-help">收到新訊息後，會自動出現在這裡。</p></div>';
      return;
    }
    $("items").innerHTML = messages.map(message => {
      const code = extractCode(message.message);
      return '<article class="sms-item"><div class="sms-item-head"><h2 class="sms-sender">' + esc(message.sender || "未知寄件者") + '</h2><time class="sms-time">' + esc(formatDate(message.received_at)) + '</time></div>' +
        '<div class="sms-message">' + esc(message.message) + '</div>' +
        (code ? '<div class="sms-code-row"><div><span class="sms-code-label">偵測到驗證碼</span><span class="sms-code">' + esc(code) + '</span></div><button class="chi-button chi-button--primary" type="button" data-copy-code="' + esc(code) + '">複製驗證碼</button></div>' : '') +
        '<div class="sms-item-actions"><button class="chi-button" type="button" data-copy-message="' + esc(message.id) + '">複製完整簡訊</button></div></article>';
    }).join("");
  }
  $("loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    apiKey = $("key").value;
    $("loginStatus").textContent = "正在驗證…";
    const submit = $("loginForm").querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const response = await fetch("/api/messages", { headers: { "X-API-Key": apiKey } });
      if (!response.ok) throw new Error("驗證失敗，請確認 API Key。");
      const data = await response.json();
      window.smsMessages = data.messages || [];
      $("key").value = "";
      showInbox(true);
      render();
      $("loginStatus").textContent = "";
    } catch (error) {
      apiKey = "";
      $("loginStatus").textContent = error.message || "登入失敗。";
    } finally {
      submit.disabled = false;
    }
  });
  $("refresh").addEventListener("click", load);
  $("test").addEventListener("click", async () => {
    const button = $("test");
    button.disabled = true;
    $("status").textContent = "正在寫入測試訊息…";
    try {
      const response = await fetch("/api/test", { method: "POST", headers: { "X-API-Key": apiKey } });
      if (!response.ok) throw new Error("測試寫入失敗（" + response.status + "）。");
      await load();
      showToast("測試訊息已新增");
    } catch (error) {
      $("status").textContent = error.message || "測試寫入失敗。";
    } finally {
      button.disabled = false;
    }
  });
  $("search").addEventListener("input", render);
  $("items").addEventListener("click", event => {
    const codeButton = event.target.closest("[data-copy-code]");
    if (codeButton) { copyText(codeButton.getAttribute("data-copy-code"), "驗證碼"); return; }
    const messageButton = event.target.closest("[data-copy-message]");
    if (messageButton) {
      const message = (window.smsMessages || []).find(item => String(item.id) === messageButton.getAttribute("data-copy-message"));
      if (message) copyText(String(message.message || ""), "完整簡訊");
    }
  });
  $("logout").addEventListener("click", () => {
    apiKey = "";
    window.smsMessages = [];
    $("items").innerHTML = "";
    $("search").value = "";
    showInbox(false);
    $("key").focus();
  });
})();
</script>
</body>
</html>`, {
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
