const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname, '../screenshots');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(BASE);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, '01-sign-in.png'), fullPage: true });

  await page.click('.auth-tab[data-tab="register"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, '02-sign-up.png'), fullPage: true });

  const email = `report${Date.now()}@test.com`;
  await page.fill('#reg-name', 'Almas Student');
  await page.fill('#reg-email', email);
  await page.fill('#reg-phone', '+7 777 123 4567');
  await page.fill('#reg-password', 'Password1');
  await page.click('#register-form button[type="submit"]');
  await page.waitForSelector('#dashboard-screen:not(.hidden)', { timeout: 10000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, '03-tasks-dashboard.png'), fullPage: true });

  await page.click('#new-task-btn');
  await page.waitForSelector('#task-modal:not(.hidden)');
  await page.fill('#task-title', 'Complete Industry Report');
  await page.fill('#task-description', 'Write and submit the practice project report');
  await page.selectOption('#task-status', 'in_progress');
  await page.selectOption('#task-priority', 'high');
  await page.fill('#task-due', '2026-07-15');
  await page.click('#task-form button[type="submit"]');
  await page.waitForTimeout(600);

  await page.click('#new-task-btn');
  await page.fill('#task-title', 'Deploy to Render');
  await page.selectOption('#task-status', 'pending');
  await page.selectOption('#task-priority', 'medium');
  await page.click('#task-form button[type="submit"]');
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(OUT, '04-tasks-with-data.png'), fullPage: true });

  await page.fill('#search-input', 'report');
  await page.selectOption('#status-filter', 'in_progress');
  await page.click('#apply-filters');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, '05-search-and-filter.png'), fullPage: true });

  await page.click('.nav-item[data-view="categories"]');
  await page.waitForTimeout(400);
  await page.click('#new-category-btn');
  await page.fill('#category-name', 'University');
  await page.fill('#category-description', 'Academic tasks and assignments');
  await page.fill('#category-color', '#6366f1');
  await page.click('#category-form button[type="submit"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, '06-categories.png'), fullPage: true });

  await page.click('.nav-item[data-view="profile"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, '07-profile.png'), fullPage: true });

  await page.click('#theme-toggle');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, '08-dark-mode.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('.nav-item[data-view="tasks"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, '09-mobile-view.png'), fullPage: true });

  await browser.close();
  console.log('Screenshots saved to', OUT);
})();
