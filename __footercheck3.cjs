const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelector("footer").scrollIntoView());
  await page.waitForTimeout(500);
  await page.locator("footer").screenshot({ path: process.argv[2] + "/footer-credit3.png" });
  await browser.close();
})();
