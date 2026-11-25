import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto("https://mentor-lagbe-client-rose.vercel.app/tuitions", {
  waitUntil: "networkidle",
});
await page.waitForSelector(".tuition-card", { timeout: 20000 });
const cards = await page.locator(".tuition-card").count();
const heading = await page.locator(".results-heading h2").innerText();

await page.fill('input[aria-label="Search tutor or subject"]', "IELTS");
await page.waitForTimeout(1200);
const searchCards = await page.locator(".tuition-card").count();
const searchHeading = await page.locator(".results-heading h2").innerText();

const optionCount = await page.locator("#subject-filter option").count();

await page.goto("https://mentor-lagbe-client-rose.vercel.app/sign-in", {
  waitUntil: "networkidle",
});
await page.fill("#auth-email", "admin@mentorlagbe.com");
await page.fill("#auth-password", "Admin12345!");
await page.click('button[type="submit"]');
await page.waitForURL("**/dashboard/admin", { timeout: 25000 });
const dashHeading = await page.locator("h1").first().innerText();

await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const urlAfterReload = page.url();
const bodyText = await page.locator("body").innerText();

console.log(JSON.stringify({
  cards,
  heading,
  searchCards,
  searchHeading,
  optionCount,
  dashHeading,
  urlAfterReload,
  reloadKeptDashboard: bodyText.toLowerCase().includes("admin"),
  errors,
}, null, 2));
await browser.close();
