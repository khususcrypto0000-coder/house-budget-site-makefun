// DompetKeluarga — data contoh realistis rumah tangga Indonesia.
// Semua angka dalam Rupiah. Data ini hanya dipakai saat pertama kali
// aplikasi dibuka; setelah itu semua perubahan tersimpan di localStorage.
(function () {
  'use strict';

  var CATEGORIES = [
    'Belanja Harian', 'Makan di Luar', 'Listrik & Air', 'Internet & HP',
    'Transport', 'Sekolah Anak', 'Kesehatan', 'Hiburan', 'Pakaian',
    'Rumah Tangga', 'Lainnya'
  ];

  // Anggaran bulanan per kategori (November 2026).
  var BUDGETS = [
    { category: 'Belanja Harian', limit: 2400000 },
    { category: 'Makan di Luar', limit: 600000 },
    { category: 'Listrik & Air', limit: 650000 },
    { category: 'Internet & HP', limit: 450000 },
    { category: 'Transport', limit: 800000 },
    { category: 'Sekolah Anak', limit: 1200000 },
    { category: 'Kesehatan', limit: 500000 },
    { category: 'Hiburan', limit: 400000 },
    { category: 'Pakaian', limit: 300000 },
    { category: 'Rumah Tangga', limit: 500000 }
  ];

  var BILLS = [
    { id: 'b1', name: 'Listrik PLN', amount: 425000, dueDay: 20, paid: true },
    { id: 'b2', name: 'Air PDAM', amount: 185000, dueDay: 15, paid: true },
    { id: 'b3', name: 'Internet IndiHome', amount: 385000, dueDay: 10, paid: true },
    { id: 'b4', name: 'Iuran RT / Keamanan', amount: 75000, dueDay: 5, paid: true },
    { id: 'b5', name: 'SPP Sekolah Pia', amount: 650000, dueDay: 10, paid: false },
    { id: 'b6', name: 'BPJS Kesehatan', amount: 105000, dueDay: 25, paid: false },
    { id: 'b7', name: 'Cicilan Motor ADV 160', amount: 1250000, dueDay: 28, paid: false },
    { id: 'b8', name: 'Langganan Streaming', amount: 65000, dueDay: 18, paid: false }
  ];

  var GOALS = [
    { id: 'g1', name: 'Dana Darurat', target: 15000000, saved: 6250000, deadline: '2027-06-30' },
    { id: 'g2', name: 'Liburan Keluarga ke Bandung', target: 5000000, saved: 2100000, deadline: '2027-01-15' },
    { id: 'g3', name: 'Laptop Baru untuk Kerja', target: 8000000, saved: 1500000, deadline: '2027-03-31' },
    { id: 'g4', name: 'Tabungan Pendidikan Pia', target: 20000000, saved: 3400000, deadline: '2028-12-31' }
  ];

  // Transaksi: bulan berjalan (November 2026) + 5 bulan sebelumnya
  // agar grafik laporan punya isi.
  var TRANSACTIONS = [
    // --- November 2026: pemasukan ---
    { id: 't-nov-01', date: '2026-11-01', desc: 'Gaji Ayah (IT Support)', category: 'Lainnya', type: 'income', amount: 7500000 },
    { id: 't-nov-02', date: '2026-11-01', desc: 'Gaji Bunda (Guru PPPK)', category: 'Lainnya', type: 'income', amount: 4200000 },
    { id: 't-nov-03', date: '2026-11-14', desc: 'Lembur akhir pekan', category: 'Lainnya', type: 'income', amount: 450000 },
    { id: 't-nov-04', date: '2026-11-21', desc: 'Jualan Cemal-Cemil (untung minggu ini)', category: 'Lainnya', type: 'income', amount: 320000 },
    // --- November 2026: pengeluaran ---
    { id: 't-nov-05', date: '2026-11-02', desc: 'Belanja sayur & lauk di pasar', category: 'Belanja Harian', type: 'expense', amount: 185000 },
    { id: 't-nov-06', date: '2026-11-03', desc: 'Beras 10 kg + minyak goreng', category: 'Belanja Harian', type: 'expense', amount: 165000 },
    { id: 't-nov-07', date: '2026-11-05', desc: 'Bensin motor (Pertalite)', category: 'Transport', type: 'expense', amount: 50000 },
    { id: 't-nov-08', date: '2026-11-06', desc: 'Makan malam keluarga di warteg', category: 'Makan di Luar', type: 'expense', amount: 85000 },
    { id: 't-nov-09', date: '2026-11-08', desc: 'Belanja mingguan supermarket', category: 'Belanja Harian', type: 'expense', amount: 420000 },
    { id: 't-nov-10', date: '2026-11-09', desc: 'Token listrik 200 kWh', category: 'Listrik & Air', type: 'expense', amount: 300000 },
    { id: 't-nov-11', date: '2026-11-10', desc: 'SPP sekolah Pia', category: 'Sekolah Anak', type: 'expense', amount: 650000 },
    { id: 't-nov-12', date: '2026-11-11', desc: 'Paket data HP Ayah', category: 'Internet & HP', type: 'expense', amount: 75000 },
    { id: 't-nov-13', date: '2026-11-12', desc: 'Ojek online ke kantor (hujan)', category: 'Transport', type: 'expense', amount: 42000 },
    { id: 't-nov-14', date: '2026-11-13', desc: 'Vitamin & obat flu Pia', category: 'Kesehatan', type: 'expense', amount: 125000 },
    { id: 't-nov-15', date: '2026-11-15', desc: 'Belanja sayur & buah', category: 'Belanja Harian', type: 'expense', amount: 150000 },
    { id: 't-nov-16', date: '2026-11-16', desc: 'Bensin motor (Pertalite)', category: 'Transport', type: 'expense', amount: 50000 },
    { id: 't-nov-17', date: '2026-11-17', desc: 'Buku tulis & alat gambar Pia', category: 'Sekolah Anak', type: 'expense', amount: 95000 },
    { id: 't-nov-18', date: '2026-11-18', desc: 'Nonton bioskop keluarga', category: 'Hiburan', type: 'expense', amount: 180000 },
    { id: 't-nov-19', date: '2026-11-19', desc: 'Sabun, sampo, deterjen', category: 'Rumah Tangga', type: 'expense', amount: 210000 },
    { id: 't-nov-20', date: '2026-11-20', desc: 'Listrik PLN (tagihan)', category: 'Listrik & Air', type: 'expense', amount: 425000 },
    { id: 't-nov-21', date: '2026-11-21', desc: 'Belanja harian pasar', category: 'Belanja Harian', type: 'expense', amount: 175000 },
    { id: 't-nov-22', date: '2026-11-22', desc: 'Ayam geprek & es teh (makan siang)', category: 'Makan di Luar', type: 'expense', amount: 64000 },
    { id: 't-nov-23', date: '2026-11-23', desc: 'Servis ringan motor ADV 160', category: 'Transport', type: 'expense', amount: 185000 },
    { id: 't-nov-24', date: '2026-11-24', desc: 'Kaos & celana Pia', category: 'Pakaian', type: 'expense', amount: 150000 },
    { id: 't-nov-25', date: '2026-11-25', desc: 'Belanja mingguan supermarket', category: 'Belanja Harian', type: 'expense', amount: 385000 },
    { id: 't-nov-26', date: '2026-11-26', desc: 'Air PDAM (tagihan)', category: 'Listrik & Air', type: 'expense', amount: 185000 }
  ];

  var OLD_TRANSACTIONS = [
    // --- Juni 2026 ---
    { id: 't-jun-01', date: '2026-06-01', desc: 'Gaji Ayah (IT Support)', category: 'Lainnya', type: 'income', amount: 7500000 },
    { id: 't-jun-02', date: '2026-06-01', desc: 'Gaji Bunda (Guru PPPK)', category: 'Lainnya', type: 'income', amount: 4200000 },
    { id: 't-jun-03', date: '2026-06-05', desc: 'Belanja bulanan supermarket', category: 'Belanja Harian', type: 'expense', amount: 1950000 },
    { id: 't-jun-04', date: '2026-06-10', desc: 'Listrik PLN + Air PDAM', category: 'Listrik & Air', type: 'expense', amount: 580000 },
    { id: 't-jun-05', date: '2026-06-12', desc: 'SPP sekolah Pia', category: 'Sekolah Anak', type: 'expense', amount: 650000 },
    { id: 't-jun-06', date: '2026-06-15', desc: 'Bensin & parkir sebulan', category: 'Transport', type: 'expense', amount: 420000 },
    { id: 't-jun-07', date: '2026-06-20', desc: 'Internet IndiHome', category: 'Internet & HP', type: 'expense', amount: 385000 },
    { id: 't-jun-08', date: '2026-06-25', desc: 'Makan di luar & jajan', category: 'Makan di Luar', type: 'expense', amount: 480000 },
    { id: 't-jun-09', date: '2026-06-28', desc: 'Periksa gigi Bunda', category: 'Kesehatan', type: 'expense', amount: 350000 },
    // --- Juli 2026 ---
    { id: 't-jul-01', date: '2026-07-01', desc: 'Gaji Ayah (IT Support)', category: 'Lainnya', type: 'income', amount: 7500000 },
    { id: 't-jul-02', date: '2026-07-01', desc: 'Gaji Bunda (Guru PPPK)', category: 'Lainnya', type: 'income', amount: 4200000 },
    { id: 't-jul-03', date: '2026-07-06', desc: 'Belanja bulanan supermarket', category: 'Belanja Harian', type: 'expense', amount: 2100000 },
    { id: 't-jul-04', date: '2026-07-10', desc: 'Listrik PLN + Air PDAM', category: 'Listrik & Air', type: 'expense', amount: 610000 },
    { id: 't-jul-05', date: '2026-07-12', desc: 'SPP sekolah Pia + buku baru', category: 'Sekolah Anak', type: 'expense', amount: 890000 },
    { id: 't-jul-06', date: '2026-07-16', desc: 'Bensin & parkir sebulan', category: 'Transport', type: 'expense', amount: 450000 },
    { id: 't-jul-07', date: '2026-07-20', desc: 'Internet IndiHome + paket data', category: 'Internet & HP', type: 'expense', amount: 460000 },
    { id: 't-jul-08', date: '2026-07-24', desc: 'Makan di luar & jajan', category: 'Makan di Luar', type: 'expense', amount: 520000 },
    { id: 't-jul-09', date: '2026-07-27', desc: 'Main ke taman + tiket wahana', category: 'Hiburan', type: 'expense', amount: 275000 },
    // --- Agustus 2026 ---
    { id: 't-agu-01', date: '2026-08-01', desc: 'Gaji Ayah (IT Support)', category: 'Lainnya', type: 'income', amount: 7500000 },
    { id: 't-agu-02', date: '2026-08-01', desc: 'Gaji Bunda (Guru PPPK)', category: 'Lainnya', type: 'income', amount: 4200000 },
    { id: 't-agu-03', date: '2026-08-05', desc: 'Belanja bulanan supermarket', category: 'Belanja Harian', type: 'expense', amount: 2050000 },
    { id: 't-agu-04', date: '2026-08-10', desc: 'Listrik PLN + Air PDAM', category: 'Listrik & Air', type: 'expense', amount: 640000 },
    { id: 't-agu-05', date: '2026-08-12', desc: 'SPP sekolah Pia', category: 'Sekolah Anak', type: 'expense', amount: 650000 },
    { id: 't-agu-06', date: '2026-08-15', desc: 'Bensin & parkir sebulan', category: 'Transport', type: 'expense', amount: 430000 },
    { id: 't-agu-07', date: '2026-08-18', desc: 'Baju seragam baru Pia', category: 'Pakaian', type: 'expense', amount: 320000 },
    { id: 't-agu-08', date: '2026-08-20', desc: 'Internet IndiHome', category: 'Internet & HP', type: 'expense', amount: 385000 },
    { id: 't-agu-09', date: '2026-08-26', desc: 'Makan di luar & jajan', category: 'Makan di Luar', type: 'expense', amount: 460000 },
    // --- September 2026 ---
    { id: 't-sep-01', date: '2026-09-01', desc: 'Gaji Ayah (IT Support)', category: 'Lainnya', type: 'income', amount: 7500000 },
    { id: 't-sep-02', date: '2026-09-01', desc: 'Gaji Bunda (Guru PPPK)', category: 'Lainnya', type: 'income', amount: 4200000 },
    { id: 't-sep-03', date: '2026-09-06', desc: 'Belanja bulanan supermarket', category: 'Belanja Harian', type: 'expense', amount: 2200000 },
    { id: 't-sep-04', date: '2026-09-10', desc: 'Listrik PLN + Air PDAM', category: 'Listrik & Air', type: 'expense', amount: 590000 },
    { id: 't-sep-05', date: '2026-09-12', desc: 'SPP sekolah Pia', category: 'Sekolah Anak', type: 'expense', amount: 650000 },
    { id: 't-sep-06', date: '2026-09-15', desc: 'Bensin & parkir sebulan', category: 'Transport', type: 'expense', amount: 480000 },
    { id: 't-sep-07', date: '2026-09-20', desc: 'Internet IndiHome + paket data', category: 'Internet & HP', type: 'expense', amount: 460000 },
    { id: 't-sep-08', date: '2026-09-22', desc: 'Servis motor + ganti oli', category: 'Transport', type: 'expense', amount: 290000 },
    { id: 't-sep-09', date: '2026-09-25', desc: 'Makan di luar & jajan', category: 'Makan di Luar', type: 'expense', amount: 510000 },
    // --- Oktober 2026 ---
    { id: 't-okt-01', date: '2026-10-01', desc: 'Gaji Ayah (IT Support)', category: 'Lainnya', type: 'income', amount: 7500000 },
    { id: 't-okt-02', date: '2026-10-01', desc: 'Gaji Bunda (Guru PPPK)', category: 'Lainnya', type: 'income', amount: 4200000 },
    { id: 't-okt-03', date: '2026-10-05', desc: 'Belanja bulanan supermarket', category: 'Belanja Harian', type: 'expense', amount: 2150000 },
    { id: 't-okt-04', date: '2026-10-10', desc: 'Listrik PLN + Air PDAM', category: 'Listrik & Air', type: 'expense', amount: 620000 },
    { id: 't-okt-05', date: '2026-10-12', desc: 'SPP sekolah Pia', category: 'Sekolah Anak', type: 'expense', amount: 650000 },
    { id: 't-okt-06', date: '2026-10-15', desc: 'Bensin & parkir sebulan', category: 'Transport', type: 'expense', amount: 460000 },
    { id: 't-okt-07', date: '2026-10-20', desc: 'Internet IndiHome', category: 'Internet & HP', type: 'expense', amount: 385000 },
    { id: 't-okt-08', date: '2026-10-24', desc: 'Makan di luar & jajan', category: 'Makan di Luar', type: 'expense', amount: 495000 },
    { id: 't-okt-09', date: '2026-10-27', desc: 'Beli kipas angin baru', category: 'Rumah Tangga', type: 'expense', amount: 385000 }
  ];

  TRANSACTIONS.push.apply(TRANSACTIONS, OLD_TRANSACTIONS);

  window.DompetData = {
    categories: CATEGORIES,
    budgets: BUDGETS,
    bills: BILLS,
    goals: GOALS,
    transactions: TRANSACTIONS,
    currentMonth: '2026-11'
  };
})();
