export interface Transaction {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  category: 'masuk' | 'keluar';
  amount: string;
  hasDocument: boolean;
  description: string;
}

export const transactions: Transaction[] = [
  {
    id: 'TRX-20231024-001',
    date: '24 Okt 2023',
    title: 'Pembelian Beras & Sayur',
    subtitle: 'Supplier: PD. Makmur',
    category: 'keluar',
    amount: '- Rp 2.500.000',
    hasDocument: true,
    description: 'Pembelian stok beras 50kg dan sayuran segar untuk kebutuhan dapur asrama periode akhir Oktober. Supplier: PD. Makmur.',
  },
  {
    id: 'TRX-20231022-002',
    date: '22 Okt 2023',
    title: 'Pencairan Dana BOS Tahap 3',
    subtitle: 'Transfer Dinas',
    category: 'masuk',
    amount: '+ Rp 45.000.000',
    hasDocument: true,
    description: 'Pencairan dana Bantuan Operasional Sekolah (BOS) tahap ke-3 untuk periode Juli-Desember 2023.',
  },
  {
    id: 'TRX-20231020-003',
    date: '20 Okt 2023',
    title: 'Pembayaran Gas LPG',
    subtitle: 'Operasional Dapur',
    category: 'keluar',
    amount: '- Rp 450.000',
    hasDocument: true,
    description: 'Pembelian tabung gas LPG 3kg sebanyak 10 tabung untuk kebutuhan memasak mingguan.',
  },
];
