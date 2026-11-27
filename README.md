# house-budget-site-makefun

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/khususcrypto0000-coder/house-budget-site-makefun/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/khususcrypto0000-coder/house-budget-site-makefun/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

DompetKeluarga — situs anggaran rumah tangga statis berbahasa Indonesia, dibuat dari nol tanpa library dan tanpa network request. Semua angka dalam Rupiah dengan contoh realistis keluarga Indonesia: gaji, belanja harian, listrik, air, internet, SPP sekolah anak, transport, dan lain-lain.

Fitur:

- **Beranda / Dashboard** — ringkasan pemasukan, pengeluaran, sisa uang, dan tabungan bulan berjalan, grafik pengeluaran per kategori, tagihan yang segera jatuh tempo, dan transaksi terakhir.
- **Anggaran Bulanan** — batas belanja per kategori dengan progress bar (hijau, kuning saat ≥80%, merah saat melebihi), tambah atau ubah batas anggaran.
- **Transaksi** — tambah dan hapus pemasukan/pengeluaran, filter berdasarkan kata kunci, kategori, dan jenis; data tersimpan otomatis di localStorage.
- **Tagihan & Pengingat** — daftar tagihan rutin dengan tanggal jatuh tempo, badge status (Lunas / Segera / Terlambat / Belum dibayar), tandai lunas, tambah tagihan baru.
- **Tujuan Tabungan** — goals dengan progress bar, tambah dana, dan penanda saat target tercapai.
- **Laporan** — grafik batang pengeluaran per kategori dan perbandingan pemasukan vs pengeluaran 6 bulan terakhir (canvas tulis tangan), plus tabel ringkasan bulanan dengan tingkat tabung.

Pemilih bulan di header memungkinkan melihat ringkasan bulan-bulan sebelumnya (data contoh Juni–November 2026 sudah tersedia).

## Run it

Prasyarat: Node.js 22.18 atau lebih baru. Tidak ada dependensi yang perlu diinstal.

Jalankan situs secara lokal (dari root repositori ini):

```sh
python3 -m http.server 8080 --directory app
```

Lalu buka http://localhost:8080 di browser desktop atau HP.

Membangun dossier hand-in (menyalin `app/` dan `screenshots/` ke direktori output lalu menulis `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Struktur repositori:

- `app/` — situs statis (`index.html`, `style.css`, `data.js`, `main.js`)
- `screenshots/` — 3–4 tangkapan layar JPG situs
- `vendor/makefun-frontend.ts` — pustaka dossier dari kit (tidak diubah)
- `main.ts` — program hand-in (Node stdlib only)

## License

MIT — lihat file `LICENSE`.
