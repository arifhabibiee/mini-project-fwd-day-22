# MW75 TUMI — Interactive Product Detail Page

Mini Project Full-Stack Web Development **Day 22: Adding Interactivity to Websites with JavaScript**. Proyek ini melanjutkan study case Phase 1 (Mini Project Day 5) dengan menambahkan interaksi DOM, validasi quantity, pembaruan subtotal dan keranjang lokal, serta penanganan request asynchronous pada halaman berbasis API.

Proyek menyediakan **dua halaman detail produk** dengan antarmuka yang serupa, tetapi **sumber data tetap terpisah**:

| Halaman | Sumber data | Kebutuhan menjalankan |
| --- | --- | --- |
| [Hardcoded](frontend/index-hardcoded.html) | `frontend/js/product-data.js` | Server lokal untuk HTML dan ES Modules; **tanpa database atau API** |
| [API-driven](frontend/index-api-product.html) | `GET /api/products/:id` → Express → PostgreSQL | Docker/PostgreSQL dan backend Express |

> **Catatan:** Ini adalah proyek pembelajaran, bukan toko resmi Master & Dynamic. Data stok yang ditampilkan merupakan simulasi untuk kebutuhan tugas, bukan inventaris komersial.

## Teknologi

- **Frontend:** HTML5, CSS3, JavaScript (ES Modules), DOM API, Fetch API, `async`/`await`.
- **Backend:** Node.js, Express 5, REST API.
- **Database:** PostgreSQL 17, Docker Compose.
- **Pengujian:** Node.js Test Runner; pengujian integrasi menggunakan PostgreSQL yang aktif.
- **Dokumentasi API:** OpenAPI 3.0 dan Swagger UI.

## Fitur

- Pilihan variasi **Black** dan **Silver** dengan pembaruan gambar dan informasi stok.
- Quantity dapat diubah lewat tombol `+`/`−` maupun diketik langsung.
- Validasi quantity: bilangan bulat positif, tidak melebihi stok yang diketahui, dan menghormati batas pesanan apabila datanya tersedia.
- **Selection summary** dan subtotal diperbarui berdasarkan pilihan valid.
- Pesan kesalahan saat input tidak valid; **Add to Cart** dinonaktifkan untuk input tersebut.
- Keranjang lokal dengan feedback setelah penambahan, jumlah item, dan subtotal keranjang. Tidak ada checkout atau penyimpanan keranjang ke database.
- Pada halaman API: **loading state**, pemeriksaan HTTP response, penanganan network/server error, timeout, dan tombol **Retry** untuk error yang dapat dicoba kembali.
- Request produk tidak digandakan saat pengguna memilih variasi, mengubah quantity, atau menambahkan item ke keranjang.

### Data simulasi

Harga produk yang digunakan untuk demonstrasi adalah **USD 750** per unit.

| Variasi | Stok yang diketahui | Batas quantity dalam satu pilihan |
| --- | ---: | ---: |
| Black | 5 | 5 |
| Silver | 10 | 10 |

`quantityPolicy.min = 1` dan `quantityPolicy.maxPerOrder = null`. Nilai `null` berarti **tidak ada batas per pesanan tambahan yang diketahui** pada dataset demo; **bukan** berarti stok tidak terbatas. Quantity tetap dibatasi oleh stok masing-masing variasi yang tersedia dalam data.

Data halaman hardcoded berada di `frontend/js/product-data.js`. Data halaman API berasal dari database yang diinisialisasi melalui `database/schema.sql` dan `database/seed.sql`. Mengubah data hardcoded **tidak otomatis mengubah PostgreSQL**.

## Menjalankan proyek

### Prasyarat

- Node.js **22 atau lebih baru** dan npm untuk backend/pengujian.
- Docker Desktop dengan Linux containers untuk halaman API-driven.
- Browser modern; Visual Studio Code dan ekstensi Live Server bersifat opsional untuk halaman hardcoded.

### A. Halaman hardcoded (tanpa Docker)

1. Buka folder proyek di VS Code.
2. Jalankan `frontend/index-hardcoded.html` melalui **Live Server** atau server HTTP lokal lain yang mendukung ES Modules.
3. Pilih variasi, ubah quantity, periksa subtotal, dan gunakan Add to Cart.

**Penting:** Jangan membuka file HTML langsung melalui skema `file://`; gunakan server lokal. Halaman ini **tidak membutuhkan Express maupun PostgreSQL**.

Jika backend pada langkah B sudah berjalan, halaman ini juga tersedia di:

`http://127.0.0.1:3000/index-hardcoded.html`

### B. Halaman API-driven (Express + PostgreSQL)

Instruksi berikut menggunakan **PowerShell pada Windows 11**. Jalankan perintah dari **folder utama proyek** (lokasi `compose.yaml`).

**1. Siapkan konfigurasi privat**

```powershell
Copy-Item .env.example .env
```

Buka `.env`, lalu **ganti kedua placeholder password** (`DB_PASSWORD` dan `POSTGRES_PASSWORD`) dengan dua password pribadi yang berbeda. Jangan memasukkan password nyata ke `.env.example` atau repository.

Konfigurasi contoh menggunakan:

```dotenv
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5435
DB_NAME=mw75_tumi_day22
DB_USER=mw75_reader
POSTGRES_USER=mw75_admin
```

File `.env.example` juga memuat **placeholder** untuk kedua password. Port `5435` dipakai untuk menghindari bentrok dengan proyek PostgreSQL lain; jika port tersebut sudah terpakai di komputer reviewer, pilih port host lain pada `DB_PORT`. Jangan mengubah port PostgreSQL di dalam container (`5432`).

**2. Jalankan database**

```powershell
docker compose config --quiet
docker compose up -d db
docker compose ps
```

Tunggu sampai service `db` berstatus **`healthy`**. Database diinisialisasi dengan schema, seed, dan role aplikasi read-only pada **volume yang masih kosong**. Proyek Compose menggunakan nama `mw75_tumi_day22`, terpisah dari proyek lain.

**3. Jalankan backend**

```powershell
cd backend
npm ci
npm run dev
```

Backend berjalan pada `http://127.0.0.1:3000` dengan konfigurasi contoh. Biarkan terminal backend tetap aktif saat menggunakan halaman API-driven.

**4. Buka halaman dan endpoint**

| URL lokal | Fungsi |
| --- | --- |
| `http://127.0.0.1:3000/index-hardcoded.html` | Halaman hardcoded |
| `http://127.0.0.1:3000/index-api-product.html?id=1` | Halaman API-driven |
| `http://127.0.0.1:3000/api/health` | Memeriksa status aplikasi dan database |
| `http://127.0.0.1:3000/api/products/1` | Respons JSON produk dari PostgreSQL |
| `http://127.0.0.1:3000/api/docs/` | Swagger UI / dokumentasi API |

ID `1` adalah ID contoh untuk seed pada database baru. Jika database sudah berubah, gunakan ID produk yang benar-benar tersedia.

**Catatan database:** Script inisialisasi PostgreSQL hanya berjalan saat volume pertama kali dibuat. Mengedit `database/seed.sql` **tidak** memperbarui database yang sudah berjalan. Jangan memakai `docker compose down -v` hanya untuk menyinkronkan stok, karena perintah itu menghapus volume. Untuk database **demo lama** yang sengaja ingin disinkronkan, tersedia script opsional `database/manual/update-demo-quantity-existing-db.sql`; periksa targetnya terlebih dahulu karena script tersebut **mengubah data**. Pada setup baru dengan seed terbaru, script manual itu **tidak diperlukan**.

### Menghentikan aplikasi

- Di terminal backend, tekan `Ctrl + C`.
- Dari folder utama proyek, jalankan `docker compose stop db` jika ingin menghentikan PostgreSQL. Perintah ini **tidak menghapus volume**.

## Pengujian

Dari folder `backend`:

```powershell
npm run check
npm test
npm run test:integration
```

`test:integration` membutuhkan PostgreSQL yang aktif dan `.env` dengan kredensial akun aplikasi yang sesuai.

**Hasil verifikasi lokal (13 November 2026):**

| Pemeriksaan | Hasil |
| --- | --- |
| Syntax check JavaScript | Lulus |
| Automated tests (`npm test`) | **27 lulus, 0 gagal** |
| Integration tests (`npm run test:integration`) | **2 lulus, 0 gagal** |

Skenario browser yang telah diperiksa mencakup quantity valid dan tidak valid (`0`, `-1`, `1.5`, melebihi stok), perubahan subtotal, Add to Cart, stok Black/Silver, API loading, network error, HTTP 404, Retry, dan satu request produk ketika interaksi berlangsung. Hasil di atas merupakan **verifikasi pada lingkungan pengembangan**, bukan klaim bahwa setiap mesin akan menghasilkan hasil yang sama tanpa konfigurasi yang sesuai.

**Laporan pengujian manual:** lihat [Hasil Pengujian Day 22](docs/HASIL_PENGUJIAN_DAY22.md) untuk input/kondisi, expected result, actual result, status, serta screenshot browser yang relevan.

## Struktur proyek

```text
.
├── frontend/
│   ├── index-hardcoded.html          # Product page dengan data lokal
│   ├── index-api-product.html        # Product page dari API
│   ├── js/                           # Modul data, DOM, validasi, fetch, galeri, cart
│   ├── styles.css
│   └── assets/                      # Aset SVG fallback
├── backend/
│   ├── src/                          # Express API dan akses PostgreSQL
│   ├── test/                         # Unit dan integration tests
│   ├── openapi.json                  # Spesifikasi endpoint
│   ├── package.json
│   └── package-lock.json
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── zz_create_readonly_role.sh
│   └── manual/                       # Script opsional untuk DB demo lama
├── compose.yaml
├── .env.example
└── README.md
```

## Batasan proyek

- Keranjang hanya berada di memori browser dan akan direset saat halaman dimuat ulang. Tidak ada transaksi, checkout, pembayaran, atau penyimpanan keranjang ke database.
- Data produk pada halaman API tidak digantikan diam-diam oleh data hardcoded ketika request gagal.
- `stockQuantity: null` pada data lain berarti stok tidak diketahui; aplikasi tidak boleh menyimpulkan angka stok tertentu dari kondisi tersebut.
- Beberapa gambar produk menggunakan URL eksternal dan mungkin memerlukan akses internet; aset fallback lokal tersedia untuk konten terkait.
- Tampilan dan aset produk digunakan sebagai studi kasus pembelajaran; proyek ini tidak berafiliasi dengan penjual atau merek yang ditampilkan.

## Penggunaan AI

AI digunakan sebagai alat bantu untuk mendukung pemahaman konsep, penelusuran masalah teknis, dan peninjauan kode selama pengembangan proyek. Penggunaannya mencakup beberapa aspek berikut:

1. **Pemahaman konsep JavaScript dan DOM.** Membantu mempelajari *event handling*, penggunaan `addEventListener()`, pembaruan elemen dengan `textContent`, pengelolaan *state* sederhana, serta hubungan antara input pengguna dan perubahan tampilan pada halaman produk.

2. **Penelusuran masalah validasi dan interaksi.** Membantu menganalisis perilaku input quantity, batas pembelian berdasarkan stok, perubahan pilihan warna, perhitungan subtotal, serta pembaruan feedback dan jumlah produk pada keranjang lokal.

3. **Analisis alur data API dan penanganan error.** Membantu memahami proses *asynchronous request* dengan Fetch API, perbedaan data hardcoded dan data PostgreSQL, serta cara menelusuri kondisi loading, kegagalan koneksi, respons HTTP 404, dan mekanisme Retry.

4. **Masukan untuk *code review* dan pengujian.** Digunakan untuk meninjau keterbacaan fungsi, konsistensi alur validasi, dan kesesuaian skenario pengujian dengan kebutuhan assignment. Masukan tersebut dibandingkan dengan perilaku aplikasi dan hasil pengujian sebelum digunakan sebagai pertimbangan perbaikan.
