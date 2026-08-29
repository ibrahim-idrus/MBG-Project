import { Hono } from 'hono';
import { KeuanganPage } from './pages/keuangan.js';
import { DashboardPage } from './pages/dashboard.js';
import { MenuPage } from './pages/menu.js';
import { TambahMenuPage } from './pages/tambah-menu.js';
import { StatistikPage } from './pages/statistik.js';
import { AspirasiPage } from './pages/aspirasi.js';
import { LokasiPage } from './pages/user/lokasi.js';
import { JadwalMenuPage } from './pages/user/jadwal-menu.js';
import { LaporanPage } from './pages/user/laporan.js';
import { KeuanganUserPage } from './pages/user/keuangan.js';
import { LoginPage } from './pages/auth/login.js';
import { RegisterPage } from './pages/auth/register.js';

const app = new Hono();

app.get('/', (c) => c.html(<LokasiPage />));

app.get('/login', (c) => c.html(<LoginPage />));
app.get('/register', (c) => c.html(<RegisterPage />));

app.get('/lokasi', (c) => c.html(<LokasiPage />));
app.get('/menu', (c) => c.html(<JadwalMenuPage />));
app.get('/laporan', (c) => c.html(<LaporanPage />));
app.get('/keuangan', (c) => c.html(<KeuanganUserPage />));

app.get('/admin', (c) => c.html(<DashboardPage />));
app.get('/admin/keuangan', (c) => c.html(<KeuanganPage />));
app.get('/admin/keuangan/statistik', (c) => c.html(<StatistikPage />));
app.get('/admin/menu', (c) => c.html(<MenuPage />));
app.get('/admin/menu/tambah', (c) => c.html(<TambahMenuPage />));
app.get('/admin/aspirasi', (c) => c.html(<AspirasiPage />));

export default app;
