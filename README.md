# Klik Indomaret Automation (Playwright)

Automation web **tanpa login** untuk https://www.klikindomaret.com/

## Skenario
1. Akses https://www.klikindomaret.com/
2. Pilih Meta Kategori "Makanan"
3. Pilih kategori "Madu"
4. Pilih salah satu produk Madu
5. Masuk ke halaman produk detail
6. Klik button "+ Keranjang"

## Cara menjalankan
```bash
npm install
npx playwright install chromium
npm test              # headless
npm run test:headed   # lihat browser
npm run report        # buka HTML report
```

Screenshot hasil ada di folder `screenshots/`.

## Tools
- Playwright Test (JavaScript)
