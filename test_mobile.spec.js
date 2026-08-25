const { test, expect } = require('@playwright/test');

test('Mobile Intro Screen Check', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://127.0.0.1:8080');

  await page.waitForTimeout(11000);

  await page.screenshot({ path: 'mobile_intro_fix.png' });
});
