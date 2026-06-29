const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname, '../screenshots');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto(BASE);
  await page.click('.auth-tab[data-tab="login"]');
  await page.fill('#login-email', 'mobile@test.com');
  await page.fill('#login-password', 'Password1');

  try {
    await page.click('#login-form button[type="submit"]');
    await page.waitForSelector('#dashboard-screen:not(.hidden)', { timeout: 5000 });
  } catch {
    const email = `mobile${Date.now()}@test.com`;
    await page.click('.auth-tab[data-tab="register"]');
    await page.fill('#reg-name', 'Almas Student');
    await page.fill('#reg-email', email);
    await page.fill('#reg-password', 'Password1');
    await page.click('#register-form button[type="submit"]');
    await page.waitForSelector('#dashboard-screen:not(.hidden)', { timeout: 10000 });
  }

  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(OUT, '09-mobile-view.png'), fullPage: true });

  await browser.close();
  console.log('Mobile screenshot saved');
})();
