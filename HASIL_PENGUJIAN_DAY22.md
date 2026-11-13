# Hasil Pengujian — MW75 TUMI Day 22

**Proyek:** MW75 TUMI — Interactive Product Detail Page  
**Tugas:** Mini Project Full-Stack Day 22 — Adding Interactivity to Websites with JavaScript  
**Tanggal pengujian yang dilaporkan:** 13 November 2026  
**Lingkungan:** Windows 11, Chrome, Node.js v24.21.0, PostgreSQL 17 via Docker Compose, Express API pada `http://127.0.0.1:3000`, PostgreSQL host port `5435`  
**Jenis pengujian:** Manual browser, automated tests, dan integration tests

Dokumen ini mencatat hasil pengujian yang didukung **screenshot browser yang dikirim pengembang** dan **output terminal yang dibagikan pengembang**. Status *PASS* berarti perilaku yang dicatat sesuai dengan skenario spesifik yang diuji; ini bukan jaminan seluruh kondisi tepi telah diuji. *Actual result* tidak diisi berdasarkan perkiraan.

## A. Pengujian manual di browser

| ID | Halaman / input / kondisi | Expected result | Actual result berdasarkan bukti | Status | Bukti |
| --- | --- | --- | --- | --- | --- |
| TC-01 | Hardcoded; Black, quantity 2, klik Add to Cart | Selection subtotal `$1,500.00`; feedback sukses; cart count 2 | Subtotal `$1,500.00`, feedback `Black MW75 TUMI × 2 added to cart.` dan cart badge `2` terlihat | PASS | [Screenshot](bukti-pengujian/TC-01-qty2-cart.png) |
| TC-02 | Hardcoded; quantity 0 | Pesan validasi; Add to Cart nonaktif; subtotal `—` | Pesan `Enter a whole number greater than zero.`, tombol nonaktif, subtotal `—` | PASS (validasi) | [Screenshot](bukti-pengujian/TC-02-qty0-invalid.png) |
| TC-03 | API-driven; request `/api/products/1` sengaja diblokir di DevTools | Error koneksi; loading berhenti; tombol Retry tampil | `Unable to load product`, pesan koneksi, dan tombol Retry tampil | PASS (visual) | [Screenshot](bukti-pengujian/TC-03-network-error.png) |
| TC-04 | API-driven; blocking dimatikan, lalu Retry digunakan | Produk dimuat kembali dari API | Halaman kembali menampilkan produk, stok Black 5, subtotal `$750.00`; tindakan Retry dilaporkan dalam alur pengujian tetapi tidak terekam dalam satu screenshot | PASS (laporan + visual) | [Screenshot](bukti-pengujian/TC-04-after-retry.png) |
| TC-05 | API-driven; `?id=999` tidak ada di database | HTTP 404; `Product not found`; loading berhenti | Network menunjukkan satu request `999` dengan status 404; halaman menampilkan `Product not found` | PASS | [Screenshot](bukti-pengujian/TC-05-http404-devtools.png) |
| TC-06 | API-driven; satu load; ganti Black ke Silver, quantity 2, Add to Cart sekali | Hanya satu GET produk; subtotal `$1,500.00`; satu klik menambah 2 item ke cart | Network tetap memperlihatkan satu `GET /api/products/1` HTTP 200; Silver stok 10 dan subtotal `$1,500.00`; keranjang memperlihatkan Silver Qty 2 dan subtotal `$1,500.00` | PASS untuk alur yang diuji | [Screenshot](bukti-pengujian/TC-06-one-request-black.png), [Screenshot](bukti-pengujian/TC-06-one-request-silver-qty2.png), [Screenshot](bukti-pengujian/TC-06-one-click-cart.png) |
| TC-07 | API-driven; jaringan diperlambat saat load | Loading state terlihat sebelum data selesai dimuat | `Loading product` serta `Please wait while product information loads.` terlihat | PASS (loading visual) | [Screenshot](bukti-pengujian/TC-07-loading.png) |
| TC-08 | Input quantity `-1` | Ditolak sebagai bilangan bukan positif; Add to Cart nonaktif | `Enter a whole number greater than zero.` tampil; tombol nonaktif; subtotal `—` | PASS | [Screenshot](bukti-pengujian/TC-08-negative-1.png) |
| TC-09 | Input quantity `1.5` | Ditolak karena bukan bilangan bulat; Add to Cart nonaktif | `Enter a whole number greater than zero.` tampil; tombol nonaktif; subtotal `—` | PASS | [Screenshot](bukti-pengujian/TC-09-decimal-1_5.png) |
| TC-10 | Variasi Black, input quantity `6` ketika stok 5 | Pesan maksimum 5; Add to Cart nonaktif | `Maximum quantity is 5.` tampil; tombol nonaktif; subtotal `—` | PASS | [Screenshot](bukti-pengujian/TC-10-black-qty6.png) |
| TC-11 | Variasi Silver, input quantity `11` ketika stok 10 | Pesan maksimum 10; Add to Cart nonaktif | `Maximum quantity is 10.` tampil; tombol nonaktif; subtotal `—` | PASS | [Screenshot](bukti-pengujian/TC-11-silver-qty11.png) |
| TC-12 | API-driven; query parameter product ID tidak valid/tidak tersedia | Error validasi ID; produk tidak dimuat | `Unable to load product` dan `A canonical positive product ID is required in the URL.` tampil | PASS (tambahan) | [Screenshot](bukti-pengujian/TC-12-invalid-product-id.png) |

**Catatan terkait TC-06:** bukti menunjukkan **tidak ada request produk tambahan dan tidak terlihat penambahan ganda pada satu klik** dalam sesi tersebut. Bukti itu tidak secara otomatis membuktikan semua kemungkinan pemasangan `addEventListener` di seluruh lifecycle; pengujian otomatis melengkapi pemeriksaan ini.

**Catatan terkait TC-07:** loading text telah terbukti, namun screenshot menunjukkan tombol berlabel `ADD TO CART` masih tampak pada layar loading. Apakah tombol tersebut benar-benar dapat melakukan aksi sebelum data tersedia **belum diuji**.

## B. Hasil automated testing

Output terminal dari pengembang menunjukkan:

| Perintah (folder `backend`) | Hasil aktual yang dilaporkan | Status |
| --- | --- | --- |
| `npm.cmd run check` | Seluruh syntax check file JavaScript selesai tanpa error | PASS |
| `npm.cmd test` | 27 tests; 27 pass; 0 fail | PASS |
| `npm.cmd run test:integration` | 2 tests; 2 pass; 0 fail; PostgreSQL → Express → frontend mapping diuji | PASS |

Dua integration test yang dilaporkan mengakses PostgreSQL aktif, memverifikasi produk ID `1`, **2 variasi**, **8 gambar**, dan akun runtime read-only. Terminal output asli disampaikan oleh pengembang selama pengujian; file log terminal terpisah **belum dilampirkan** ke folder bukti ini. Jika diperlukan, pengembang dapat menyimpan output asli dari laptop saat finalisasi.

## C. Temuan dan batasan bukti

1. **Selection summary untuk input invalid:** saat quantity 0 (juga terlihat pada input invalid lain), subtotal sudah berubah menjadi `—`, tetapi ringkasan masih memperlihatkan quantity valid sebelumnya. Validasi pembelian lulus pada skenario di atas; ini merupakan **catatan konsistensi UI** yang belum diperbaiki sesuai keputusan pengerjaan.
2. **Tombol pada loading:** elemen `ADD TO CART` masih terlihat dalam screenshot loading, tetapi belum ada bukti apakah fungsinya aktif atau nonaktif pada saat data belum tersedia. Perlu verifikasi apabila ingin menutup catatan UI tersebut.
3. **Retry:** screenshot menunjukkan pemulihan tampilan dan pengguna melaporkan menguji Retry; klik pada tombol itu sendiri tidak terekam oleh gambar statis.
4. **Screenshot tidak membuktikan seluruh kombinasi aplikasi:** status PASS berlaku untuk input dan kondisi yang tercantum dalam tabel.
5. **Dependency audit:** saat `npm ci` sebelumnya muncul laporan 3 vulnerabilities (2 moderate, 1 high). Pemeriksaan dependency secara terpisah diperlukan; jangan menjalankan upgrade otomatis tanpa review dampak.

## D. Cara mereproduksi pengujian

1. Ikuti langkah setup di [`README.md`](../README.md), lalu aktifkan PostgreSQL (`docker compose up -d db`) serta Express (`cd backend; npm run dev`).
2. Uji **hardcoded** di `http://127.0.0.1:3000/index-hardcoded.html` dan **API-driven** di `http://127.0.0.1:3000/index-api-product.html?id=1`.
3. Untuk error koneksi, di Chrome DevTools → Network → Request conditions, blokir `/api/products/1`; refresh halaman, amati error, kemudian nonaktifkan blocking dan klik Retry.
4. Untuk HTTP 404, kunjungi halaman API-driven dengan `?id=999`, lalu periksa status request di tab Network.
5. Untuk loading, gunakan Network throttling (misalnya Slow 3G) dan refresh.
6. Untuk automated tests, buka terminal di folder `backend` dan jalankan `npm run check`, `npm test`, dan `npm run test:integration`.

> Bukti screenshot berasal dari sesi pemeriksaan pengembang pada lingkungan lokal, bukan demonstrasi deployment publik.
