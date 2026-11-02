const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 180_000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'https://www.klikindomaret.com',
    // Browser dibuka beneran (tidak headless) supaya tidak diblokir anti-bot & bisa dilihat
    headless: false,
    channel: 'chrome', // pakai Google Chrome yang terinstall; hapus baris ini jika tidak ada Chrome
    viewport: { width: 1366, height: 768 },
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    launchOptions: {
      slowMo: 500,
      args: ['--disable-blink-features=AutomationControlled', '--start-maximized'],
    },
    screenshot: 'on',
    video: 'on',
    trace: 'on',
  },
});
