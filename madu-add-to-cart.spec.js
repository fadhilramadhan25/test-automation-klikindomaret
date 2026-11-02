const { test, expect } = require('@playwright/test');

// Screenshot tiap step supaya mudah lihat di mana berhenti
async function snap(page, name) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: false }).catch(() => {});
}

// Tutup popup (lokasi, promo, cookie, dll) kalau muncul
async function dismissPopups(page) {
  const candidates = [
    'button:has-text("Tutup")',
    'button:has-text("Nanti")',
    'button:has-text("Lewati")',
    'button:has-text("Mengerti")',
    'button:has-text("OK")',
    '[aria-label="Close"]',
    '[aria-label="close"]',
    '.close',
    '.btn-close',
    '.modal .close',
  ];
  for (const sel of candidates) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 800 }).catch(() => false)) {
      await el.click({ timeout: 2000 }).catch(() => {});
    }
  }
}

test('Tambah produk Madu ke keranjang tanpa login', async ({ page }) => {
  // Sembunyikan flag webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  // 1. Akses Klik Indomaret
  await page.goto('https://www.klikindomaret.com/', { waitUntil: 'load', timeout: 60_000 });
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await dismissPopups(page);
  await snap(page, '01-home');
  await expect(page).toHaveURL(/klikindomaret\.com/);

  // 2. Pilih Meta Kategori "Makanan"
  const makanan = page
    .locator('a, button, li, span, div')
    .filter({ hasText: /^\s*Makanan\s*$/ })
    .first();
  await makanan.waitFor({ state: 'visible', timeout: 30_000 });
  await makanan.hover().catch(() => {});
  await makanan.click({ force: true });
  await page.waitForLoadState('domcontentloaded');
  await dismissPopups(page);
  await snap(page, '02-makanan');

  // 3. Pilih kategori "Madu"
  // Beberapa kandidat locator untuk "Madu", dicoba berurutan
  const maduCandidates = () => [
    page.getByRole('link', { name: /^\s*Madu\s*$/i }),
    page.locator('a, button, li, span, div').filter({ hasText: /^\s*Madu\s*$/i }),
    page.getByText(/^\s*Madu\s*$/i),
    // href mengandung "madu" tapi bukan produk (hindari "madurasa")
    page.locator('a[href*="/madu" i]:not([href*="madurasa" i])'),
  ];

  async function findMadu() {
    for (const loc of maduCandidates()) {
      const el = loc.first();
      if (await el.isVisible({ timeout: 1500 }).catch(() => false)) return el;
    }
    return null;
  }

  let madu = await findMadu();

  // Kalau belum ketemu: hover Makanan (buka submenu), klik "Lihat Semua"/"Selengkapnya", lalu scroll
  for (let i = 0; i < 6 && !madu; i++) {
    await makanan.hover().catch(() => {});
    const expand = page.getByText(/Lihat Semua|Selengkapnya|Lihat Lainnya|Semua Kategori/i).first();
    if (await expand.isVisible({ timeout: 800 }).catch(() => false)) {
      await expand.click().catch(() => {});
    }
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(800);
    madu = await findMadu();
  }

  // Fallback terakhir: pakai kolom pencarian
  if (!madu) {
    console.log('Kategori Madu tidak ketemu, pakai pencarian "madu"');
    const search = page.locator('input[type="search"], input[placeholder*="Cari" i], input[name*="search" i]').first();
    await search.fill('madu');
    await search.press('Enter');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
  } else {
    await madu.scrollIntoViewIfNeeded().catch(() => {});
    await madu.click({ force: true });
  }
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await dismissPopups(page);
  await snap(page, '03-madu');

  // 4. Pilih salah satu produk Madu (produk pertama)
  // Link produk di Klik Indomaret berpola /xpress/<nama-produk> (atau /product/...)
  const produk = page.locator('a[href*="/xpress/"], a[href*="/product/"]').first();
  await produk.waitFor({ state: 'visible', timeout: 30_000 });
  const href = await produk.getAttribute('href');
  console.log('Produk dipilih:', href);
  await produk.scrollIntoViewIfNeeded();
  await produk.click();

  // 5. Masuk ke halaman produk detail
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL(/\/(xpress|product)\//, { timeout: 30_000 });
  await dismissPopups(page);
  await snap(page, '04-detail-produk');

  // 6. Klik button "+ Keranjang"
  const btnKeranjang = page
    .locator('button, a, div[role="button"]')
    .filter({ hasText: /Keranjang/i })
    .first();
  await btnKeranjang.waitFor({ state: 'visible', timeout: 30_000 });
  await btnKeranjang.click();
  await page.waitForTimeout(3000);
  await snap(page, '05-setelah-klik-keranjang');
});
