# ☕ Kojay Coffee — Sistem Persediaan Bahan Baku dan Penjualan

Aplikasi web untuk membantu pengelolaan persediaan bahan baku dan pencatatan penjualan pada UMKM Kojay Coffee.

> **Capstone Project 29**  
> Universitas Terbuka — Kelompok B

## 👥 Anggota Kelompok

| Nama | NIM |
|---|---|
| Stefani Julia Hermawan | 048651358 |
| Inam Al Hukmah | 050372597 |
| Marcella Amara Hoshi | 051324377 |
| Rizka Audilla Mustofa | 051576416 |
| Sahid Ali Fauzi | 050173835 |

## ✨ Fitur Utama

- **Pemantauan Stok** — Melihat jumlah bahan baku dan status stok minimum.
- **Stok Masuk** — Mencatat penambahan bahan baku.
- **Penjualan** — Mencatat penjualan dan mengurangi stok sesuai resep.
- **Resep dan BoM** — Mengelola takaran bahan baku setiap produk.
- **Manajemen Bahan Baku** — Menambah, mengubah, dan menghapus bahan.
- **Manajemen Produk** — Menambah produk dan mengatur resep.
- **Riwayat Persediaan** — Melihat perubahan stok dan penjualan.
- **Login Berdasarkan Peran** — Memisahkan panel Kasir dan Owner/Manajer.

## 🛠️ Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | HTML5 |
| Styling | CSS3 |
| Bahasa Pemrograman | JavaScript |
| Penyimpanan Data | LocalStorage |
| Penyimpanan Sesi | SessionStorage |
| Version Control | Git dan GitHub |

## 🔐 Akun Demo

Aplikasi Kojay Coffee menyediakan dua pilihan akses:

| Peran | Cara Login | Akses |
|---|---|---|
| Kasir | Pilih tombol **Kasir** | Pemantauan stok, penjualan, dan riwayat |
| Owner/Manajer | Pilih tombol **Owner**, kemudian masukkan kode akses | Pengelolaan stok, bahan baku, resep, produk, dan riwayat |

### Kode Akses Demo

| Peran | Kode Akses |
|---|---|
| Kasir | Tidak memerlukan kode akses khusus |
| Owner/Manajer | `kopi123kopi` |

**Catatan:** Akun ini digunakan untuk demonstrasi proyek akademik. Data aplikasi disimpan di browser menggunakan LocalStorage.

### Petunjuk Login

1. Buka halaman utama aplikasi.
2. Pilih peran Kasir atau Owner/Manajer.
3. Jika memilih Owner/Manajer, masukkan kode akses yang diberikan oleh pengelola aplikasi.
4. Setelah berhasil masuk, pengguna akan diarahkan ke panel sesuai perannya.

## 📁 Struktur Project

```text
kojay-coffee/
├── index.html
├── owner.html
├── kasir.html
├── css/
│   └── style.css
├── js/
│   ├── data.js
│   ├── login.js
│   ├── owner.js
│   └── kasir.js
└── README.md
```

## 🚀 Cara Menjalankan Aplikasi

### 1. Demo Online

Aplikasi Kojay Coffee dapat diakses melalui tautan berikut:

**Live Demo:** https://stef11xd.github.io/kojay-coffee/

1. Buka tautan demo melalui browser.
2. Pilih peran Kasir atau Owner/Manajer pada halaman login.
3. Gunakan akses demo yang tercantum pada bagian Akun Demo.

### 2. Menjalankan Secara Lokal

**Prasyarat:**
- Browser modern, seperti Google Chrome atau Microsoft Edge.
- Editor kode, seperti Visual Studio Code.
- Ekstensi Live Server atau web server lokal lainnya.

**Langkah instalasi:**

1. Buka repository Kojay Coffee di GitHub.
2. Unduh kode melalui menu **Code → Download ZIP**, lalu ekstrak file ZIP.
3. Buka folder proyek di Visual Studio Code.
4. Jalankan file `index.html` menggunakan Live Server.
5. Buka alamat lokal yang diberikan oleh Live Server.
6. Pilih peran Kasir atau Owner/Manajer pada halaman login.

### 3. Informasi Penyimpanan Data

Aplikasi menggunakan `localStorage` untuk menyimpan data aplikasi pada browser. Data tidak otomatis tersinkronisasi antara perangkat atau browser yang berbeda.

**Catatan:** Demo online digunakan untuk demonstrasi proyek akademik dan bukan untuk transaksi bisnis sungguhan.

---

**Kojay Coffee — Kelompok B**  
Universitas Terbuka | Capstone Project 29
