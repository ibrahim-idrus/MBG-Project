export interface LaporanItem {
  no: number;
  tanggal: string;
  dapur: string;
  kategori: string;
  status: 'baru' | 'diperiksa' | 'selesai';
}

export const laporanTerbaru: LaporanItem[] = [
  { no: 1, tanggal: '18/08/2026', dapur: 'SPPG Kecamatan Andir', kategori: 'Makanan tidak layak', status: 'baru' },
  { no: 2, tanggal: '18/08/2026', dapur: 'SPPG Kecamatan Andir', kategori: 'Porsi kurang', status: 'diperiksa' },
  { no: 3, tanggal: '17/08/2026', dapur: 'SPPG Kecamatan Cicendo', kategori: 'Keterlambatan distribusi', status: 'selesai' },
];

export const fiturAdmin = [
  { icon: 'payments', title: 'Kelola Keuangan', description: 'Input pemasukan, pengeluaran, dan upload bukti/dokumen.', href: '/admin/keuangan' },
  { icon: 'restaurant', title: 'Kelola Menu & Gizi', description: 'Buat jadwal menu 7 hari ke depan beserta informasi gizinya.', href: '/admin/menu' },
  { icon: 'assessment', title: 'Kelola Laporan', description: 'Tinjau laporan, ubah status, dan berikan tindak lanjut.', href: '/admin/aspirasi' },
];
