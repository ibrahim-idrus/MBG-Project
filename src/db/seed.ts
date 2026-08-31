import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { ensureDummyMasterData } from './dummy-master-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../data/mbg.db');
const SALT_ROUNDS = 10;

// Seed data
const ADMIN_EMAIL = 'adminbaim@mbg.local';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAME = 'adminbaim';

// Menu data - realistic Indonesian meals
const menuData = [
  // Breakfast items
  { name: 'Bubur Ayam Spesial', meal_type: 'breakfast', description: 'Bubur ayam dengan topping telur, cakue, dan daun bawang', calories: 350, protein: 18, carbohydrates: 45, fat: 12, fiber: 3 },
  { name: 'Nasi Uduk Betawi', meal_type: 'breakfast', description: 'Nasi uduk dengan lauk telur balado, tempe orek, dan sambal kacang', calories: 420, protein: 15, carbohydrates: 55, fat: 18, fiber: 4 },
  { name: 'Lontong Sayur', meal_type: 'breakfast', description: 'Lontong dengan sayur labu siam, telur, dan sambal', calories: 380, protein: 12, carbohydrates: 50, fat: 15, fiber: 5 },
  { name: 'Roti Panggang Selai Kacang', meal_type: 'breakfast', description: 'Roti gandum panggang dengan selai kacang dan pisang', calories: 320, protein: 14, carbohydrates: 42, fat: 12, fiber: 6 },
  { name: 'Soto Ayam Lamongan', meal_type: 'breakfast', description: 'Soto ayam dengan nasi, telur, dan kerupuk', calories: 400, protein: 22, carbohydrates: 48, fat: 14, fiber: 3 },
  { name: 'Gado-gado Jakarta', meal_type: 'breakfast', description: 'Sayuran segar dengan bumbu kacang dan lontong', calories: 360, protein: 16, carbohydrates: 40, fat: 16, fiber: 8 },
  { name: 'Bubur Kacang Hijau', meal_type: 'breakfast', description: 'Bubur kacang hijau dengan santan dan roti tawar', calories: 340, protein: 12, carbohydrates: 52, fat: 10, fiber: 7 },
  { name: 'Nasi Goreng Kampung', meal_type: 'breakfast', description: 'Nasi goreng dengan telur, ayam suwir, dan kerupuk', calories: 450, protein: 20, carbohydrates: 58, fat: 16, fiber: 3 },

  // Lunch items
  { name: 'Ayam Goreng dengan Nasi', meal_type: 'lunch', description: 'Ayam goreng tepung dengan nasi putih dan sambal', calories: 550, protein: 35, carbohydrates: 60, fat: 20, fiber: 2 },
  { name: 'Ikan Bakar dengan Nasi', meal_type: 'lunch', description: 'Ikan nila bakar dengan nasi, lalapan, dan sambal', calories: 480, protein: 38, carbohydrates: 55, fat: 14, fiber: 4 },
  { name: 'Rendang dengan Nasi', meal_type: 'lunch', description: 'Rendang daging sapi dengan nasi putih dan sayur bayam', calories: 620, protein: 42, carbohydrates: 58, fat: 25, fiber: 3 },
  { name: 'Soto Betawi', meal_type: 'lunch', description: 'Soto betawi dengan daging sapi, kentang, dan nasi', calories: 520, protein: 32, carbohydrates: 50, fat: 22, fiber: 4 },
  { name: 'Pecel Lele', meal_type: 'lunch', description: 'Lele goreng dengan nasi, lalapan, dan sambal pecel', calories: 490, protein: 30, carbohydrates: 55, fat: 18, fiber: 5 },
  { name: 'Nasi Campur Bali', meal_type: 'lunch', description: 'Nasi campur dengan ayam sisit, sayur urap, dan sambal matah', calories: 530, protein: 28, carbohydrates: 62, fat: 19, fiber: 6 },
  { name: 'Gulai Kambing dengan Nasi', meal_type: 'lunch', description: 'Gulai kambing dengan nasi putih dan acar', calories: 580, protein: 38, carbohydrates: 55, fat: 24, fiber: 3 },
  { name: 'Ayam Penyet dengan Nasi', meal_type: 'lunch', description: 'Ayam penyet dengan nasi, tempe goreng, dan sambal', calories: 510, protein: 32, carbohydrates: 58, fat: 18, fiber: 4 },
  { name: 'Ikan Asam Manis dengan Nasi', meal_type: 'lunch', description: 'Ikan kakap asam manis dengan nasi dan sayur kangkung', calories: 470, protein: 34, carbohydrates: 52, fat: 16, fiber: 5 },

  // Snack items
  { name: 'Pisang Goreng', meal_type: 'snack', description: 'Pisang goreng tepung dengan gula halus', calories: 180, protein: 2, carbohydrates: 32, fat: 6, fiber: 2 },
  { name: 'Roti Isi Coklat', meal_type: 'snack', description: 'Roti isi selai coklat dan keju', calories: 220, protein: 6, carbohydrates: 35, fat: 8, fiber: 2 },
  { name: 'Kue Lapis Legit', meal_type: 'snack', description: 'Kue lapis legit dengan rasa pandan dan coklat', calories: 250, protein: 4, carbohydrates: 38, fat: 10, fiber: 1 },
  { name: 'Bolu Kukus', meal_type: 'snack', description: 'Bolu kukus dengan berbagai rasa', calories: 190, protein: 3, carbohydrates: 30, fat: 7, fiber: 1 },
  { name: 'Pastel Isi Sayur', meal_type: 'snack', description: 'Pastel dengan isian sayur dan bihun', calories: 160, protein: 4, carbohydrates: 22, fat: 7, fiber: 2 },
  { name: 'Risoles Mayo', meal_type: 'snack', description: 'Risoles dengan isian ayam dan mayo', calories: 180, protein: 6, carbohydrates: 20, fat: 9, fiber: 1 },
  { name: 'Serabi Kinca', meal_type: 'snack', description: 'Serabi dengan kinca gula merah', calories: 170, protein: 3, carbohydrates: 30, fat: 5, fiber: 1 },
  { name: 'Klepon', meal_type: 'snack', description: 'Klepon dengan isian gula merah dan kelapa parut', calories: 150, protein: 2, carbohydrates: 28, fat: 4, fiber: 2 },
  { name: 'Getuk Lindri', meal_type: 'snack', description: 'Getuk singkong dengan warna-warni', calories: 140, protein: 1, carbohydrates: 30, fat: 2, fiber: 3 },
  { name: 'Onde-onde', meal_type: 'snack', description: 'Onde-onde dengan isian kacang hijau', calories: 160, protein: 4, carbohydrates: 26, fat: 5, fiber: 2 },
  { name: 'Puding Coklat', meal_type: 'snack', description: 'Puding coklat dengan vla vanilla', calories: 200, protein: 4, carbohydrates: 32, fat: 7, fiber: 1 },
  { name: 'Es Buah Segar', meal_type: 'snack', description: 'Es buah dengan berbagai buah segar dan sirup', calories: 180, protein: 1, carbohydrates: 42, fat: 1, fiber: 3 },
];

// Financial transaction data
const transactionData = [
  // IN transactions
  { type: 'IN', category: 'Dana Pemerintah', title: 'Dana BOS Tahap 1', amount: 50000000, description: 'Pencairan dana Bantuan Operasional Sekolah tahap 1 untuk semester ganjil' },
  { type: 'IN', category: 'Dana Pemerintah', title: 'Dana BOS Tahap 2', amount: 50000000, description: 'Pencairan dana Bantuan Operasional Sekolah tahap 2 untuk semester ganjil' },
  { type: 'IN', category: 'Dana Pemerintah', title: 'Dana BOS Tahap 3', amount: 50000000, description: 'Pencairan dana Bantuan Operasional Sekolah tahap 3 untuk semester genap' },
  { type: 'IN', category: 'Dana Pemerintah', title: 'Dana MBG Khusus', amount: 75000000, description: 'Dana khusus program Makan Bergizi Gratis dari pemerintah pusat' },
  { type: 'IN', category: 'Dana Pemerintah', title: 'Dana Operasional Dapur', amount: 30000000, description: 'Dana operasional untuk pemeliharaan dapur sekolah' },
  { type: 'IN', category: 'Donasi', title: 'Donasi Komite Sekolah', amount: 15000000, description: 'Donasi dari komite sekolah untuk program MBG' },
  { type: 'IN', category: 'Donasi', title: 'Donasi Alumni', amount: 10000000, description: 'Donasi dari alumni sekolah untuk mendukung program gizi' },
  { type: 'IN', category: 'Dana Pemerintah', title: 'Dana Insentif Tenaga Dapur', amount: 12000000, description: 'Dana insentif untuk tenaga dapur dan staf MBG' },

  // OUT transactions - Bahan Makanan
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Beras Premium', amount: 8500000, description: 'Pembelian beras premium 500kg untuk kebutuhan 2 minggu' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Beras Medium', amount: 6000000, description: 'Pembelian beras medium 400kg untuk kebutuhan 2 minggu' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Ayam Potong', amount: 12000000, description: 'Pembelian ayam potong 300kg dari supplier lokal' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Ikan Nila', amount: 8000000, description: 'Pembelian ikan nila segar 200kg dari pasar ikan' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Ikan Kakap', amount: 6500000, description: 'Pembelian ikan kakap 150kg untuk menu ikan bakar' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Daging Sapi', amount: 15000000, description: 'Pembelian daging sapi 100kg untuk rendang dan gulai' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Telur Ayam', amount: 4500000, description: 'Pembelian telur ayam 500kg (±9000 butir)' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Sayuran Segar', amount: 5000000, description: 'Pembelian sayuran: bayam, kangkung, wortel, kentang, dll' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Buah-buahan', amount: 3500000, description: 'Pembelian buah: pisang, apel, jeruk untuk menu snack' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Susu Segar', amount: 2800000, description: 'Pembelian susu segar 200 liter untuk menu snack' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Bumbu Dapur', amount: 1500000, description: 'Pembelian bumbu: bawang, cabai, garam, gula, minyak, dll' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Minyak Goreng', amount: 2200000, description: 'Pembelian minyak goreng 100 liter' },
  { type: 'OUT', category: 'Bahan Makanan', title: 'Pembelian Tahu dan Tempe', amount: 1800000, description: 'Pembelian tahu dan tempe 100kg dari produsen lokal' },

  // OUT transactions - Operasional
  { type: 'OUT', category: 'Operasional', title: 'Pembayaran Gas LPG', amount: 1200000, description: 'Pembelian tabung gas LPG 3kg sebanyak 50 tabung' },
  { type: 'OUT', category: 'Operasional', title: 'Pembelian Alat Kebersihan', amount: 800000, description: 'Pembelian sabun, spons, lap, dan alat kebersihan dapur' },
  { type: 'OUT', category: 'Operasional', title: 'Pembelian Kemasan Makanan', amount: 1500000, description: 'Pembelian kotak makan, sendok, dan kemasan sekali pakai' },
  { type: 'OUT', category: 'Operasional', title: 'Biaya Listrik Dapur', amount: 2500000, description: 'Pembayaran listrik untuk dapur dan penyimpanan makanan' },
  { type: 'OUT', category: 'Operasional', title: 'Biaya Air dan PDAM', amount: 800000, description: 'Pembayaran air untuk kebutuhan memasak dan kebersihan' },
  { type: 'OUT', category: 'Operasional', title: 'Pembelian Peralatan Dapur', amount: 3500000, description: 'Pembelian panci, wajan, pisau, dan peralatan masak' },
  { type: 'OUT', category: 'Operasional', title: 'Pembelian Kotak Makanan', amount: 2000000, description: 'Pembelian kotak makanan untuk distribusi ke kelas' },
  { type: 'OUT', category: 'Transportasi', title: 'Biaya Pengiriman Bahan', amount: 1200000, description: 'Biaya pengiriman bahan makanan dari supplier ke sekolah' },
  { type: 'OUT', category: 'Transportasi', title: 'Biaya Distribusi Menu', amount: 900000, description: 'Biaya transportasi distribusi makanan ke titik-titik sekolah' },

  // OUT transactions - Gaji
  { type: 'OUT', category: 'Gaji', title: 'Gaji Koki Utama', amount: 4500000, description: 'Gaji bulanan koki utama program MBG' },
  { type: 'OUT', category: 'Gaji', title: 'Gaji Asisten Koki', amount: 3500000, description: 'Gaji bulanan 2 asisten koki program MBG' },
  { type: 'OUT', category: 'Gaji', title: 'Gaji Staf Kebersihan', amount: 2500000, description: 'Gaji bulanan staf kebersihan dapur' },
  { type: 'OUT', category: 'Gaji', title: 'Insentif Tenaga Dapur', amount: 1500000, description: 'Insentif tambahan untuk tenaga dapur atas pencapaian target' },
];

// Aspiration data
const aspirationData = [
  { sender_name: 'Budi Santoso', sender_email: 'budi.santoso@gmail.com', category: 'Kualitas Makanan', description: 'Porsi makan siang hari ini terasa kurang mengenyangkan dibandingkan biasanya. Mohon bisa ditinjau kembali standar porsinya agar gizi anak-anak terpenuhi dengan baik.', status: 'pending' },
  { sender_name: 'Siti Rahayu', sender_email: 'siti.rahayu@yahoo.com', category: 'Kebersihan', description: 'Saya perhatikan kebersihan di area makan kurang terjaga. Mohon ditingkatkan kebersihan meja dan kursi makan anak-anak.', status: 'in_progress', admin_response: 'Terima kasih atas masukannya. Kami akan meningkatkan frekuensi pembersihan area makan menjadi 3 kali sehari.', responded_at: '2024-01-15 10:30:00' },
  { sender_name: 'Ahmad Hidayat', sender_email: 'ahmad.hidayat@gmail.com', category: 'Porsi Makanan', description: 'Anak saya sering bilang masih lapar setelah makan siang. Apakah porsinya bisa ditambah sedikit?', status: 'completed', admin_response: 'Kami telah menyesuaikan porsi makan siang menjadi lebih besar. Terima kasih atas masukannya.', responded_at: '2024-01-14 14:20:00' },
  { sender_name: 'Dewi Lestari', sender_email: 'dewi.lestari@outlook.com', category: 'Menu', description: 'Anak saya tidak suka sayur bayam. Apakah bisa diganti dengan sayuran lain yang lebih disukai anak-anak?', status: 'pending' },
  { sender_name: 'Rudi Hermawan', sender_email: 'rudi.hermawan@gmail.com', category: 'Distribusi', description: 'Kemarin makanan datang terlambat 30 menit dari jadwal. Mohon diperhatikan ketepatan waktunya.', status: 'in_progress', admin_response: 'Kami mohon maaf atas keterlambatan. Kami sudah mengevaluasi jalur distribusi dan menambah armada pengiriman.', responded_at: '2024-01-13 09:15:00' },
  { sender_name: 'Nina Suryani', sender_email: 'nina.suryani@gmail.com', category: 'Kualitas Makanan', description: 'Ikan yang disajikan kemarin baunya kurang segar. Mohon diperhatikan kualitas bahan makanan yang digunakan.', status: 'completed', admin_response: 'Terima kasih atas laporannya. Kami sudah mengganti supplier ikan dan meningkatkan kontrol kualitas bahan baku.', responded_at: '2024-01-12 16:45:00' },
  { sender_name: 'Hendra Kusuma', sender_email: 'hendra.kusuma@gmail.com', category: 'Menu', description: 'Menu yang disajikan monoton. Apakah bisa divariasikan lebih banyak agar anak-anak tidak bosan?', status: 'pending' },
  { sender_name: 'Rina Wati', sender_email: 'rina.wati@yahoo.com', category: 'Kebersihan', description: 'Saya lihat ada lalat di sekitar area penyajian makanan. Mohon dipasang kawat nyamuk atau alat pengusir lalat.', status: 'in_progress', admin_response: 'Kami sudah memesan kawat nyamuk dan lampu pengusir lalat untuk dipasang di area dapur dan penyajian.', responded_at: '2024-01-11 11:30:00' },
  { sender_name: 'Dodi Prasetyo', sender_email: 'dodi.prasetyo@gmail.com', category: 'Porsi Makanan', description: 'Porsi snack sore terlalu kecil. Anak-anak butuh energi tambahan untuk kegiatan ekstrakurikuler.', status: 'pending' },
  { sender_name: 'Wati Susilawati', sender_email: 'wati.susilawati@gmail.com', category: 'Layanan', description: 'Staf yang melayani kurang ramah. Mohon diberikan pelatihan tentang pelayanan yang baik.', status: 'completed', admin_response: 'Kami sudah mengadakan pelatihan pelayanan untuk seluruh staf. Terima kasih atas masukannya.', responded_at: '2024-01-10 15:20:00' },
  { sender_name: 'Agus Salim', sender_email: 'agus.salim@gmail.com', category: 'Kualitas Makanan', description: 'Nasi yang disajikan hari ini terlalu lembek. Mohon diperhatikan cara memasak nasi yang benar.', status: 'pending' },
  { sender_name: 'Lia Amelia', sender_email: 'lia.amelia@yahoo.com', category: 'Menu', description: 'Anak saya alergi telur. Apakah ada menu alternatif untuk anak-anak dengan alergi tertentu?', status: 'in_progress', admin_response: 'Kami akan menyediakan menu alternatif untuk anak-anak dengan alergi. Mohon informasikan alergi yang dimiliki.', responded_at: '2024-01-09 13:10:00' },
  { sender_name: 'Bambang Sutrisno', sender_email: 'bambang.sutrisno@gmail.com', category: 'Distribusi', description: 'Makanan yang sampai ke kelas sudah tidak hangat. Apakah bisa menggunakan kotak yang lebih kedap udara?', status: 'pending' },
  { sender_name: 'Sri Mulyani', sender_email: 'sri.mulyani@gmail.com', category: 'Kebersihan', description: 'Sendok dan garpu yang disediakan kadang masih ada sisa makanan. Mohon diperhatikan kebersihannya.', status: 'completed', admin_response: 'Kami sudah menambah tahap pencucian dan sterilisasi alat makan. Terima kasih atas laporannya.', responded_at: '2024-01-08 10:45:00' },
  { sender_name: 'Joko Widodo', sender_email: 'joko.widodo@gmail.com', category: 'Layanan', description: 'Antrian untuk mengambil makanan terlalu panjang. Apakah bisa ditambah loket pengambilan?', status: 'pending' },
  { sender_name: 'Maya Kartika', sender_email: 'maya.kartika@gmail.com', category: 'Kualitas Makanan', description: 'Buah yang disajikan sudah terlalu matang. Mohon pilih buah yang masih segar.', status: 'in_progress', admin_response: 'Kami sudah mengevaluasi supplier buah dan akan memesan buah yang lebih segar setiap hari.', responded_at: '2024-01-07 14:30:00' },
  { sender_name: 'Rizki Pratama', sender_email: 'rizki.pratama@yahoo.com', category: 'Porsi Makanan', description: 'Porsi untuk anak kelas 6 berbeda dengan kelas 1. Apakah bisa disesuaikan dengan kebutuhan masing-masing?', status: 'pending' },
  { sender_name: 'Ani Yudhoyono', sender_email: 'ani.yudhoyono@gmail.com', category: 'Menu', description: 'Menu sarapan terlalu berat. Apakah bisa diganti dengan menu yang lebih ringan seperti bubur atau roti?', status: 'completed', admin_response: 'Kami sudah menyesuaikan menu sarapan menjadi lebih ringan dan bergizi seimbang.', responded_at: '2024-01-06 11:15:00' },
  { sender_name: 'Tono Sukarno', sender_email: 'tono.sukarno@gmail.com', category: 'Distribusi', description: 'Ada makanan yang tumpah saat distribusi. Mohon diperhatikan cara membawa makanan yang aman.', status: 'pending' },
  { sender_name: 'Ratna Sari', sender_email: 'ratna.sari@gmail.com', category: 'Kebersihan', description: 'Tempat cuci tangan di dekat area makan tidak berfungsi. Mohon segera diperbaiki.', status: 'in_progress', admin_response: 'Kami sudah memanggil teknisi untuk memperbaiki tempat cuci tangan. Terima kasih atas laporannya.', responded_at: '2024-01-05 09:45:00' },
  { sender_name: 'Dedi Suharto', sender_email: 'dedi.suharto@gmail.com', category: 'Layanan', description: 'Informasi menu tidak diumumkan dengan jelas. Mohon dipasang papan informasi menu harian.', status: 'pending' },
  { sender_name: 'Putri Anggraeni', sender_email: 'putri.anggraeni@yahoo.com', category: 'Kualitas Makanan', description: 'Sayuran yang disajikan terlalu layu. Mohon masak sayuran yang masih segar.', status: 'completed', admin_response: 'Kami sudah meningkatkan kontrol kesegaran sayuran dan memasaknya lebih dekat dengan waktu penyajian.', responded_at: '2024-01-04 16:20:00' },
  { sender_name: 'Irfan Hakim', sender_email: 'irfan.hakim@gmail.com', category: 'Porsi Makanan', description: 'Porsi nasi terlalu banyak dibandingkan lauknya. Mohon proporsinya diseimbangkan.', status: 'pending' },
  { sender_name: 'Dina Mariana', sender_email: 'dina.mariana@gmail.com', category: 'Menu', description: 'Apakah ada menu khusus untuk hari Jumat? Anak-anak suka menu spesial di hari Jumat.', status: 'pending' },
  { sender_name: 'Eko Prasetyo', sender_email: 'eko.prasetyo@gmail.com', category: 'Distribusi', description: 'Pengiriman makanan ke kelas 3B terlambat 15 menit. Mohon diperhatikan jadwal distribusi.', status: 'completed', admin_response: 'Kami sudah menyesuaikan rute distribusi dan menambah personel untuk pengiriman tepat waktu.', responded_at: '2024-01-03 13:30:00' },
  { sender_name: 'Fitri Handayani', sender_email: 'fitri.handayani@gmail.com', category: 'Kebersihan', description: 'Lantai area makan licin setelah hujan. Mohon dipasang keset atau peringatan.', status: 'pending' },
  { sender_name: 'Gilang Pratama', sender_email: 'gilang.prama@gmail.com', category: 'Layanan', description: 'Anak saya tidak kebagian makanan karena terlambat datang. Apakah ada cadangan?', status: 'in_progress', admin_response: 'Kami akan menyediakan cadangan makanan 10% dari total porsi untuk mengantisipasi keterlambatan.', responded_at: '2024-01-02 10:20:00' },
  { sender_name: 'Hana Permata', sender_email: 'hana.permata@yahoo.com', category: 'Kualitas Makanan', description: 'Susu yang diberikan sudah mendekati kadaluarsa. Mohon periksa tanggal kadaluarsa sebelum disajikan.', status: 'pending' },
];

export function seedDatabase(): void {
  console.log('Starting database seed...');
  
  const db = new Database(DB_PATH);
  
  // Enable WAL mode
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Seed kitchens and schools first
  ensureDummyMasterData(db);
  
  // Check if admin already exists
  const existingAdmin = db.prepare('SELECT id FROM admins WHERE email = ?').get(ADMIN_EMAIL) as { id: number } | undefined;
  
  let adminId: number;
  
  if (existingAdmin) {
    console.log('Admin account already exists, using existing admin...');
    adminId = existingAdmin.id;
  } else {
    // Create admin account
    console.log('Creating admin account...');
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, SALT_ROUNDS);
    
    const result = db.prepare(`
      INSERT INTO admins (name, email, password_hash, role, status)
      VALUES (?, ?, ?, 'super_admin', 'active')
    `).run(ADMIN_NAME, ADMIN_EMAIL, passwordHash);
    
    adminId = result.lastInsertRowid as number;
    console.log(`✓ Admin account created (ID: ${adminId})`);
  }
  
  // Seed menus (idempotent - skip if data exists)
  const menuCount = db.prepare('SELECT COUNT(*) as count FROM menus').get() as { count: number };
  
  if (menuCount.count === 0) {
    console.log('Seeding menu data...');
    const insertMenu = db.prepare(`
      INSERT INTO menus (kitchen_id, school_id, name, description, meal_type, menu_date, calories, protein, carbohydrates, fat, fiber, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const startDate = new Date('2024-01-01');
    let menuInserted = 0;
    
    // Separate arrays for each meal type
    const breakfastItems = menuData.filter(m => m.meal_type === 'breakfast');
    const lunchItems = menuData.filter(m => m.meal_type === 'lunch');
    const snackItems = menuData.filter(m => m.meal_type === 'snack');
    
    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Get breakfast, lunch, and snack for this day
      const breakfast = breakfastItems[day % breakfastItems.length];
      const lunch = lunchItems[day % lunchItems.length];
      const snack = snackItems[day % snackItems.length];
      
      insertMenu.run(1, 1, breakfast.name, breakfast.description, breakfast.meal_type, dateStr, breakfast.calories, breakfast.protein, breakfast.carbohydrates, breakfast.fat, breakfast.fiber, adminId);
      insertMenu.run(1, 1, lunch.name, lunch.description, lunch.meal_type, dateStr, lunch.calories, lunch.protein, lunch.carbohydrates, lunch.fat, lunch.fiber, adminId);
      insertMenu.run(1, 1, snack.name, snack.description, snack.meal_type, dateStr, snack.calories, snack.protein, snack.carbohydrates, snack.fat, snack.fiber, adminId);
      
      menuInserted += 3;
    }
    
    console.log(`✓ ${menuInserted} menu items seeded`);
  } else {
    console.log(`Menu data already exists (${menuCount.count} items), skipping...`);
  }
  
  // Seed financial transactions (idempotent - skip if data exists)
  const transactionCount = db.prepare('SELECT COUNT(*) as count FROM financial_transactions').get() as { count: number };
  
  if (transactionCount.count === 0) {
    console.log('Seeding financial transaction data...');
    const insertTransaction = db.prepare(`
      INSERT INTO financial_transactions (kitchen_id, type, category, title, amount, transaction_date, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const startDate = new Date('2024-01-01');
    let transactionInserted = 0;
    
    for (let i = 0; i < transactionData.length; i++) {
      const tx = transactionData[i];
      const txDate = new Date(startDate);
      txDate.setDate(startDate.getDate() + (i * 2)); // Spread across 2 months
      
      const dateStr = txDate.toISOString().split('T')[0];
      
      insertTransaction.run(1, tx.type, tx.category, tx.title, tx.amount, dateStr, tx.description, adminId);
      transactionInserted++;
    }
    
    console.log(`✓ ${transactionInserted} financial transactions seeded`);
  } else {
    console.log(`Financial transaction data already exists (${transactionCount.count} items), skipping...`);
  }
  
  // Seed aspirations (idempotent - skip if data exists)
  const aspirationCount = db.prepare('SELECT COUNT(*) as count FROM aspirations').get() as { count: number };
  
  if (aspirationCount.count === 0) {
    console.log('Seeding aspiration data...');
    const insertAspiration = db.prepare(`
      INSERT INTO aspirations (sender_name, sender_email, category, description, status, admin_response, responded_by, responded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const startDate = new Date('2024-01-01');
    let aspirationInserted = 0;
    
    for (let i = 0; i < aspirationData.length; i++) {
      const asp = aspirationData[i];
      const aspDate = new Date(startDate);
      aspDate.setDate(startDate.getDate() + i);
      
      const dateStr = aspDate.toISOString().split('T')[0] + ' 08:00:00';
      
      const respondedBy = asp.status !== 'pending' ? adminId : null;
      const respondedAt = asp.responded_at || null;
      
      insertAspiration.run(asp.sender_name, asp.sender_email, asp.category, asp.description, asp.status, asp.admin_response || null, respondedBy, respondedAt);
      aspirationInserted++;
    }
    
    console.log(`✓ ${aspirationInserted} aspirations seeded`);
  } else {
    console.log(`Aspiration data already exists (${aspirationCount.count} items), skipping...`);
  }
  
  db.close();
  console.log('Database seed completed!');
}

// Run if called directly
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedDatabase();
}
