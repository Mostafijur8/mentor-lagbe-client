import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const WEB = "http://localhost:3000";
const PORT = 9224;
const userDataDir = mkdtempSync(join(tmpdir(), "mentorlagbe-cookie-"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let chrome;
let ws;
let messageId = 0;
const pending = new Map();

async function waitForJson(url, timeout = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {}
    await sleep(300);
  }
  throw new Error(`Timed out waiting for ${url}`);
}
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++messageId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Evaluation failed");
  return result.result?.value;
}
async function navigate(url) {
  await send("Page.navigate", { url });
  await sleep(3000);
}

try {
  chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-sandbox", "--no-first-run", `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDataDir}`, "about:blank"], { stdio: "ignore" });
  await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
  const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");

  const response = await fetch(`${WEB}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: WEB },
    body: JSON.stringify({ email: "admin@mentorlagbe.com", password: "Admin12345!" }),
  });
  console.log("sign-in status:", response.status);
  const cookies = response.headers.getSetCookie?.() ?? [];
  console.log("set-cookie:", cookies);
  const tokenResponse = await fetch(`${WEB}/api/auth/token`, {
    headers: { cookie: cookies.map((cookie) => cookie.split(";")[0]).join("; ") },
  });
  const tokenPayload = await tokenResponse.json();
  console.log("token bridge:", tokenResponse.status, tokenPayload.user?.email, tokenPayload.token?.length);

  for (const cookie of cookies) {
    const [pair] = cookie.split(";");
    const separator = pair.indexOf("=");
    const name = pair.slice(0, separator);
    const value = pair.slice(separator + 1);
    const result = await send("Network.setCookie", { name, value, url: WEB, path: "/", httpOnly: true, sameSite: "Lax" });
    console.log("setCookie", name, "=>", result);
  }
  const stored = await send("Network.getCookies", { urls: [WEB] });
  console.log("stored cookies:", stored.cookies?.map((cookie) => ({ name: cookie.name, domain: cookie.domain, path: cookie.path, valueLength: cookie.value?.length })));

  await navigate(`${WEB}/`);
  console.log("document.cookie:", await evaluate("document.cookie"));
  const sessionText = await evaluate("fetch('/api/auth/get-session', { credentials: 'include' }).then(async r => r.status + ' ' + (await r.text()).slice(0, 500))");
  console.log("get-session:", sessionText);
  const tokenText = await evaluate("fetch('/api/auth/token', { credentials: 'include' }).then(async r => r.status + ' ' + (await r.text()).slice(0, 500))");
  console.log("token endpoint:", tokenText);

  await evaluate(`localStorage.setItem("mentorlagbe-access-token", ${JSON.stringify(tokenPayload.token)})`);
  await navigate(`${WEB}/dashboard/admin`);
  console.log("body:", (await evaluate("document.body.innerText")).slice(0, 1000));
} catch (error) {
  console.error("Debug failed:", error);
} finally {
  try { ws?.close(); } catch {}
  try { chrome?.kill(); } catch {}
  await sleep(500);
  try { rmSync(userDataDir, { recursive: true, force: true }); } catch {}
}
