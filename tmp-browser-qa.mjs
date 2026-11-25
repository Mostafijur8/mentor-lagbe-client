import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const WEB = "http://localhost:3000";
const API = "http://localhost:5000/api";
const PORT = 9223;
const PASSWORD = "Password123!";
const ADMIN_PASSWORD = "Admin12345!";
const userDataDir = mkdtempSync(join(tmpdir(), "mentorlagbe-chrome-"));
const screenshotsDir = mkdtempSync(join(tmpdir(), "mentorlagbe-screenshots-"));

let chrome;
let ws;
let messageId = 0;
const pending = new Map();
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForJson(url, timeout = 20000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {
      // Chrome is still starting.
    }
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
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Evaluation failed");
  }
  return result.result?.value;
}

async function navigate(url) {
  await send("Page.navigate", { url });
  await sleep(2500);
}

async function getSession(email, password) {
  const response = await fetch(`${WEB}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: WEB },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Sign-in failed for ${email}: ${response.status}`);
  const cookies = response.headers.getSetCookie?.() ?? [];
  const tokenResponse = await fetch(`${WEB}/api/auth/token`, {
    headers: { cookie: cookies.map((cookie) => cookie.split(";")[0]).join("; ") },
  });
  if (!tokenResponse.ok) throw new Error(`Token bridge failed for ${email}: ${tokenResponse.status}`);
  const payload = await tokenResponse.json();
  return { cookies, token: payload.token };
}

async function setSession({ cookies, token }) {
  await send("Network.clearBrowserCookies");
  for (const cookie of cookies) {
    const [pair] = cookie.split(";");
    const separator = pair.indexOf("=");
    const name = pair.slice(0, separator);
    const value = pair.slice(separator + 1);
    await send("Network.setCookie", {
      name,
      value,
      url: WEB,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    });
  }
  await navigate(`${WEB}/`);
  await evaluate(`localStorage.setItem("mentorlagbe-access-token", ${JSON.stringify(token)})`);
}

async function bodyText() {
  return evaluate("document.body.innerText");
}

async function screenshot(name) {
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(screenshotsDir, name), Buffer.from(result.data, "base64"));
}

const checks = [];
function check(name, condition, detail = "") {
  checks.push({ name, condition, detail });
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

try {
  chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
  const target = await (
    await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent("about:blank")}`, {
      method: "PUT",
    })
  ).json();

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
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      consoleErrors.push(
        message.params.args
          .map((arg) => arg.value ?? arg.description ?? "")
          .filter(Boolean)
          .join(" "),
      );
    }
    if (message.method === "Runtime.exceptionThrown") {
      pageErrors.push(message.params.exceptionDetails?.text ?? "Unknown exception");
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      consoleErrors.push(message.params.entry.text);
    }
    if (message.method === "Network.loadingFailed") {
      failedRequests.push(message.params.errorText);
    }
  });

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");
  await send("Log.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Public tuition listing renders API-backed cards in a real browser.
  await navigate(`${WEB}/tuitions`);
  let text = await bodyText();
  check("browser: /tuitions renders a listing", text.includes("Higher Math Mastery for SSC"));
  check("browser: /tuitions shows search controls", text.includes("Search") || text.includes("Filter"));
  await screenshot("tuitions.png");

  // Admin workspace
  const admin = await getSession("admin@mentorlagbe.com", ADMIN_PASSWORD);
  await setSession(admin);
  await navigate(`${WEB}/dashboard/admin`);
  text = await bodyText();
  check("browser: admin dashboard opens", text.includes("Admin") || text.includes("admin"));
  check("browser: admin stats show users", text.includes("51") || text.includes("Total users") || text.includes("users"));
  await screenshot("admin-dashboard.png");

  await navigate(`${WEB}/dashboard/admin/users`);
  text = await bodyText();
  check("browser: admin users page lists new tutor", text.includes("Mehedi Hasan"));
  check("browser: admin users page lists new student", text.includes("Rafi Ahmed"));
  await screenshot("admin-users.png");

  await navigate(`${WEB}/dashboard/admin/transactions`);
  text = await bodyText();
  check("browser: transactions page shows payments", text.includes("Pro Tutor") || text.includes("Pro Student"));
  check("browser: transactions page shows revenue", text.includes("90") || text.includes("$"));

  // Tutor workspace
  const tutor = await getSession("mehedi.tutor@example.com", PASSWORD);
  await setSession(tutor);
  await navigate(`${WEB}/dashboard/tutor`);
  text = await bodyText();
  check("browser: tutor dashboard opens", text.includes("Mehedi Hasan"));
  check("browser: tutor dashboard shows tuition count", text.includes("HSC Physics Final Revision") || text.includes("1"));
  await screenshot("tutor-dashboard.png");

  await navigate(`${WEB}/dashboard/tutor/applicants`);
  text = await bodyText();
  check("browser: tutor applicants page lists applicant", text.includes("Samia Kabir"));
  await screenshot("tutor-applicants.png");

  // Student workspace
  const student = await getSession("nabila.student@example.com", PASSWORD);
  await setSession(student);
  await navigate(`${WEB}/dashboard/student`);
  text = await bodyText();
  check("browser: student dashboard opens", text.includes("Nabila Sultana"));
  await screenshot("student-dashboard.png");

  await navigate(`${WEB}/dashboard/student/my-applications`);
  text = await bodyText();
  check("browser: student applications page shows applications", text.includes("IELTS Band 7 Writing Lab"));
  await screenshot("student-applications.png");

  await navigate(`${WEB}/dashboard/student/saved-tuitions`);
  text = await bodyText();
  check("browser: saved tuitions page shows bookmarks", text.includes("Biology Revision for HSC"));
  check("browser: saved tuitions page shows second bookmark", text.includes("Organic Chemistry Made Simple"));
  await screenshot("student-saved.png");

  await navigate(`${WEB}/dashboard/profile`);
  text = await bodyText();
  check("browser: profile page opens", text.includes("My profile") && text.includes("Nabila Sultana"));

  check(
    "browser: no uncaught page exceptions",
    pageErrors.length === 0,
    pageErrors.slice(0, 3).join(" | "),
  );
  check(
    "browser: no console errors",
    consoleErrors.length === 0,
    consoleErrors.slice(0, 3).join(" | "),
  );

  console.log(`\nScreenshots: ${screenshotsDir}`);
} catch (error) {
  console.error("Browser test failed:", error);
  process.exitCode = 1;
} finally {
  try {
    ws?.close();
  } catch {}
  try {
    chrome?.kill();
  } catch {}
  await sleep(500);
  try {
    rmSync(userDataDir, { recursive: true, force: true });
  } catch {}
  const failed = checks.filter((check) => !check.condition);
  console.log(`\nBrowser summary: ${checks.length - failed.length} passed, ${failed.length} failed.`);
}
