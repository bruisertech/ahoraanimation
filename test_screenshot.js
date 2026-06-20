const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

  await page.goto('file://' + process.cwd() + '/custom-gifts.html');
  await page.waitForTimeout(2000); // Wait for animations
  await page.screenshot({ path: 'custom-gifts-screenshot.png' });

  await browser.close();
})();
