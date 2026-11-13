# MW75 TUMI — Interactive Product Detail Page

Mini project Full Stack Web Development Day 22: pengembangan interaktivitas halaman detail produk MW75 TUMI menggunakan **HTML, CSS, dan vanilla JavaScript**, dengan halaman tambahan yang mengambil data dari REST API.

Proyek ini dikembangkan dari study case Mini Project Day 5. Tersedia **dua halaman produk** dengan tampilan dan perilaku yang konsisten, tetapi sumber data berbeda.

## Teknologi

- **Frontend:** HTML5, CSS3, JavaScript (ES Modules), DOM API, Fetch API.
- **Backend:** Node.js, Express.js, REST API.
- **Database:** PostgreSQL, Docker Compose.
- **Pengujian:** Node.js Test Runner.

## Fitur

### Halaman dan interaksi

- Galeri gambar produk dengan navigasi dan pilihan warna **Black / Silver**.
- Tombol tambah/kurang jumlah produk serta input quantity yang bisa diketik langsung.
- Validasi quantity: hanya bilangan bulat positif, mengikuti batas stok/pesanan jika datanya tersedia.
- Ringkasan warna, jumlah, dan subtotal yang berubah secara langsung.
- Pesan kesalahan untuk input tidak valid; tombol **Add to Cart** dinonaktifkan sampai input kembali benar.
- Keranjang belanja simulasi: penambahan produk, jumlah item, dan perhitungan total.

### Asynchronous JavaScript

- Halaman API mengambil informasi produk dari endpoint `GET /api/products/:id` menggunakan `fetch()` dan `async/await`.
- Status **loading**, **error**, **timeout**, dan tombol **Retry** untuk mencoba permintaan kembali.
- Halaman API tidak diam-diam mengganti data gagal dengan data hardcoded.

## Struktur proyek

```text
frontend/
  index-hardcoded.html       Halaman dengan data produk lokal
  index-api-product.html     Halaman dengan data dari API
  styles.css                 Styling dan responsive layout
  js/                        Modul interaksi, data, validasi, galeri, keranjang, API
  assets/                    Gambar fallback lokal
backend/
  src/                       Express API dan koneksi PostgreSQL
  test/                      Pengujian otomatis
  openapi.json               Spesifikasi API
database/                     Schema, seed data, dan konfigurasi role database
compose.yaml                  Konfigurasi PostgreSQL Docker
.env.example                  Contoh konfigurasi environment
README.md
```

## Menjalankan proyek

### 1. Halaman hardcoded — tanpa backend / Docker

1. Buka folder proyek di **Visual Studio Code**.
2. Instal extension **Live Server** jika belum tersedia.
3. Buka `frontend/index-hardcoded.html`, lalu pilih **Open with Live Server**.
4. Pilih warna, ubah quantity, cek subtotal, dan tambahkan produk ke keranjang.

Halaman ini membaca `frontend/js/product-data.js` dan **tidak memerlukan PostgreSQL maupun product API**. Buka melalui server lokal, bukan langsung sebagai `file://`, karena proyek menggunakan ES Modules.

### 2. Halaman API — Express + PostgreSQL

**Prasyarat:** Node.js **22.19+**, npm, dan Docker Desktop (Linux containers).

Dari terminal PowerShell pada folder utama proyek:

```powershell
Copy-Item .env.example .env
```

Buka `.env`, lalu ganti **kedua placeholder password** dengan password yang berbeda dan bersifat privat.

Masih di folder utama proyek:

```powershell
docker compose up -d db
docker compose ps
```

Tunggu sampai layanan database berstatus `healthy`. Kemudian:

```powershell
cd backend
npm ci
npm run dev
```

Buka halaman API:

`http://127.0.0.1:3000/index-api-product.html?id=1`

Endpoint yang dapat diperiksa:

- `http://127.0.0.1:3000/api/health`
- `http://127.0.0.1:3000/api/products/1`
- `http://127.0.0.1:3000/api/docs/`

`id=1` berlaku untuk seed database baru; pada database yang telah berubah, gunakan ID produk sebenarnya. Inisialisasi database hanya berjalan pada volume baru; hindari menghapus volume yang berisi data.

## Pengujian

Dari folder `backend`:

```powershell
npm run check
npm test
npm run test:integration
```

`npm run test:integration` memerlukan PostgreSQL aktif dan konfigurasi `.env` yang sesuai.

Skenario manual utama untuk **kedua halaman**:

| Skenario | Hasil yang diharapkan |
| --- | --- |
| Pilih Black/Silver | Label dan gambar mengikuti pilihan |
| Klik `+` / `−` | Quantity berubah, tidak kurang dari 1 |
| Ketik `2`, lalu `4` | Subtotal menjadi `$1,500.00` lalu `$3,000.00` |
| Ketik `0`, `-1`, `1.5`, atau `abc` | Muncul pesan error, subtotal `—`, Add to Cart nonaktif |
| Ubah input tidak valid menjadi `2` | Error hilang dan subtotal kembali diperbarui |
| Tambahkan produk ke cart | Jumlah dan total item sesuai pilihan |
| Muat halaman API saat server gagal | Muncul status error dan Retry (jika dapat dicoba ulang) |
| Jalankan Retry setelah API pulih | Data produk tampil kembali |
| Buka DevTools → Network pada halaman API | Request `/api/products/:id` berasal dari API, bukan data statis |

Pengujian batas stok numerik menggunakan **data uji terpisah**, bukan mengubah stok asli yang belum diketahui (`null`).

## Batasan

- Keranjang disimpan sementara di memori halaman dan akan reset ketika refresh.
- Tidak tersedia proses checkout, pembayaran, maupun pengiriman newsletter.
- Stok yang belum diketahui tidak dianggap sebagai stok tanpa batas.
- Gambar produk yang dimuat dari CDN eksternal memerlukan koneksi internet; SVG lokal digunakan sebagai fallback bila tersedia.

## Catatan penggunaan AI

AI digunakan sebagai alat bantu selama pengembangan proyek untuk memahami konsep DOM, event handling, dan asynchronous JavaScript; menelusuri penyebab error pada input quantity dan pemuatan data; serta melakukan review kode pada validasi jumlah, perhitungan subtotal, keranjang, dan penanganan loading/error/retry. Bantuan AI juga mencakup saran dan contoh implementasi yang diperiksa melalui pengujian proyek.
