import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const WEB = "http://localhost:3000";
const PORT = 9225;
const userDataDir = mkdtempSync(join(tmpdir(), "mentorlagbe-dash-"));
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
      return;
    }
    if (message.method === "Network.responseReceived") {
      const { url, status } = message.params.response;
      if (url.includes("/api/") || url.includes("/dashboard")) console.log("NET", status, url);
    }
    if (message.method === "Network.requestWillBeSent") {
      const { url } = message.params.request;
      if (url.includes("/api/")) console.log("REQ", url);
    }
    if (message.method === "Runtime.consoleAPICalled") {
      console.log("CONSOLE", message.params.type, message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
    }
    if (message.method === "Runtime.exceptionThrown") {
      console.log("EXCEPTION", message.params.exceptionDetails?.text, message.params.exceptionDetails?.exception?.description);
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
  const cookies = response.headers.getSetCookie?.() ?? [];
  const tokenResponse = await fetch(`${WEB}/api/auth/token`, {
    headers: { cookie: cookies.map((cookie) => cookie.split(";")[0]).join("; ") },
  });
  const tokenPayload = await tokenResponse.json();

  for (const cookie of cookies) {
    const [pair] = cookie.split(";");
    const separator = pair.indexOf("=");
    await send("Network.setCookie", {
      name: pair.slice(0, separator),
      value: pair.slice(separator + 1),
      url: WEB,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    });
  }

  await send("Page.navigate", { url: `${WEB}/` });
  await sleep(2000);
  console.log("on /, body starts:", (await evaluate("document.body.innerText")).slice(0, 120));
  await evaluate(`localStorage.setItem("mentorlagbe-access-token", ${JSON.stringify(tokenPayload.token)})`);
  console.log("localStorage token set:", Boolean(await evaluate(`localStorage.getItem("mentorlagbe-access-token")`)));

  console.log("--- navigating to dashboard ---");
  await send("Page.navigate", { url: `${WEB}/dashboard/admin` });
  for (const delay of [500, 1000, 2000, 3000, 5000]) {
    await sleep(delay);
    const body = await evaluate("document.body.innerText");
    console.log(`after ${delay}ms:`, body.slice(0, 200).replace(/\n/g, " | "));
    console.log(`  url: ${await evaluate("location.pathname")}`);
  }
} catch (error) {
  console.error("Debug failed:", error);
} finally {
  try { ws?.close(); } catch {}
  try { chrome?.kill(); } catch {}
  await sleep(500);
  try { rmSync(userDataDir, { recursive: true, force: true }); } catch {}
}
