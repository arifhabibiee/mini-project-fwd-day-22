# Product Requirements Document MW75 TUMI Full Stack

## 1. Document Information and Version

| Atribut | Nilai |
|---|---|
| Versi | 1.0 |
| Tanggal | 11 Oktober 2026 |
| Status | Spesifikasi pengembangan; keputusan terbuka dicatat pada bagian 23 |
| Produk software | Aplikasi web product detail MW75 TUMI independen |
| Baseline | `../_ARSIP_HAPUS_SEBELUM_GITHUB/index.html`, `../_ARSIP_HAPUS_SEBELUM_GITHUB/styles.css`, `../_ARSIP_HAPUS_SEBELUM_GITHUB/script.js`, `../_ARSIP_HAPUS_SEBELUM_GITHUB/assets/` |
| Sumber kebutuhan | `../_ARSIP_HAPUS_SEBELUM_GITHUB/PRD.md`, `../_ARSIP_HAPUS_SEBELUM_GITHUB/PRD_Halaman Detail Headphone WEB_4.docx`, instruksi full-stack, dan discovery source code |
| Bahasa UI baseline | Inggris; bahasa dokumentasi Indonesia |
| Stack | HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, `pg`, PostgreSQL, Docker Compose |

Dokumen ini menjadi spesifikasi utama pengembangan full-stack dan mempertahankan kebutuhan halaman existing. Instruksi full-stack memperluas sumber data produk, tanpa menambahkan checkout atau inventory management. Aplikasi merupakan implementasi independen; Master & Dynamic dan TUMI menjadi referensi produk/desain, bukan operator atau afiliasi aplikasi.

Catatan migrasi Phase 6A: path aktif diperbarui menjadi frontend/, database/, /index-hardcoded.html dan /index-api-product.html. `/` redirect ke static page. Rancangan awal memakai public/db dan nama index.html/product-api.html; baseline historis bagian 8 tetap berlaku untuk file asli dalam `_ARSIP_HAPUS_SEBELUM_GITHUB/`. Migrasi tidak mengubah requirement produk, API, schema atau seed.

Istilah **existing** berarti ditemukan dalam source, bukan telah lulus pengujian. **Required** berarti harus dibangun/diverifikasi untuk scope ini. **Optional** berarti tidak menghambat Definition of Done. ID `FR`, `NFR`, `SEC`, dan `AC` dalam dokumen ini memiliki namespace baru; referensi PRD lama ditulis sebagai `legacy FR` atau `legacy AC`.

## 2. Product Overview

Aplikasi menyediakan dua product detail page dengan pengalaman visual dan interaksi yang konsisten:

1. `/index-hardcoded.html`: static page, informasi produk lokal dalam HTML/JavaScript, tidak memerlukan product API atau database.
2. `/index-api-product.html?id=1`: dynamic page, informasi produk dari `GET /api/products/1`, yang membaca PostgreSQL. Nilai `1` adalah ID internal proyek yang diusulkan untuk seed, bukan identifier resmi brand.

Kedua halaman mempertahankan gallery, pilihan warna, quantity, cart demonstrasi, highlights, purchase reassurance, storytelling, Tech Specs, In The Box, support, dan global UI. Halaman dinamis hanya boleh merender informasi produk setelah menerima dan memvalidasi response API. Global navigation, search suggestions global, country list, footer, disclosure independen, dan generic loading/error copy boleh statis.

Data acuan yang tersedia: MW75 TUMI; kategori Noise-Cancelling Wireless Headphones; harga USD 750.00; warna Black/Silver. Harga dan spesifikasi merupakan nilai sumber proyek, bukan klaim verifikasi terhadap katalog terkini. Angka inventory tidak tersedia.

## 3. Problem Statement

Frontend existing menggabungkan konten produk statis, model produk parsial, state, dan logic DOM. Nama, harga, warna, serta media tersebar pada HTML, JavaScript, dan CSS sehingga perubahan data dapat menghasilkan tampilan yang bertentangan. Belum ada kontrak API, database, atau prosedur setup full-stack.

Pengembangan harus mengubah cara penyediaan data tanpa merusak baseline desain. Halaman dinamis harus tetap dapat dipahami ketika API gagal, data tidak valid, atau produk tidak purchasable. Tidak boleh menyamarkan kegagalan API dengan produk hardcoded.

## 4. Product Goals and Success Criteria

| Goal | Kriteria keberhasilan terukur |
|---|---|
| Identitas produk jelas | Nama, subtitle, harga/currency, warna, availability, quantity, dan CTA konsisten dengan sumber halaman |
| Dua sumber data | Static page tidak memanggil product API; dynamic page berubah setelah perubahan DB dan reload |
| Interaksi konsisten | Pergantian warna/gambar, quantity, protection, dan cart memakai state terbaru tanpa uncaught error |
| Setup dapat diulang | Database kosong dapat disiapkan memakai schema/seed dan Node host tanpa instalasi manual data |
| Pengalaman responsif dan accessible | Alur utama dapat dijalankan pada viewport dan keyboard matrix bagian 19 |
| Batas scope jujur | Cart dan newsletter tidak mengklaim transaksi atau subscription server yang belum ada |

Keberhasilan ditentukan oleh acceptance criteria, bukan target konversi, trafik, atau metrik bisnis yang belum tersedia.

## 5. Target Users

- Calon pembeli yang membandingkan tampilan Black/Silver dan memahami fitur produk.
- Pengguna yang meninjau spesifikasi audio, battery, konektivitas, dan isi paket.
- Traveler yang mengevaluasi portability dan konteks kolaborasi TUMI.
- Pengguna keyboard atau assistive technology yang memerlukan kontrol dan state yang dapat dikenali.
- Developer yang membutuhkan demonstrasi static dan database-backed page dalam satu aplikasi.

## 6. Scope and Non Goals

### Required scope

- Mempertahankan static page dan menyediakan dynamic page.
- REST API read-only untuk satu produk berdasarkan ID, dengan desain yang mendukung beberapa record.
- Relational schema, seed SQL, konfigurasi environment, dan Compose PostgreSQL.
- Shared styling dan UI behavior; perbaikan correctness/accessibility baseline.
- Local cart demonstrasi, protection state, search interface, country selection UI, newsletter validation, dan tautan pendukung.
- Dokumentasi setup serta hasil verifikasi requirement.

### Non goals

Checkout, payment, tax/shipping calculation, fulfillment, order backend, authentication, CMS, inventory administration, stock reservation, catalog/search engine, recommendations, ratings, currency conversion, serta implementasi situs support/brand eksternal tidak termasuk scope. `GET` produk tidak menjamin stock saat transaksi.

### Optional enhancements

Cart persistence melalui local storage, currency conversion, backend newsletter, dan URL synchronization saat warna berubah memerlukan scope terpisah. Tanpa persistence, reload mereset cart. Tidak perlu frontend framework, ORM, microservice, atau layer service yang hanya meneruskan satu query.

## 7. User Stories

| ID | User story | Requirements |
|---|---|---|
| US-01 | Saya ingin mengenali nama, kategori, harga, dan availability produk | FR-03, FR-04 |
| US-02 | Saya ingin menavigasi foto dan membandingkan Black/Silver | FR-05, FR-06 |
| US-03 | Saya ingin memilih quantity dan menambahkan variant aktif ke cart demonstrasi | FR-07, FR-08, FR-09 |
| US-04 | Saya ingin memahami fitur, material, dan spesifikasi | FR-10, FR-12 |
| US-05 | Saya ingin membaca shipping/returns/protection dan konteks kolaborasi | FR-11, FR-12 |
| US-06 | Saya ingin mengetahui isi paket dan membuka support | FR-13, FR-14 |
| US-07 | Saya ingin memakai menu, search interface, country selector, dan footer | FR-15, FR-16, FR-17 |
| US-08 | Saya ingin melihat feedback yang jelas ketika data gagal atau tidak tersedia | FR-19, FR-20, FR-24 |
| US-09 | Saya ingin menjalankan interaksi dengan keyboard pada desktop/mobile | FR-18, NFR-02 |
| US-10 | Saya ingin membuktikan halaman dinamis menggunakan database | FR-02, FR-21, FR-22, FR-23 |

## 8. Existing Frontend Baseline

| File | Kondisi ditemukan |
|---|---|
| `index.html` | Struktur lengkap satu PDP; data editorial, harga, kategori, swatches, specs, tujuh item paket, header/footer, drawer/modal hardcoded |
| `styles.css` | Grid desktop, sticky header/product info, breakpoint 1100/820/520 px, remote backgrounds, styling gallery dan overlays |
| `script.js` | IIFE; product object nama/harga/dua variant/empat gambar per variant; state lokal; rendering dan handlers |
| `assets/` | Enam SVG ilustrasi fallback untuk Black, Silver, accessory, storytelling gelap/terang, support; bukan foto lokal terverifikasi |
| PRD lama | 25 functional requirements dan 26 acceptance criteria untuk frontend; tidak menetapkan stock numerik |

Existing code membaca `?color=silver`, tetapi tidak memetakan `?variant=45871965307072`. Kedua variant memiliki `purchasable: true` hardcoded; availability aktual belum terverifikasi. Quantity dimulai dari 1, gallery berputar, warna baru mereset image index tetapi mempertahankan quantity. Cart menggabungkan warna dan protection, menghitung subtotal, lalu membuka drawer. Semua state tersebut hilang saat reload.

Search hanya menyediakan input/clear/suggestions; country hanya mengganti label; newsletter memvalidasi lalu menampilkan sukses tanpa request. Tidak ada package manifest, server, SQL, Compose, atau test suite yang ditemukan pada discovery.

Perbaikan required sebelum DoD: deklarasi DOM `cartButton` eksplisit; `aria-expanded` menu sesuai kondisi terbuka; cegah timer gallery memakai variant lama bersama index baru; drawer tertutup tidak menerima fokus; focus trap dan pemulihan fokus; country selector tetap dapat diakses pada mobile; visible focus checkbox/input; data API tidak diinterpolasi sebagai HTML mentah. Temuan ini berasal dari source inspection dan belum dianggap browser-tested.

## 9. Functional Requirements

| ID | Requirement required | AC |
|---|---|---|
| FR-01 | Pertahankan `index-hardcoded.html` sebagai static page yang berfungsi tanpa product API/DB | AC-01 |
| FR-02 | Sediakan `index-api-product.html` memakai API untuk seluruh informasi spesifik produk, tanpa embedded/hardcoded product fallback | AC-02 |
| FR-03 | Tampilkan nama, subtitle, harga dan currency dari sumber halaman; initial reference USD 750.00 | AC-03 |
| FR-04 | Tampilkan availability per variant; CTA disabled kecuali available; stock unknown ditampilkan sebagai informasi yang belum diketahui | AC-04 |
| FR-05 | Gallery memiliki thumbnail, Previous/Next, index, alt text, aspect ratio terjaga, fallback media, dan urutan per variant | AC-05 |
| FR-06 | Black/Silver single-select; default Black; variant reference Black dan `color` URL didukung sesuai bagian 15; tidak ada size option | AC-06 |
| FR-07 | Quantity berupa positive safe integer, awal/minimum 1; batas mengikuti policy dan stock yang diketahui | AC-07 |
| FR-08 | Add to Cart demonstrasi memakai product/variant ID, quantity, dan protection terbaru; guard availability dan cumulative bound sebelum mutasi | AC-08 |
| FR-09 | Protection checkbox tetap tersedia, tidak mengubah variant/quantity; statusnya terlihat pada cart tanpa biaya rekaan | AC-09 |
| FR-10 | Pertahankan enam feature highlights beserta copy sumber | AC-10 |
| FR-11 | Pertahankan Free Shipping, Free Returns, dan Product Protection dengan copy sumber | AC-11 |
| FR-12 | Pertahankan dua storytelling, link MW75/TUMI, dan seluruh kelompok Tech Specs dengan accordion | AC-12 |
| FR-13 | Pertahankan tujuh item In The Box dengan label dan media yang sesuai sumber | AC-13 |
| FR-14 | Pertahankan support section, visual dan Support Center CTA | AC-14 |
| FR-15 | Pertahankan announcement, header, primary navigation, account link dan cart control; tampilkan identitas independen | AC-15 |
| FR-16 | Pertahankan search input/clear/suggestions/support dan country list/active state; country tidak mengubah currency produk | AC-16 |
| FR-17 | Pertahankan newsletter validation, footer Help & Info/About/Gifting/legal; feedback newsletter jujur mengenai mode demonstrasi | AC-17 |
| FR-18 | Drawer/modal dapat dibuka, ditutup, ditangani Escape; focus/ARIA aman dan kontrol mobile tersedia | AC-18 |
| FR-19 | Loading/refreshing menonaktifkan purchase controls dan tidak menampilkan placeholder sebagai produk valid | AC-19 |
| FR-20 | Bedakan invalid ID, not-found, network/server error, unavailable variant, dan invalid payload; retry tersedia ketika relevan | AC-20 |
| FR-21 | `GET /api/products/:id` memenuhi kontrak bagian 12 dan membaca PostgreSQL | AC-21 |
| FR-22 | Schema/seed memenuhi model bagian 13, relasi/constraints, dan provenance data | AC-22 |
| FR-23 | Node host dan PostgreSQL Compose dapat disiapkan dari lingkungan baru; environment configuration dan same-origin serving | AC-23 |
| FR-24 | Semua update UI/cart memakai state konsisten; stale request/timer tidak boleh menimpa state baru | AC-24 |

## 10. Non Functional Requirements

| ID | Requirement | AC |
|---|---|---|
| NFR-01 | Baseline spacing, hierarchy, image treatment, typography dan content order dipertahankan; tidak ada horizontal overflow pada matrix verifikasi | AC-25 |
| NFR-02 | Semantic structure, heading hierarchy, accessible names/state, alt text, visible focus, radio keyboard behavior dan focus management memadai | AC-26 |
| NFR-03 | Gallery utama tidak lazy-loaded; media bawah fold lazy-loaded bila berupa img; gunakan dimensi/aspect ratio terencana, ukuran media sesuai tampilan, hindari rebuild/load berulang yang tidak perlu | AC-27 |
| NFR-04 | Data source, rendering/state produk dan global UI dipisahkan; tidak ada ORM/framework, database response tidak disisipkan menjadi executable markup | AC-28 |
| NFR-05 | Requests memiliki timeout, error handling dan recovery; tidak ada uncaught error pada alur yang diverifikasi | AC-29 |

Tidak ditetapkan target latency atau traffic kapasitas tanpa pengukuran awal. Ukur load/layout secara manual atau browser tooling dan catat masalah nyata. Animasi menghormati `prefers-reduced-motion`.

## 11. User Flows and System Data Flow

### Static purchase demonstration

Load data lokal → pilih Black → navigasi gallery → pilih Silver → atur quantity → pilih protection bila diperlukan → Add to Cart → cart count/subtotal dan feedback diperbarui. State tidak memanggil product API.

### Dynamic purchase demonstration

Parse ID → loading → GET same-origin → Express validasi ID → `pg` query parameterized → database rows → API mapping/validation → frontend payload validation → default variant → render produk → interaksi shared → local cart.

Jika suatu langkah gagal, tampilkan error yang sesuai dan jangan aktifkan pembelian. Retry melakukan GET baru, bukan mengisi data dari static page. Unknown/unavailable variant tetap menampilkan informasi produk dan gallery dengan CTA disabled.

### Research dan global UI

Scroll highlights/reassurance → storytelling → accordion specs → In The Box → support. Menu/search/country/modal tidak mengubah selected product, variant, gallery atau quantity. Tautan eksternal mengikuti URL sumber; tidak menyiratkan cart lokal akan dikirim ke situs brand.

## 12. REST API Specification

### Endpoint dan request

`GET /api/products/:id`, tanpa body/authentication untuk public read-only data. `id` adalah integer desimal positif canonical, regex `^[1-9][0-9]*$`, maksimum 2147483647 agar sesuai PostgreSQL `INTEGER`. Tolak whitespace, decimal, sign, scientific notation, leading zero dan overflow; jangan gunakan permissive `parseInt` saja. Query parameter variant/color adalah urusan halaman, bukan endpoint ini. Method lain untuk resource yang sama menghasilkan `405` dengan `Allow: GET` (Express dapat mendukung HEAD sebagai metadata GET).

### HTTP responses

| Status | Code | Kondisi |
|---|---|---|
| 200 | — | Produk ditemukan dan payload valid, termasuk semua variant unavailable/unknown |
| 400 | INVALID_PRODUCT_ID | ID path invalid |
| 404 | PRODUCT_NOT_FOUND | ID valid tidak memiliki record |
| 404 | ROUTE_NOT_FOUND | Route API tidak tersedia |
| 405 | METHOD_NOT_ALLOWED | Unsupported method |
| 503 | DATABASE_UNAVAILABLE | Koneksi/query DB timeout atau DB unavailable |
| 500 | INVALID_PRODUCT_DATA | Record/JSONB tidak memenuhi kontrak sehingga tidak boleh dikirim sebagai success |
| 500 | INTERNAL_ERROR | Kegagalan internal lain |

Semua API response memiliki `Content-Type: application/json`. Error envelope:

```json
{"error":{"code":"PRODUCT_NOT_FOUND","message":"Produk tidak ditemukan."}}
```

Message aman untuk pengguna; frontend mengambil code untuk menentukan UI. Stack trace, credentials, query, dan detail driver hanya masuk log server yang telah disaring. Availability unknown bukan HTTP error; stock null bukan not-found.

### Product JSON schema

Success envelope adalah `{ "data": Product }`. Semua field pada tabel wajib hadir kecuali dinyatakan nullable. Tidak ada field HTML executable. Array memiliki urutan deterministik.

| Field | Tipe dan aturan |
|---|---|
| `id` | integer 1..2147483647 |
| `slug` | nonempty string, internal stable identifier |
| `name`, `subtitle`, `description` | nonempty plain text string |
| `priceMinor` | integer >=0, <=2147483647, USD cents untuk seed |
| `currency` | `USD` untuk scope awal; currency engine di luar scope |
| `defaultVariantId` | integer yang terdapat pada `variants` |
| `quantityPolicy.min` | integer, tepat 1 dalam scope ini |
| `quantityPolicy.maxPerOrder` | positive integer atau null; batas bisnis diketahui atau belum ditetapkan |
| `variants` | array nonempty; seed memiliki Black dan Silver |
| `variants[].id`, `.colorCode`, `.label` | positive integer ID, key `black`/`silver`, plain text label |
| `variants[].referenceVariantId` | nullable string; Black `45871965307072` berasal dari PRD, Silver null karena belum tersedia |
| `variants[].availability` | enum `available`, `unavailable`, `unknown` |
| `variants[].purchasable` | boolean derived: true hanya ketika availability available dan stock null atau >0 |
| `variants[].stockQuantity` | integer >=0 atau null; null berarti tidak diketahui |
| `variants[].images` | nonempty ordered array Image; seed empat foto per variant dari source |
| `content` | object editorial tervalidasi sesuai kontrak di bawah |

Image: `{id, url, alt, position, fallbackUrl}`. `id` positive integer, `position` nonnegative integer unik per variant, `url` nonempty URL/path aman, `alt` nonempty plain text, `fallbackUrl` nullable URL/path aman. Fallback adalah media generik/ilustrasi yang dipasok API; tidak mengganti metadata produk saat API gagal.

`content` memuat:

- `eyebrow`: string.
- `features`: enam `{title, text, iconKey}`; iconKey berasal dari allowlist icon renderer generik.
- `benefits`: tiga `{title, text}`.
- `protection`: `{title, note}` tanpa harga/coverage rekaan.
- `stories`: dua `{eyebrow, title, paragraphs: string[], media: Media, links: Link[]}`; layout gelap/terang ditentukan urutan generic component, bukan copy produk hardcoded.
- `specGroups`: tiga `{title, rows: [{label, value}]}` nonempty.
- `boxItems`: tujuh `{label, media: Media}`.
- `support`: `{eyebrow, title, text, media: Media, link: Link}`.

Media: `{url, alt, fallbackUrl}` dengan validasi sama seperti Image kecuali ID/position. Link: `{label, url}` plain text label dan URL aman. Fields struktur dan jumlah di atas berlaku untuk dataset MW75 TUMI dalam scope ini; bukan klaim kontrak katalog generik. Validasi frontend/server harus memeriksa nested fields, ID uniqueness, referensi default variant, image count, enum, safe integers, nonempty strings, URL dan stock/purchasable consistency. `available` dengan stock 0 dianggap data kontradiktif dan menghasilkan INVALID_PRODUCT_DATA.

### Contoh mapping response

Contoh parsial berikut menjelaskan mapping, bukan payload lengkap atau stock resmi:

```json
{
  "data": {
    "id": 1,
    "slug": "mw75-tumi",
    "name": "MW75 TUMI",
    "subtitle": "Noise-Cancelling Wireless Headphones",
    "priceMinor": 75000,
    "currency": "USD",
    "defaultVariantId": 1,
    "quantityPolicy": {"min": 1, "maxPerOrder": null},
    "variants": [
      {"id": 1, "colorCode": "black", "label": "Black", "referenceVariantId": "45871965307072", "availability": "unknown", "purchasable": false, "stockQuantity": null}
    ]
  }
}
```

Implementasi response lengkap wajib menambahkan description, Silver, images dan content. ID internal contoh adalah keputusan proyek; seed menetapkan hubungan tersebut secara eksplisit.

## 13. Database Design

### Relational model

| Table | Kolom dan constraints |
|---|---|
| `products` | `id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY`; `slug TEXT NOT NULL UNIQUE`; `name`, `subtitle`, `description TEXT NOT NULL`; `price_minor INTEGER NOT NULL CHECK >=0`; `currency TEXT NOT NULL CHECK = 'USD'`; `min_quantity INTEGER NOT NULL DEFAULT 1 CHECK =1`; `max_per_order INTEGER NULL CHECK >=min_quantity`; `content JSONB NOT NULL CHECK jsonb_typeof(content)='object'` |
| `product_variants` | `id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY`; `product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE`; `color_code`, `label TEXT NOT NULL`; `reference_variant_id TEXT NULL UNIQUE`; `availability TEXT NOT NULL DEFAULT 'unknown' CHECK IN ('available','unavailable','unknown')`; `stock_quantity INTEGER NULL CHECK >=0`; `is_default BOOLEAN NOT NULL DEFAULT false`; `position INTEGER NOT NULL CHECK >=0`; UNIQUE(product_id,color_code), UNIQUE(product_id,position) |
| `product_images` | `id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY`; `variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE`; `url`, `alt TEXT NOT NULL`; `fallback_url TEXT NULL`; `position INTEGER NOT NULL CHECK >=0`; UNIQUE(variant_id,position) |

Tambahkan CHECK untuk nonblank required text serta larangan `availability='available' AND stock_quantity=0`. Primary keys diperiksa positif. Partial unique index pada `product_variants(product_id) WHERE is_default` membatasi satu default; seed/API validation memastikan tepat satu default, minimal satu variant, serta gambar setiap variant. Index `product_images(variant_id,position)` disediakan oleh UNIQUE; UNIQUE variant berawalan product_id membantu lookup product. Jangan menyimpan `purchasable` terpisah karena merupakan derived field.

Hubungan: product 1:N variants; variant 1:N images. Default variant diambil dari flag `is_default`, bukan hardcoded Black dalam dynamic renderer. Tidak diperlukan FK circular pada products. Seluruh images gallery melekat pada variant; media editorial disimpan dalam content JSONB.

### JSONB decision

Gunakan satu JSONB `content` untuk features, benefits, protection copy, stories, specGroups, boxItems dan support sesuai bentuk bagian 12. Konten dibaca bersama produk, tidak membutuhkan filter/query lintas atribut editorial, dan tidak memiliki CRUD terpisah. Ini menghindari banyak tabel untuk satu halaman. JSONB bukan alasan melewati validation: nested structure diperiksa oleh API dan seed verification. Gunakan text/array plain data; tidak menyimpan HTML mentah.

### Seed dan data provenance

- Seed menggunakan harga `75000` cents, USD, Black/Silver, copy dan URL existing dari HTML/JS/CSS/PRD. Tidak menambahkan size atau variant baru.
- `stock_quantity=NULL` untuk kedua variant. `max_per_order=NULL` sampai policy disetujui; null tidak berarti persediaan tak terbatas.
- Seed default availability `unknown` untuk kedua variant karena hardcoded true pada frontend belum merupakan sumber availability terverifikasi. Jika availability demonstrasi disetujui, gunakan `available` dengan stock tetap null dan tandai provenance sebagai konfigurasi demonstrasi, bukan kondisi commerce resmi. Static baseline true tetap didokumentasikan sebagai demonstrasi lokal.
- Variant Black diberi default dan reference ID PRD; reference ID Silver tetap null. Internal IDs 1/2 adalah milik proyek.
- URL media existing dipertahankan sebagai data sumber; file aksesori yang menyebut kolaborasi lain membutuhkan visual review sebelum release. SVG fallback tidak diklaim foto akurat produk.
- Schema dan seed dijalankan terpisah, seed dalam transaction dan dapat diulang tanpa duplicate records menggunakan stable unique keys. Seed eksplisit ID wajib menyesuaikan identity sequence sesudah insert. Tidak boleh drop database atau menimpa perubahan data pengguna diam-diam saat app startup.

Mapping: products.price_minor → priceMinor; min_quantity/max_per_order → quantityPolicy; variants.is_default → defaultVariantId; variants rows → variants dengan derived purchasable; images diurutkan position → images; content JSONB → content. Description berasal products.description, bukan string renderer. Query rows dibaca secara konsisten menggunakan satu statement dengan aggregation/subqueries atau read transaction snapshot; jangan membuat join menghasilkan image duplicates.

### Konten yang wajib dipertahankan pada seed

| Kelompok | Nilai sumber yang harus dipertahankan |
|---|---|
| Highlights | Adaptive ANC; anodized aluminum, tempered glass & lambskin leather; 40mm beryllium drivers; 32 hours listening; Bluetooth 5.1; 4 beamforming microphones |
| Benefits | Free US ground shipping pada order USD 99 atau lebih; return 14 hari; manufacturer warranty untuk manufacturing defects/issues |
| Materials and Design | Lambskin headband/ear pads dan anodized aluminum controls; 160.75 × 197.83 × 83.57 mm; 338 g; Over-Ear; replaceable magnetic lambskin-wrapped memory foam |
| Sound and Features | 40mm beryllium; 32 Ohms; 4-microphone talk solution dengan wind protection; 4-microphone ANC; native voice assistant compatibility |
| Connectivity and Charging | Up to 32 hours atau 28 dengan ANC; Bluetooth 5.1, 100 ft/30 m, AAC/aptX Adaptive 24-bit/48 kHz/SBC; USB-C digital hingga 24-bit/96 kHz pada supported devices; USB-C to 3.5mm analog; internal antenna |
| In The Box | Headphones; USB-C to USB-C charging cable; USB-C to 3.5mm audio cable; USB-C to USB-A adapter; 3.5mm to 1/4 inch adapter; flight adapter; hard shell travel case |
| Stories/support | Copy kolaborasi TUMI 19 Degree, MW75 description, MW75 dan TUMI collaboration links, Support Center copy/link sesuai source |

Tidak memperbarui klaim produk/kebijakan berdasarkan asumsi. Verifikasi konten terhadap referensi eksternal sebelum release menjadi pekerjaan terpisah yang harus dilaporkan hasilnya.

## 14. Frontend Backend Integration

Static entry membaca local product data dan dapat mempertahankan editorial HTML existing. Shared renderer/interaction menerima model konsisten; static adapter tidak perlu request produk. Dynamic entry tidak mengimpor static product data. Dynamic HTML berisi struktur generik dan placeholder kosong, bukan nama/harga/specs MW75 tersembunyi. Product-specific background URLs dalam CSS existing harus dibatasi static page atau dipindahkan menjadi source data; dynamic backgrounds selalu diisi dari API.

Dynamic loader melakukan GET relatif `/api/products/${id}` dengan timeout 10 detik menggunakan AbortController; cek status, Content-Type, JSON parse, lalu payload contract. Timeout/query DB lebih pendek dari timeout client (usulan connection 3 detik, statement 5 detik) agar error server dapat diterima. Retry manual membatalkan request lama; gunakan request token untuk mengabaikan response yang sudah stale. Tidak melakukan automatic retry loop.

Seluruh product-specific UI, termasuk cart title/price/images, berasal dari validated model API. Generic label seperti Color, Quantity dan Retry boleh lokal. Media error mengganti media menggunakan fallback dari model; kegagalan media tidak memicu penggunaan static product object. Jika media dan fallback gagal, tampilkan generic image unavailable tanpa retry tak terbatas.

Express menggunakan `express.static` hanya pada directory `frontend`, bukan project root. Frontend/API satu origin sehingga CORS middleware tidak diperlukan. Database password tidak pernah dikirim ke browser. Global links tetap sesuai sumber, dengan disclosure bahwa layanan eksternal bukan bagian transaksi lokal.

## 15. State Management and UI Interactions

State produk minimal: `loadStatus`, `product`, `selectedVariantId`, `imageIndex`, `quantity`, `protection`, `cart`, `error`. UI global memiliki active overlay, selected country dan previous focused element; tidak mengubah product state.

- Initial dynamic ID wajib dari query `id`; missing/invalid ID menghasilkan error sebelum fetch. Static page tidak memerlukan ID.
- Default warna mengikuti defaultVariantId (seed Black). `variant=45871965307072` memetakan reference ID Black; `color=silver` memilih Silver. Prioritas: recognized `variant`, recognized `color`, lalu default. Unknown selection tidak mengganti product ID dan kembali ke default dengan feedback. Identifier yang tidak dikenal tidak boleh menyebabkan akses object undefined.
- Variant berubah: imageIndex menjadi 0, feedback cart lama dibersihkan, quantity tetap bila masih valid. Jika quantity melebihi known bound baru, clamp dengan feedback jelas. Unavailable/unknown variant tidak mereset quantity secara diam-diam dan CTA disabled.
- Gallery Previous/Next wrap dalam images variant aktif; tidak mengubah quantity/variant. Thumbnail click tidak menghilangkan keyboard focus akibat rebuild node; stale timer dibatalkan atau dihindari.
- Quantity min 1. Effective known bound adalah minimum maxPerOrder dan stockQuantity yang nonnull. Stock 0 berarti tidak dapat dibeli, bukan quantity 0. Null stock ditampilkan sebagai unknown; null bounds berarti tidak ada batas bisnis yang diketahui, bukan klaim unlimited. Tetap tolak non-safe integer/overflow sebagai batas teknis.
- CTA enabled hanya ketika data ready, variant purchasable, quantity valid. Available dengan null stock diizinkan untuk cart demonstrasi, tanpa klaim jaminan inventory. Unknown/unavailable tidak boleh menambah cart.
- Cart local: identity productId + variantId + protection. Validasi cumulative quantity semua line variant yang sama, termasuk line protection berbeda, terhadap known bound sebelum mutasi. Simpan name/label/price/currency/media dari sumber tervalidasi atau referensi model yang sama. Subtotal memakai integer minor units dan Intl.NumberFormat; reject overflow.
- Update count dan feedback sukses hanya setelah mutasi cart berhasil. Kegagalan mempertahankan pilihan/quantity. Cart memperlihatkan protection selected/not selected tanpa biaya tambahan rekaan. Belum ada remove/edit/checkout requirement.
- Overlay hanya satu aktif; open/close memperbarui ARIA, scroll lock, fokus. Escape/close/backdrop yang ditetapkan menutup overlay; modal backdrop dapat ditutup tanpa mengandalkan overlay yang tertutup lapisan modal. Closed drawer inert/hidden, background inert saat overlay modal aktif, Tab/Shift+Tab tetap di dalam, fokus kembali ke trigger valid.
- Custom radio controls mengikuti arrow keys, Home/End dan roving tabindex atau diganti native radio yang distyling. Accordion memiliki aria-expanded/aria-controls dan panel yang benar-benar hidden.
- Newsletter menampilkan hasil validasi dan keterangan demonstrasi; tidak mengklaim email telah diterima server. Country hanya mengubah active country label; harga tetap USD sampai scope conversion disetujui.

## 16. Validation and Error Handling

| Kondisi | Perilaku required |
|---|---|
| ID page/path invalid | Client memberi error; API memberi 400 bila dipanggil langsung; tidak query DB |
| ID valid tidak ada | 404 dan product not found; tidak render produk default lain |
| Network/timeout | Feedback gagal mengambil data dan Retry; controls disabled |
| DB connection/query failure | 503 safe envelope; client error state; app tetap dapat melayani static assets |
| Non-JSON/parse error/schema invalid | Invalid data state; tidak partial render sebagai produk valid |
| Required nested content hilang | INVALID_PRODUCT_DATA di server atau invalid payload di client; tidak mengisi spesifikasi dari constants |
| Availability unknown/unavailable | Produk tetap dapat diteliti, CTA disabled dan alasan jelas |
| Stock 0 / negative / noninteger | Stock 0 unavailable; negatif/noninteger ditolak constraints/validation |
| Image request gagal | Satu fallback media, kemudian generic unavailable; alt tetap sesuai metadata |
| Quantity invalid / cumulative bound exceeded | Tolak cart mutation, feedback, state sebelumnya dipertahankan |

Validasi client memberi UX; validasi server tetap wajib untuk request/DB mapping. Tidak menerima harga atau query SQL dari client. Email input hanya memakai validation UI karena tidak ada subscription endpoint.

## 17. Security and Reliability Requirements

| ID | Requirement | AC |
|---|---|---|
| SEC-01 | Semua nilai ID query menggunakan parameter `$1`; tidak interpolasi input SQL; pool punya bounded connection/query timeout dan error handlers | AC-30 |
| SEC-02 | Credentials melalui environment; actual `.env` excluded dari Git; `.env.example` hanya placeholders; root/docs/sql/Compose/package/config tidak publicly served | AC-31 |
| SEC-03 | API strings dirender memakai textContent/createElement; media/links hanya local paths berawalan `/assets/` atau HTTPS URLs yang diizinkan; larang javascript/data schemes dan inline event handlers dari data | AC-32 |
| SEC-04 | Error tidak membocorkan secrets/stack/SQL; pool dilepas pada shutdown; configuration missing gagal dengan pesan aman; tidak ada runtime destructive SQL atau DB credentials browser | AC-33 |

Gunakan DB role runtime dengan hak SELECT pada tabel produk; role setup terpisah untuk schema/seed. Compose development bind port PostgreSQL ke loopback host, bukan semua interfaces; password tidak ditulis di repository. Same-origin tidak menghapus kebutuhan output safety. Jika link memakai target blank, tambahkan rel noopener/noreferrer. Policy media HTTPS dapat mengikuti hostname sumber existing plus local assets; perlu perubahan eksplisit bila domain baru ditambahkan.

Rate limiting, authentication dan deployment production tidak diwajibkan untuk development read-only scope ini. Jangan menyatakan production-ready berdasarkan checks lokal.

## 18. Acceptance Criteria

Semua AC berikut harus memiliki hasil pass/fail dan evidence saat implementasi. Tabel ini bukan catatan hasil uji existing.

| ID | Skenario dan hasil yang harus diverifikasi | Trace |
|---|---|---|
| AC-01 | DB berhenti/product API blocked: static page tetap menampilkan konten dan primary interactions; tidak ada request product API | FR-01 |
| AC-02 | Ubah nama/harga/media/editorial di DB kemudian reload dynamic: UI mengikuti DB; API blocked tidak menampilkan produk hardcoded; audit import/HTML/CSS memastikan sumber produk lokal tidak dipakai | FR-02 |
| AC-03 | Kedua page menunjukkan nama/subtitle/harga sumber; seed 75000 diformat USD 750.00; cart subtotal sama sumber | FR-03 |
| AC-04 | available/null stock, unavailable, unknown, stock 0: label dan CTA konsisten; unknown stock tidak ditulis sebagai 0/unlimited | FR-04 |
| AC-05 | Semua empat foto setiap warna, thumbnails dan wrap arrows diuji; alt/index sesuai; network media blocked menghasilkan fallback tanpa loop | FR-05 |
| AC-06 | Default Black, URL reference Black, color Silver, invalid selection dan conflict precedence diuji; hanya satu warna aktif tanpa size options | FR-06 |
| AC-07 | Awal 1, decrement pada 1, increment, known max, null bound dan overflow diuji; tidak pernah quantity 0/negatif | FR-07 |
| AC-08 | Tambah warna/quantity terbaru, merge line dan cumulative limit termasuk protection berbeda; gagal tidak mengubah cart count/state | FR-08 |
| AC-09 | Protection toggle tidak mengubah variant/quantity; cart memperlihatkan pilihan tanpa biaya/coverage baru | FR-09 |
| AC-10 | Enam highlights sama konten sumber; dynamic values dibuktikan API | FR-10 |
| AC-11 | Ketiga benefits tampil; threshold USD 99, retur 14 hari dan warranty source dipertahankan | FR-11 |
| AC-12 | Dua stories, link MW75/TUMI dan seluruh specs bagian 13 tampil; accordion buka/tutup dan ARIA sesuai | FR-12 |
| AC-13 | Tujuh item paket tampil dengan label/media sesuai; tidak ada tambahan/rekaan | FR-13 |
| AC-14 | Support copy/media/CTA tersedia dan link sesuai source; dynamic support mengikuti API | FR-14 |
| AC-15 | Announcement/header/menu/account/cart dan disclosure tampil; navigation tujuan sesuai baseline; disclosure tidak menyiratkan afiliasi | FR-15 |
| AC-16 | Search open/input/clear/close/suggestions/support bekerja; country active state terlihat desktop/mobile dan tidak mengubah harga USD | FR-16 |
| AC-17 | Email invalid ditolak, valid memberi feedback demonstrasi; semua kelompok footer/legal tersedia | FR-17 |
| AC-18 | Menu/cart/search/country diuji open/close/Escape/backdrop; expanded/hidden/focus/scroll lock konsisten dan closed drawer tidak ditab | FR-18 |
| AC-19 | Slow request: loading diumumkan, CTA disabled, tidak ada stale nama/harga default sebagai data valid | FR-19 |
| AC-20 | Invalid ID, 404, network, 503, 500, malformed JSON dan invalid payload menghasilkan UI sesuai; Retry melakukan GET baru | FR-20 |
| AC-21 | GET valid mengembalikan seluruh contract; 400/404/405/500/503 dan JSON content type sesuai; unavailable product tetap 200 | FR-21 |
| AC-22 | Schema/seed pada database kosong berhasil; seed ulang tidak duplicate; FK/unique/check/default/image/editorial shape terverifikasi | FR-22 |
| AC-23 | Ikuti setup dari lingkungan baru: Compose hanya DB, Node host, kedua page/API satu origin; restart data tetap ada | FR-23 |
| AC-24 | Ganti warna/gambar cepat, retry berulang/stale response, buka/tutup overlays: label/gambar/quantity/availability/cart tetap sinkron | FR-24 |
| AC-25 | Viewport 320/375/768/820/1024/1440 px serta sekitar breakpoints: tanpa horizontal overflow/clipping kontrol; visual kedua page sama ketika dataset sama | NFR-01 |
| AC-26 | Tab/Shift+Tab/Enter/Space/radio arrow keys, fokus checkbox/input, heading/alt/ARIA dan screen reader smoke check berhasil | NFR-02 |
| AC-27 | Network/layout inspection: ukuran media sesuai, gallery utama segera dimuat, lazy images bawah fold, ruang media teralokasi; reduced motion dihormati | NFR-03 |
| AC-28 | Source review: static adapter terpisah dari dynamic loader, shared behavior, tidak ada framework/ORM atau product fallback tersembunyi | NFR-04 |
| AC-29 | Timeout dan recovery diuji; primary flows kedua page tanpa uncaught console error/unhandled rejection | NFR-05 |
| AC-30 | SQL metacharacters/overflow ID ditolak tanpa query; query valid memakai parameters; DB failure tidak crash server | SEC-01 |
| AC-31 | GET `/.env`, `/docs/PRD_MW75_TUMI_Fullstack.md`, `/database/schema.sql`, `/compose.yaml`, `/package.json` tidak mengungkap file; frontend responses tidak berisi credentials | SEC-02 |
| AC-32 | Test strings berisi markup dan URL javascript tidak dieksekusi; unsafe URL rejected; inline onerror data tidak dirender | SEC-03 |
| AC-33 | Missing config/DB failure: safe error dan redacted log; shutdown menutup pool; startup tidak menjalankan destructive SQL | SEC-04 |

### Retention mapping PRD lama

| Legacy requirements | Requirements baru | AC baru |
|---|---|---|
| FR-01–FR-03 announcement/header/navigation | FR-15, FR-18 | AC-15, AC-18 |
| FR-04–FR-05 search/country | FR-16, FR-18 | AC-16, AC-18 |
| FR-06 gallery | FR-05 | AC-05 |
| FR-07–FR-08 identity/price/availability | FR-03, FR-04 | AC-03, AC-04 |
| FR-09–FR-10 color/synchronization | FR-06, FR-24 | AC-06, AC-24 |
| FR-11–FR-12 quantity/cart | FR-07, FR-08 | AC-07, AC-08 |
| FR-13 protection | FR-09 | AC-09 |
| FR-14–FR-15 highlights/reassurance | FR-10, FR-11 | AC-10, AC-11 |
| FR-16–FR-18 stories/specs | FR-12 | AC-12 |
| FR-19–FR-20 box/support | FR-13, FR-14 | AC-13, AC-14 |
| FR-21–FR-22 newsletter/footer | FR-17 | AC-17 |
| FR-23–FR-24 responsive/accessibility | NFR-01, NFR-02, FR-18 | AC-25, AC-26, AC-18 |
| FR-25 state consistency | FR-24 | AC-24 |

Legacy AC-01–AC-26 tetap tercakup oleh tabel baru: initial identity/layout, Black URL, color switching, gallery, quantity, cart/availability, content sections, search/country/menu, responsive/keyboard, state/error dan footer. AC tambahan menguji API, DB, infrastructure dan security. Newsletter sukses server dan stock resmi tidak boleh disimpulkan dari legacy UI.

## 19. Testing and Verification Strategy

1. Baseline manual: catat screenshot/layout serta hasil alur existing sebelum refactoring; jangan menandai source-inspected sebagai pass browser.
2. Data/DB checks: schema/seed empty database dan rerun; invalid FK, duplicate/default, price/stock/quantity constraints; bandingkan copy/media/specs dengan sumber.
3. API integration: Node built-in test runner atau script sederhana, HTTP requests dan test database; valid/invalid/not-found/error contract, timeout, malicious input dan data mapping. Tambah dependency testing hanya bila ada kebutuhan nyata.
4. Frontend manual: static dengan API blocked, dynamic dengan DB values berbeda, same dataset visual comparison, cart cumulative bound, rapid interactions, network fail, image fail dan invalid payload.
5. Accessibility/responsive: matrix AC-25; Chrome/Edge desktop dan browser mobile yang tersedia; keyboard flow, screen reader smoke check, contrast/focus inspection. Catat browser/versi dan keterbatasan coverage; jangan mengklaim browser yang tidak diuji.
6. Security/config checks: public file isolation, parameterized queries, unsafe text/URL dan safe logs; tidak melakukan destructive test pada data pengguna.

Unavailable/available/stock fixtures untuk testing harus diberi label fixture demonstrasi dan dipisahkan dari seed produk acuan. Tidak mengubah stock source untuk menghasilkan tes sukses. Evidence dapat berupa hasil request, SQL assertions, screenshots, console/network inspection dan catatan pass/fail. Konten eksternal/visual assets belum diverifikasi pada discovery; perlu pemeriksaan sebelum release.

## 20. Proposed Project Structure

Struktur berikut mencerminkan penempatan aktif setelah Phase 6A. Rancangan awal menggunakan server/ dan tests/ di root; implementasi menempatkannya di backend/ tanpa menambah layer arsitektur.

```text
frontend/
  index-hardcoded.html        # static entry
  index-api-product.html      # dynamic entry
  styles.css
  favicon.svg
  favicon.ico
  assets/
  js/                         # shared UI/model/loader; local data static-only
backend/
  src/                        # Express/startup/config/pool/query/validation
  test/                       # unit dan read-only integration tests
  package.json
  package-lock.json
  README.md
database/
  schema.sql
  seed.sql
docs/
  PRD_MW75_TUMI_Fullstack.md
compose.yaml
.env.example
.gitignore
README.md
_ARSIP_HAPUS_SEBELUM_GITHUB/    # baseline historis; tidak diperlukan runtime
```

Baseline asli dipertahankan dalam arsip dengan nama/content utuh; entry aktif adalah frontend/index-hardcoded.html. PRD.md dan DOCX asli tetap reference documents historis dalam arsip. PRD full-stack ini tetap aktif dalam docs/. Root dan arsip tidak boleh menjadi static server. Tidak perlu repository/service/controller berlapis untuk satu endpoint.

Environment minimum: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`; Compose setup dapat memakai credentials setup terpisah. Runtime host memakai loopback dan published DB port, bukan Compose service hostname. Compose memiliki persistent named volume dan pg_isready healthcheck. Karena Node berada di host, readiness/retry bounded ditangani petunjuk setup dan pool, bukan `depends_on` app container. SQL init otomatis bila dipakai hanya bekerja pada volume baru; README wajib menyediakan prosedur schema/seed eksplisit untuk database existing tanpa reset volume.

## 21. Technical Development Milestones

| Milestone | Deliverable | Verification gate |
|---|---|---|
| M1 Baseline dan data contract | Baseline evidence, inventaris copy/media, keputusan unknown availability/quantity, kontrak final | Retention mapping dan schema/API field review, unresolved decisions dicatat |
| M2 Static/shared frontend | Isolated public assets, local adapter/shared UI, fixes gallery/DOM/ARIA/focus/mobile | AC-01, AC-03–AC-18, AC-24–AC-28 pada static |
| M3 PostgreSQL environment | Compose DB, env example, schema/seed dan setup instructions | AC-22, AC-23 bagian DB; constraints dan seed provenance |
| M4 REST API | Express host, pg pool, GET, validation/errors/public isolation | AC-21, AC-29–AC-33 API/config |
| M5 Dynamic frontend | Dynamic shell/loader, full product rendering, loading/error/retry | AC-02–AC-20, AC-24; DB edit reflected, API blocked no fallback |
| M6 Integrated verification | Clean-environment setup, parity, responsive/accessibility and test evidence | Seluruh AC; README limitations/open decisions sesuai hasil |

Milestone tidak mengasumsikan availability available. Dengan seed unknown, CTA disabled adalah hasil yang benar; test fixture available digunakan untuk memverifikasi cart success tanpa membuat klaim stock resmi.

## 22. Definition of Done

- Static/dynamic page, API dan database telah diimplementasikan sesuai kontrak dan semua required FR/NFR/SEC memiliki evidence AC pass atau keputusan scope yang disetujui secara eksplisit.
- Semua konten baseline penting dipertahankan; visual parity dibandingkan pada data sama, source correctness dicatat.
- Dynamic product data terbukti berasal DB; tidak ada hidden product fallback/local product import; error tidak menyamarkan kegagalan.
- Schema/seed reproducible, tidak mengarang inventory; known/unknown availability dan quantity semantics konsisten.
- API validation/parameterized queries/error responses dan sensitive-file isolation terverifikasi.
- Primary flow, responsive, keyboard, loading/failure/retry dan rapid state updates selesai diuji tanpa uncaught error pada coverage yang dicatat.
- README menjelaskan Node host, Compose PostgreSQL, environment, schema/seed, URL halaman, verification dan batas cart/newsletter demonstrasi.
- Disclosure independen tersedia; tidak ada klaim afiliasi atau production readiness tanpa bukti.
- Open decisions yang memengaruhi kontrak/release diselesaikan atau memiliki scope decision eksplisit; tidak diasumsikan selesai oleh dokumen ini.

## 23. Assumptions Risks and Open Questions

### Keputusan yang ditetapkan dokumen

Node berjalan pada host; Compose hanya PostgreSQL; Express same-origin; static independent dari API; dynamic seluruh informasi produk dari API; cart hanya demonstrasi lokal; stock unknown null; no size; relational core dengan JSONB editorial; public directory terisolasi; unknown availability fail closed. Usulan ID internal 1/2 dan quantity policy dapat diubah sebelum schema final selama kontrak/seed/test konsisten.

### Open questions

| ID | Keputusan yang perlu dikonfirmasi | Default aman sementara / dampak |
|---|---|---|
| OQ-01 | Apakah kedua variant memakai availability demonstrasi available, atau sumber availability baru tersedia? | Seed unknown, CTA disabled; hardcoded baseline true tidak dianggap fakta commerce |
| OQ-02 | Apakah ada maxPerOrder atau stock numerik yang dapat dipertanggungjawabkan? | Keduanya null; tidak mengarang batas/inventory; cart tidak menjamin stock |
| OQ-03 | Apakah URL dan foto aksesori existing boleh digunakan dan sudah cocok MW75 TUMI? | Pertahankan sebagai sumber sementara, lakukan asset review sebelum release; fallback adalah ilustrasi |
| OQ-04 | Copy/posisi disclosure independen dan penggunaan alamat/copyright brand pada footer | Disclaimer terlihat; footer structure tetap, alamat/copyright tidak menyatakan operator proyek berada di alamat brand |
| OQ-05 | Apakah diperlukan persistent cart, newsletter service, atau currency conversion? | Tidak termasuk required scope; jangan membuat service tambahan tanpa keputusan |
| OQ-06 | Apakah browser/mobile coverage dan internal ID usulan diterima? | Matrix bagian 18/19 dan ID 1/2 menjadi rencana; laporkan coverage aktual dan revisi konsisten bila berubah |

### Risks dan mitigasi

- Remote assets berubah/gagal: fallback media, alt text dan verifikasi URL; tidak menyembunyikan API failure.
- Model lokal/API drift: shared contract dan parity check pada dataset sama; static data tetap independent.
- Mixed content source: audit HTML/CSS/import dynamic agar tidak ada copy/media produk hardcoded tersisa.
- Unknown availability berbeda dari baseline available: jelaskan provenance dan gunakan fixture demonstrasi untuk testing; tidak menyamakan DB seed dengan inventory resmi.
- JSONB malformed: validation server/client dan invalid-data response; jangan partial render dengan defaults produk.
- Refactoring focus/timer mengubah UX: baseline evidence, rapid-interaction dan keyboard regression.
- Docker init hanya volume baru: explicit SQL setup dan rerun-safe seed; jangan reset volume otomatis.
- PRD asli mengasumsikan global commerce services: aplikasi independen tidak memiliki layanan tersebut; entry point/demo behavior dijelaskan tanpa klaim integrasi brand.

Dokumen ini menetapkan kebutuhan dan rencana verifikasi. Belum ada backend, database, atau hasil pengujian implementasi full-stack yang dinyatakan selesai.
