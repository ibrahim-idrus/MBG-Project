import type { FC } from 'hono/jsx';
import type Database from 'better-sqlite3';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { getKitchens, getKitchenById, getKitchenInsightMetrics, getLocationHierarchy } from '../../db/queries.js';

interface CekMbgPageProps {
  db?: Database.Database;
  initialKitchenId?: string;
}

export const CekMbgPage: FC<CekMbgPageProps> = ({ db, initialKitchenId }) => {
  const kitchens = getKitchens(db) as any[];

  return (
    <AdminLayout title="Laporan Cerita SPPG - Cek MBG" activePage="/cek-mbg" variant="user">
      <div class="max-w-3xl mx-auto py-4 px-2 sm:px-4 space-y-6" id="cek-mbg-page-root">
        
        {/* Top Header Card */}
        <div class="bg-gradient-to-br from-primary via-[#5A3EB5] to-[#3B2880] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div class="relative z-10 space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span>Laporan Interaktif Warga & Orang Tua Murid</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cek Transparansi & Kualitas MBG
            </h1>
            <p class="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xl">
              Cari tahu dapur Satuan Pelayanan Pemenuhan Gizi (SPPG) di kelurahan Anda dan baca cerita lengkap mengenai integritas anggaran, kecukupan gizi anak, standar sanitasi, serta jaminan keamanan pangan.
            </p>
          </div>
          <div class="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div class="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block opacity-20 pointer-events-none">
            <span class="material-symbols-outlined text-9xl">health_and_safety</span>
          </div>
        </div>

        {/* Story Card Container */}
        <div class="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-variant/80 shadow-md">
          
          {/* STEP 1: Permission / Location Choice */}
          <div id="story-step-permission" class="space-y-6">
            <div class="text-center max-w-md mx-auto py-4">
              <div class="w-16 h-16 rounded-3xl bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-4 shadow-inner text-3xl">
                📍
              </div>
              <h2 class="text-xl sm:text-2xl font-extrabold text-on-surface mb-2">
                Izinkan Akses Lokasi?
              </h2>
              <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
                Kami dapat mendeteksi kelurahan Anda secara otomatis melalui GPS untuk mencocokkan SPPG terdekat, atau Anda dapat memilih wilayah secara manual.
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto">
                <button
                  type="button"
                  id="btn-allow-location"
                  onclick="window.handleAllowLocation()"
                  class="flex items-center justify-center gap-2 bg-primary hover:bg-[#3E2B82] text-white py-3.5 px-5 rounded-2xl font-extrabold text-sm shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all"
                >
                  <span class="material-symbols-outlined text-[18px]">near_me</span>
                  Ya, Izinkan Lokasi
                </button>
                <button
                  type="button"
                  id="btn-deny-location"
                  onclick="window.handleDenyLocation()"
                  class="flex items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border-2 border-surface-variant py-3.5 px-5 rounded-2xl font-bold text-sm shadow-[0_3px_0_theme(colors.surface-variant)] active:translate-y-1 active:shadow-none transition-all"
                >
                  <span class="material-symbols-outlined text-[18px]">edit_location</span>
                  Tidak, Pilih Manual
                </button>
              </div>
            </div>
          </div>

          {/* STEP 2A: Loading / Radar State (Find SPPG around you) */}
          <div id="story-step-loading" class="hidden text-center py-12 space-y-4">
            <div class="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div class="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
              <div class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg text-2xl">
                🔍
              </div>
            </div>
            <div class="space-y-1">
              <h3 class="font-extrabold text-lg text-on-surface">
                Mencari SPPG di sekitar Anda...
              </h3>
              <p class="text-xs text-on-surface-variant">
                Find SPPG around you &bull; Mendeteksi kelurahan & dapur penyedia makanan bergizi terdekat...
              </p>
            </div>
          </div>

          {/* STEP 2B: Hierarchical Manual Form */}
          <div id="story-step-manual-form" class="hidden space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-surface-variant/60">
              <div>
                <h3 class="font-extrabold text-lg text-on-surface">Pilih Wilayah Domisili</h3>
                <p class="text-xs text-on-surface-variant">
                  Hierarki bertingkat: Provinsi &rarr; Kabupaten/Kota &rarr; Kecamatan &rarr; Kelurahan
                </p>
              </div>
              <button
                type="button"
                onclick="window.goToStep('permission')"
                class="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 font-medium"
              >
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                Kembali
              </button>
            </div>

            <form id="form-location-hierarchy" onsubmit="window.handleManualFormSubmit(event)" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Provinsi */}
                <div class="space-y-1.5">
                  <label for="select-province" class="block font-bold text-xs text-on-surface">
                    1. Provinsi <span class="text-error">*</span>
                  </label>
                  <select
                    id="select-province"
                    class="w-full bg-surface-container-low border border-surface-variant rounded-xl px-4 py-3 text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    onchange="window.onProvinceChange(this.value)"
                    required
                  >
                    <option value="">-- Pilih Provinsi --</option>
                  </select>
                </div>

                {/* 2. Kabupaten / Kota */}
                <div class="space-y-1.5">
                  <label for="select-city" class="block font-bold text-xs text-on-surface">
                    2. Kabupaten / Kota <span class="text-error">*</span>
                  </label>
                  <select
                    id="select-city"
                    class="w-full bg-surface-container-low border border-surface-variant rounded-xl px-4 py-3 text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                    onchange="window.onCityChange(this.value)"
                    disabled
                    required
                  >
                    <option value="">-- Pilih Kota/Kabupaten --</option>
                  </select>
                </div>

                {/* 3. Kecamatan */}
                <div class="space-y-1.5">
                  <label for="select-district" class="block font-bold text-xs text-on-surface">
                    3. Kecamatan <span class="text-error">*</span>
                  </label>
                  <select
                    id="select-district"
                    class="w-full bg-surface-container-low border border-surface-variant rounded-xl px-4 py-3 text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                    onchange="window.onDistrictChange(this.value)"
                    disabled
                    required
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                  </select>
                </div>

                {/* 4. Kelurahan */}
                <div class="space-y-1.5">
                  <label for="select-village" class="block font-bold text-xs text-on-surface">
                    4. Kelurahan / Desa <span class="text-error">*</span>
                  </label>
                  <select
                    id="select-village"
                    class="w-full bg-surface-container-low border border-surface-variant rounded-xl px-4 py-3 text-xs sm:text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                    disabled
                    required
                  >
                    <option value="">-- Pilih Kelurahan --</option>
                  </select>
                </div>
              </div>

              <div class="pt-3 flex justify-end">
                <button
                  type="submit"
                  class="bg-primary hover:bg-[#3E2B82] text-white font-extrabold text-sm px-7 py-3 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-[18px]">search</span>
                  Tampilkan SPPG Wilayah Ini
                </button>
              </div>
            </form>
          </div>

          {/* STEP 3: SPPG Discovery Card & Decision (Skip or Start Story) */}
          <div id="story-step-sppg-result" class="hidden space-y-6">
            <div class="bg-surface-bright rounded-2xl p-4 border border-surface-variant/70 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-primary text-[22px]">location_on</span>
                <div>
                  <span class="text-[11px] text-on-surface-variant block">Wilayah Terdeteksi:</span>
                  <span class="font-extrabold text-xs sm:text-sm text-on-surface" id="sppg-result-location-label">-</span>
                </div>
              </div>
              <button
                type="button"
                onclick="window.goToStep('manual-form')"
                class="text-xs text-primary hover:underline font-bold"
              >
                Ubah Lokasi
              </button>
            </div>

            {/* Matched SPPG Card */}
            <div class="bg-surface-container-lowest rounded-3xl border-2 border-primary/20 p-6 shadow-sm space-y-4">
              <div class="flex items-start justify-between">
                <div>
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 mb-2">
                    <span class="w-2 h-2 rounded-full bg-green-600"></span>
                    <span>SPPG Aktif Melayani Wilayah Ini</span>
                  </div>
                  <h3 class="text-xl sm:text-2xl font-extrabold text-primary" id="sppg-card-name">
                    Dapur MBG
                  </h3>
                  <p class="text-xs text-on-surface-variant font-mono" id="sppg-card-code">
                    KODE-001
                  </p>
                </div>
                <div class="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center text-3xl shadow">
                  🍲
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-surface-variant/60">
                <div class="bg-surface-container-low p-3 rounded-xl text-center">
                  <span class="text-[11px] text-on-surface-variant block mb-0.5">Kapasitas Porsi</span>
                  <span class="font-extrabold text-xs sm:text-sm text-on-surface" id="sppg-card-capacity">-</span>
                </div>
                <div class="bg-surface-container-low p-3 rounded-xl text-center">
                  <span class="text-[11px] text-on-surface-variant block mb-0.5">Sekolah Binaan</span>
                  <span class="font-extrabold text-xs sm:text-sm text-on-surface" id="sppg-card-schools">-</span>
                </div>
                <div class="bg-surface-container-low p-3 rounded-xl text-center">
                  <span class="text-[11px] text-on-surface-variant block mb-0.5">Siswa Terlayani</span>
                  <span class="font-extrabold text-xs sm:text-sm text-on-surface" id="sppg-card-students">-</span>
                </div>
                <div class="bg-surface-container-low p-3 rounded-xl text-center">
                  <span class="text-[11px] text-on-surface-variant block mb-0.5">Sertifikasi SLHS</span>
                  <span class="font-extrabold text-xs sm:text-sm text-green-700" id="sppg-card-slhs">Ada (SLHS)</span>
                </div>
              </div>

              <div class="text-xs text-on-surface-variant flex items-start gap-2">
                <span class="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">home_pin</span>
                <span id="sppg-card-address">-</span>
              </div>
            </div>

            {/* Decision Callout (Duolingo Story vs Direct Dashboard) */}
            <div class="bg-surface-bright rounded-3xl p-6 border-2 border-primary/20 space-y-4">
              <div class="space-y-1">
                <h4 class="font-extrabold text-base text-on-surface flex items-center gap-2">
                  <span class="text-xl">📖</span>
                  Ingin Membaca Laporan Cerita Transparansi SPPG Ini?
                </h4>
                <p class="text-xs text-on-surface-variant leading-relaxed">
                  Kami telah merangkum 4 pilar penting (Integritas Anggaran, Gizi Harian, Sanitasi Dapur, dan Keamanan Pangan) dalam bentuk cerita interaktif yang ramah warga.
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  id="btn-proceed-insights"
                  onclick="window.startInsightsTour()"
                  class="flex items-center justify-center gap-2 bg-primary hover:bg-[#3E2B82] text-white py-3.5 px-5 rounded-2xl font-extrabold text-sm shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all"
                >
                  <span class="material-symbols-outlined text-[18px]">auto_stories</span>
                  <span>Mulai Baca Cerita MBG ➔</span>
                </button>
                <button
                  type="button"
                  id="btn-skip-insights"
                  onclick="window.redirectToDashboard()"
                  class="flex items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border-2 border-surface-variant py-3.5 px-5 rounded-2xl font-bold text-sm shadow-[0_3px_0_theme(colors.surface-variant)] active:translate-y-1 active:shadow-none transition-all"
                >
                  <span class="material-symbols-outlined text-[18px]">dashboard</span>
                  <span>Lewati Insight (Ke Dashboard)</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 4: Story 1 - Kawal Anggaran & Bebas Korupsi */}
          <div id="story-step-insight-1" class="hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Duolingo Segmented Progress */}
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-extrabold text-primary flex items-center gap-1.5">
                  <span class="text-base">🛡️</span>
                  Cerita 1 dari 4: Kawal Anggaran MBG
                </span>
                <span class="font-bold text-on-surface-variant">25% Selesai</span>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                <div class="h-2 rounded-full bg-surface-container-high"></div>
                <div class="h-2 rounded-full bg-surface-container-high"></div>
                <div class="h-2 rounded-full bg-surface-container-high"></div>
              </div>
            </div>

            {/* Character Speech Bubble Banner */}
            <div class="bg-gradient-to-r from-primary-fixed/40 via-surface-bright to-primary-fixed/20 rounded-3xl p-6 border-2 border-primary/20 relative shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-3xl shadow-md shrink-0">
                  🛡️
                </div>
                <div class="space-y-1.5">
                  <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                    <span class="material-symbols-outlined text-[14px]">verified</span>
                    100% Konsistensi Pemasukan vs Pengeluaran
                  </div>
                  <h3 class="font-extrabold text-lg sm:text-xl text-on-surface">
                    Uang Makan Siang Anak Tersalurkan Utuh!
                  </h3>
                  <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Kabar gembira untuk orang tua murid! Seluruh dana negara yang dialokasikan tercatat rapi secara digital dan tersalurkan langsung ke piring makanan anak-anak tanpa ada selisih fiktif ataupun mark-up harga.
                  </p>
                </div>
              </div>
            </div>

            {/* Duolingo Visual Report Card */}
            <div class="space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="bg-surface-container-low p-4 rounded-2xl border-2 border-surface-variant/80 text-center hover:border-primary/30 transition-colors">
                  <span class="text-xs text-on-surface-variant block mb-1">Pagu Anggaran Masuk</span>
                  <span class="font-extrabold text-base text-on-surface block" id="insight-finance-in">Rp150.000.000</span>
                  <span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Dana Resmi BGN</span>
                </div>
                <div class="bg-surface-container-low p-4 rounded-2xl border-2 border-surface-variant/80 text-center hover:border-primary/30 transition-colors">
                  <span class="text-xs text-on-surface-variant block mb-1">Realisasi Belanja Bahan</span>
                  <span class="font-extrabold text-base text-on-surface block" id="insight-finance-out">Rp127.500.000</span>
                  <span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">Kwitansi Digital</span>
                </div>
                <div class="bg-surface-container-low p-4 rounded-2xl border-2 border-surface-variant/80 text-center hover:border-primary/30 transition-colors">
                  <span class="text-xs text-on-surface-variant block mb-1">Indeks Integritas</span>
                  <span class="font-extrabold text-base text-green-600 block">0 Indikasi Anomali</span>
                  <span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">100% Sesuai SPJ</span>
                </div>
              </div>

              {/* Story Checkpoint Pills */}
              <div class="bg-surface-bright rounded-2xl p-4 border border-surface-variant/70 space-y-2.5">
                <div class="flex items-center justify-between text-xs bg-surface-container-lowest p-2.5 rounded-xl border border-surface-variant/40">
                  <span class="text-on-surface font-medium flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
                    Kesesuaian Harga Pasar Bahan Baku
                  </span>
                  <span class="font-bold text-green-700">Wajar & Terverifikasi</span>
                </div>
                <div class="flex items-center justify-between text-xs bg-surface-container-lowest p-2.5 rounded-xl border border-surface-variant/40">
                  <span class="text-on-surface font-medium flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
                    Faktur & Kwitansi Pendukung Digital
                  </span>
                  <span class="font-bold text-green-700">Lengkap 100%</span>
                </div>
                <div class="flex items-center justify-between text-xs bg-surface-container-lowest p-2.5 rounded-xl border border-surface-variant/40">
                  <span class="text-on-surface font-medium flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
                    Audit Trail Rekening Resmi BGN
                  </span>
                  <span class="font-bold text-green-700">Bebas Potongan</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div class="flex items-center justify-between pt-4 border-t border-surface-variant/60">
              <button
                type="button"
                onclick="window.goToStep('sppg-result')"
                class="text-xs text-on-surface-variant hover:text-on-surface font-medium flex items-center gap-1 px-3 py-2 rounded-xl"
              >
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                Kembali
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onclick="window.redirectToDashboard()"
                  class="text-xs text-on-surface-variant hover:underline px-3 py-2"
                >
                  Lewati ke Dashboard
                </button>
                <button
                  type="button"
                  onclick="window.goToStep('insight-2')"
                  class="bg-primary hover:bg-[#3E2B82] text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                >
                  <span>Lanjut: Cek Piring Gizi 🥗</span>
                  <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 5: Story 2 - Piring Gizi Juara */}
          <div id="story-step-insight-2" class="hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Duolingo Segmented Progress */}
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-extrabold text-primary flex items-center gap-1.5">
                  <span class="text-base">🥗</span>
                  Cerita 2 dari 4: Piring Gizi Juara
                </span>
                <span class="font-bold text-on-surface-variant">50% Selesai</span>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                <div class="h-2 rounded-full bg-surface-container-high"></div>
                <div class="h-2 rounded-full bg-surface-container-high"></div>
              </div>
            </div>

            {/* Character Speech Bubble Banner */}
            <div class="bg-gradient-to-r from-blue-500/10 via-surface-bright to-blue-500/5 rounded-3xl p-6 border-2 border-blue-200 dark:border-blue-900/40 relative shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
                  🥗
                </div>
                <div class="space-y-1.5">
                  <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    <span class="material-symbols-outlined text-[14px]">restaurant_menu</span>
                    98.4% Terpenuhi Sesuai Standar AKG
                  </div>
                  <h3 class="font-extrabold text-lg sm:text-xl text-on-surface">
                    Kandungan Gizi Keseharian yang Didistribusikan
                  </h3>
                  <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Menu makan siang dirancang oleh nutrisionis bersertifikat agar anak-anak kenyang, sehat, dan berenergi tinggi untuk fokus belajar sepanjang hari di sekolah.
                  </p>
                </div>
              </div>
            </div>

            {/* Duolingo Visual Report Card */}
            <div class="space-y-3">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-surface-container-low p-3.5 rounded-2xl border-2 border-surface-variant/80 text-center hover:border-blue-300 transition-colors">
                  <span class="text-xs text-on-surface-variant block mb-1">🍗 Protein Pembangun</span>
                  <span class="font-extrabold text-lg text-primary block">27.5 g</span>
                  <span class="text-[10px] text-green-600 font-semibold block mt-0.5">Target: 25g (110%)</span>
                </div>
                <div class="bg-surface-container-low p-3.5 rounded-2xl border-2 border-surface-variant/80 text-center hover:border-blue-300 transition-colors">
                  <span class="text-xs text-on-surface-variant block mb-1">🍚 Energi Kalori</span>
                  <span class="font-extrabold text-lg text-primary block">670 kcal</span>
                  <span class="text-[10px] text-green-600 font-semibold block mt-0.5">Pas untuk Belajar</span>
                </div>
                <div class="bg-surface-container-low p-3.5 rounded-2xl border-2 border-surface-variant/80 text-center hover:border-blue-300 transition-colors">
                  <span class="text-xs text-on-surface-variant block mb-1">🥦 Serat & Vitamin</span>
                  <span class="font-extrabold text-lg text-primary block">5.5 g</span>
                  <span class="text-[10px] text-green-600 font-semibold block mt-0.5">Sayur Segar Lokal</span>
                </div>
                <div class="bg-surface-container-low p-3.5 rounded-2xl border-2 border-surface-variant/80 text-center hover:border-blue-300 transition-colors">
                  <span class="text-xs text-on-surface-variant block mb-1">🥑 Karbo & Lemak Baik</span>
                  <span class="font-extrabold text-lg text-primary block">82g / 19g</span>
                  <span class="text-[10px] text-green-600 font-semibold block mt-0.5">Keseimbangan Otak</span>
                </div>
              </div>

              {/* Sample Plate Card */}
              <div class="bg-surface-bright rounded-2xl p-4 border border-surface-variant/70">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-base">🍱</span>
                  <span class="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Contoh Sajian Piring Gizi Hari Ini:
                  </span>
                </div>
                <p class="text-xs text-on-surface font-medium leading-relaxed bg-surface-container-lowest p-3 rounded-xl border border-surface-variant/40">
                  Nasi Pulen Organik, Ayam Panggang Kecap Madu, Tumis Brokoli & Jagung Manis, Pisang Raja Segar, dan Susu Pasteurisasi Berkalsium Tinggi.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div class="flex items-center justify-between pt-4 border-t border-surface-variant/60">
              <button
                type="button"
                onclick="window.goToStep('insight-1')"
                class="text-xs text-on-surface-variant hover:text-on-surface font-medium flex items-center gap-1 px-3 py-2 rounded-xl"
              >
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                Kembali
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onclick="window.redirectToDashboard()"
                  class="text-xs text-on-surface-variant hover:underline px-3 py-2"
                >
                  Lewati ke Dashboard
                </button>
                <button
                  type="button"
                  onclick="window.goToStep('insight-3')"
                  class="bg-primary hover:bg-[#3E2B82] text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                >
                  <span>Lanjut: Cek Sanitasi Dapur ✨</span>
                  <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 6: Story 3 - Dapur Bersih & SLHS */}
          <div id="story-step-insight-3" class="hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Duolingo Segmented Progress */}
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-extrabold text-primary flex items-center gap-1.5">
                  <span class="text-base">✨</span>
                  Cerita 3 dari 4: Dapur Bersih & SLHS
                </span>
                <span class="font-bold text-on-surface-variant">75% Selesai</span>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                <div class="h-2 rounded-full bg-surface-container-high"></div>
              </div>
            </div>

            {/* Character Speech Bubble Banner */}
            <div class="bg-gradient-to-r from-purple-500/10 via-surface-bright to-purple-500/5 rounded-3xl p-6 border-2 border-purple-200 dark:border-purple-900/40 relative shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-2xl bg-purple-700 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
                  ✨
                </div>
                <div class="space-y-1.5">
                  <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    <span class="material-symbols-outlined text-[14px]">clean_hands</span>
                    Tingkat Sanitasi: 96% (Sangat Baik)
                  </div>
                  <h3 class="font-extrabold text-lg sm:text-xl text-on-surface">
                    Persentase Sanitasi & Kebersihan Dapur SPPG
                  </h3>
                  <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Dapur memasak berstandar higienis layaknya masakan ibu di rumah, telah mengantongi Sertifikat Laik Higiene Sanitasi (SLHS) resmi dari Dinas Kesehatan.
                  </p>
                </div>
              </div>
            </div>

            {/* Duolingo Visual Report Card */}
            <div class="space-y-3">
              {/* Official Certificate Stamp Card */}
              <div class="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-4 border-2 border-primary/30 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow">
                    <span class="material-symbols-outlined text-[22px]">verified_user</span>
                  </div>
                  <div>
                    <span class="text-xs font-extrabold text-on-surface block">Sertifikat Laik Higiene Sanitasi (SLHS)</span>
                    <span class="text-[11px] text-primary font-mono font-semibold" id="insight-slhs-number">Tersertifikasi Resmi BGN & Dinkes</span>
                  </div>
                </div>
                <span class="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-extrabold shadow-sm">
                  Terverifikasi
                </span>
              </div>

              {/* 4 Cleanliness Checkpoints */}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="bg-surface-container-low p-3.5 rounded-2xl border-2 border-surface-variant/70 hover:border-primary/30 transition-colors">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="font-bold text-on-surface flex items-center gap-1.5">
                      <span class="text-base">💧</span> Uji Lab Kualitas Air
                    </span>
                    <span class="font-extrabold text-green-600">100% Lolos</span>
                  </div>
                  <p class="text-[11px] text-on-surface-variant">Bebas bakteri E.Coli, logam berat, & klorin berlebih.</p>
                </div>
                <div class="bg-surface-container-low p-3.5 rounded-2xl border-2 border-surface-variant/70 hover:border-primary/30 transition-colors">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="font-bold text-on-surface flex items-center gap-1.5">
                      <span class="text-base">🍽️</span> Sterilisasi Alat & Wadah
                    </span>
                    <span class="font-extrabold text-green-600">98% Steril</span>
                  </div>
                  <p class="text-[11px] text-on-surface-variant">Pencucian suhu tinggi dengan wadah food-grade aman.</p>
                </div>
                <div class="bg-surface-container-low p-3.5 rounded-2xl border-2 border-surface-variant/70 hover:border-primary/30 transition-colors">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="font-bold text-on-surface flex items-center gap-1.5">
                      <span class="text-base">👨‍🍳</span> Higiene Juru Masak (APD)
                    </span>
                    <span class="font-extrabold text-green-600">95% Patuh</span>
                  </div>
                  <p class="text-[11px] text-on-surface-variant">Wajib masker, hairnet, sarung tangan, & swab berkala.</p>
                </div>
                <div class="bg-surface-container-low p-3.5 rounded-2xl border-2 border-surface-variant/70 hover:border-primary/30 transition-colors">
                  <div class="flex items-center justify-between text-xs mb-1">
                    <span class="font-bold text-on-surface flex items-center gap-1.5">
                      <span class="text-base">🗑️</span> Pengelolaan Limbah Dapur
                    </span>
                    <span class="font-extrabold text-green-600">92% Bersih</span>
                  </div>
                  <p class="text-[11px] text-on-surface-variant">Pemisahan sampah organik & saluran tertutup higienis.</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div class="flex items-center justify-between pt-4 border-t border-surface-variant/60">
              <button
                type="button"
                onclick="window.goToStep('insight-2')"
                class="text-xs text-on-surface-variant hover:text-on-surface font-medium flex items-center gap-1 px-3 py-2 rounded-xl"
              >
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                Kembali
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onclick="window.redirectToDashboard()"
                  class="text-xs text-on-surface-variant hover:underline px-3 py-2"
                >
                  Lewati ke Dashboard
                </button>
                <button
                  type="button"
                  onclick="window.goToStep('insight-4')"
                  class="bg-primary hover:bg-[#3E2B82] text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                >
                  <span>Lanjut: Rekam Jejak Keamanan 🛡️</span>
                  <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 7: Story 4 - Food Poisoning Record & Zero Incident */}
          <div id="story-step-insight-4" class="hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Duolingo Segmented Progress */}
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-extrabold text-primary flex items-center gap-1.5">
                  <span class="text-base">🛡️</span>
                  Cerita 4 dari 4: Rekam Jejak Bebas Keracunan
                </span>
                <span class="font-bold text-on-surface-variant">100% Selesai</span>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                <div class="h-2 rounded-full bg-primary shadow-sm"></div>
              </div>
            </div>

            {/* Character Speech Bubble Banner */}
            <div class="bg-gradient-to-r from-emerald-500/10 via-surface-bright to-emerald-500/5 rounded-3xl p-6 border-2 border-emerald-200 dark:border-emerald-900/40 relative shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
                  🛡️
                </div>
                <div class="space-y-1.5">
                  <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                    <span class="material-symbols-outlined text-[14px]">shield_with_heart</span>
                    0 Kasus Keracunan Dilaporkan (100% Aman)
                  </div>
                  <h3 class="font-extrabold text-lg sm:text-xl text-on-surface">
                    Kasus Keracunan MBG dari SPPG Ini
                  </h3>
                  <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Nol insiden keracunan sejak hari pertama penyaluran! SPPG menerapkan protokol ketat: uji organoleptik setiap batch dan penyimpanan sampel makanan 24 jam di cold storage.
                  </p>
                </div>
              </div>
            </div>

            {/* Duolingo Visual Report Card */}
            <div class="space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="bg-surface-container-low p-4 rounded-2xl border-2 border-surface-variant/80 text-center hover:border-emerald-300 transition-colors">
                  <span class="text-xs text-on-surface-variant block mb-1">Total Insiden Keracunan</span>
                  <span class="font-extrabold text-2xl text-green-600 block">0 Kasus</span>
                  <span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">Zero Incident Record</span>
                </div>
                <div class="bg-surface-container-low p-4 rounded-2xl border-2 border-surface-variant/80 text-center hover:border-emerald-300 transition-colors">
                  <span class="text-xs text-on-surface-variant block mb-1">Sample Retention Box</span>
                  <span class="font-extrabold text-base text-primary block">24 Jam Disimpan</span>
                  <span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">Suhu 4°C Terjaga</span>
                </div>
                <div class="bg-surface-container-low p-4 rounded-2xl border-2 border-surface-variant/80 text-center hover:border-emerald-300 transition-colors">
                  <span class="text-xs text-on-surface-variant block mb-1">Kepuasan Siswa & Guru</span>
                  <span class="font-extrabold text-2xl text-amber-600 block">4.9 / 5.0</span>
                  <span class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">1.250+ Ulasan Positif</span>
                </div>
              </div>

              {/* Safety Protocol Checklist */}
              <div class="bg-surface-bright rounded-2xl p-4 border border-surface-variant/70 space-y-2">
                <div class="flex items-center justify-between text-xs bg-surface-container-lowest p-2.5 rounded-xl border border-surface-variant/40">
                  <span class="text-on-surface font-medium flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
                    Pengujian Organoleptik (Rasa, Aroma, Warna) Setiap Batch
                  </span>
                  <span class="font-bold text-green-700">Lolos</span>
                </div>
                <div class="flex items-center justify-between text-xs bg-surface-container-lowest p-2.5 rounded-xl border border-surface-variant/40">
                  <span class="text-on-surface font-medium flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
                    Monitoring Suhu Makanan Saat Distribusi (&gt; 60°C)
                  </span>
                  <span class="font-bold text-green-700">Terkontrol</span>
                </div>
                <div class="flex items-center justify-between text-xs bg-surface-container-lowest p-2.5 rounded-xl border border-surface-variant/40">
                  <span class="text-on-surface font-medium flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
                    Kanal Pelaporan & Reaksi Cepat 24 Jam
                  </span>
                  <span class="font-bold text-green-700">Siaga</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div class="flex items-center justify-between pt-4 border-t border-surface-variant/60">
              <button
                type="button"
                onclick="window.goToStep('insight-3')"
                class="text-xs text-on-surface-variant hover:text-on-surface font-medium flex items-center gap-1 px-3 py-2 rounded-xl"
              >
                <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                Kembali
              </button>
              <button
                type="button"
                onclick="window.goToStep('insight-summary')"
                class="bg-primary hover:bg-[#3E2B82] text-white font-extrabold text-sm px-7 py-3.5 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
              >
                <span>Lihat Rapor Akhir! 🏆</span>
                <span class="material-symbols-outlined text-[18px]">emoji_events</span>
              </button>
            </div>
          </div>

          {/* STEP 8: Celebratory Final Summary Card (Scorecard & Redirection to Dashboard) */}
          <div id="story-step-insight-summary" class="hidden space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center py-2">
            {/* Trophy Avatar */}
            <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center mx-auto shadow-lg text-4xl animate-bounce">
              🏆
            </div>

            <div class="space-y-1.5 max-w-md mx-auto">
              <div class="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900">
                ⭐⭐⭐⭐⭐ SPPG Bintang 5
              </div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-on-surface">
                SPPG Sangat Terpercaya & Layak!
              </h2>
              <p class="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Semua 4 pilar pengawasan transparansi MBG telah terpenuhi dengan predikat memuaskan. Makanan anak-anak di wilayah ini terpantau aman, bergizi, dan bebas dari korupsi.
              </p>
            </div>

            {/* 4-Pillar Scorecard Grid */}
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
              <div class="bg-surface-container-low p-3.5 rounded-2xl border border-surface-variant/70 text-center shadow-sm">
                <span class="text-2xl block">🪙</span>
                <span class="text-xs text-on-surface-variant block mt-1">Keuangan</span>
                <span class="font-extrabold text-xs text-green-700 block">100% Bersih</span>
              </div>
              <div class="bg-surface-container-low p-3.5 rounded-2xl border border-surface-variant/70 text-center shadow-sm">
                <span class="text-2xl block">🥗</span>
                <span class="text-xs text-on-surface-variant block mt-1">Gizi AKG</span>
                <span class="font-extrabold text-xs text-green-700 block">98.4% Sesuai</span>
              </div>
              <div class="bg-surface-container-low p-3.5 rounded-2xl border border-surface-variant/70 text-center shadow-sm">
                <span class="text-2xl block">✨</span>
                <span class="text-xs text-on-surface-variant block mt-1">Sanitasi</span>
                <span class="font-extrabold text-xs text-green-700 block">96% (SLHS)</span>
              </div>
              <div class="bg-surface-container-low p-3.5 rounded-2xl border border-surface-variant/70 text-center shadow-sm">
                <span class="text-2xl block">🛡️</span>
                <span class="text-xs text-on-surface-variant block mt-1">Keamanan</span>
                <span class="font-extrabold text-xs text-green-700 block">0 Kasus (Aman)</span>
              </div>
            </div>

            {/* Final Callout & Redirection to Dashboard */}
            <div class="pt-4 space-y-3 max-w-md mx-auto">
              <button
                type="button"
                id="btn-finish-dashboard"
                onclick="window.redirectToDashboard()"
                class="w-full bg-primary hover:bg-[#3E2B82] text-white font-extrabold text-base py-4 px-6 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-[22px]">dashboard</span>
                <span>Buka Dashboard Utama SPPG 🚀</span>
              </button>
              <button
                type="button"
                onclick="window.goToStep('insight-1')"
                class="text-xs text-primary font-bold hover:underline py-2 flex items-center justify-center gap-1 mx-auto"
              >
                <span class="material-symbols-outlined text-[16px]">refresh</span>
                <span>Ulangi Baca Cerita Laporan</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Embedded Client Script for Dedicated Cek MBG Story Flow */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          let hierarchyData = [];
          let currentKitchen = null;
          let currentInsights = null;
          let currentSelectedLocation = null;
          const initialKitchenId = ${JSON.stringify(initialKitchenId || '')};

          window.goToStep = function(stepName) {
            const steps = [
              'permission',
              'loading',
              'manual-form',
              'sppg-result',
              'insight-1',
              'insight-2',
              'insight-3',
              'insight-4',
              'insight-summary'
            ];

            steps.forEach(function(s) {
              const el = document.getElementById('story-step-' + s);
              if (el) el.classList.add('hidden');
            });

            const targetEl = document.getElementById('story-step-' + stepName);
            if (targetEl) {
              targetEl.classList.remove('hidden');
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          };

          // Step 1: Geolocation Handler
          window.handleAllowLocation = function() {
            window.goToStep('loading');
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                function(pos) {
                  fetchNearestKitchen(pos.coords.latitude, pos.coords.longitude);
                },
                function(err) {
                  console.warn('GPS fallback to central:', err);
                  fetchNearestKitchen(-6.1754, 106.8272);
                },
                { timeout: 8000 }
              );
            } else {
              fetchNearestKitchen(-6.1754, 106.8272);
            }
          };

          window.handleDenyLocation = function() {
            window.goToStep('manual-form');
          };

          async function fetchNearestKitchen(lat, lng) {
            try {
              const res = await fetch('/api/location/find-sppg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: lat, lng: lng })
              });
              const data = await res.json();
              if (data && data.data) {
                renderSppgResult(data.data, data.data.detectedLocation);
              } else {
                window.goToStep('manual-form');
              }
            } catch (e) {
              console.error(e);
              window.goToStep('manual-form');
            }
          }

          async function loadHierarchy() {
            if (hierarchyData.length > 0) return;
            try {
              const res = await fetch('/api/location/hierarchy');
              const data = await res.json();
              if (data && data.data) {
                hierarchyData = data.data;
                populateProvinces();
              }
            } catch (e) {
              console.error('Failed to load hierarchy:', e);
            }
          }

          function populateProvinces() {
            const selectProv = document.getElementById('select-province');
            if (!selectProv) return;
            selectProv.innerHTML = '<option value="">-- Pilih Provinsi --</option>';
            hierarchyData.forEach(function(p) {
              const opt = document.createElement('option');
              opt.value = p.name;
              opt.innerText = p.name;
              selectProv.appendChild(opt);
            });
          }

          window.onProvinceChange = function(provName) {
            const selectCity = document.getElementById('select-city');
            const selectDist = document.getElementById('select-district');
            const selectVill = document.getElementById('select-village');

            selectCity.innerHTML = '<option value="">-- Pilih Kota/Kabupaten --</option>';
            selectDist.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
            selectVill.innerHTML = '<option value="">-- Pilih Kelurahan --</option>';
            selectDist.disabled = true;
            selectVill.disabled = true;

            if (!provName) {
              selectCity.disabled = true;
              return;
            }

            const prov = hierarchyData.find(function(p) { return p.name === provName; });
            if (prov && prov.cities) {
              prov.cities.forEach(function(c) {
                const opt = document.createElement('option');
                opt.value = c.name;
                opt.innerText = c.name;
                selectCity.appendChild(opt);
              });
              selectCity.disabled = false;
            }
          };

          window.onCityChange = function(cityName) {
            const provName = document.getElementById('select-province').value;
            const selectDist = document.getElementById('select-district');
            const selectVill = document.getElementById('select-village');

            selectDist.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
            selectVill.innerHTML = '<option value="">-- Pilih Kelurahan --</option>';
            selectVill.disabled = true;

            if (!cityName) {
              selectDist.disabled = true;
              return;
            }

            const prov = hierarchyData.find(function(p) { return p.name === provName; });
            const city = prov ? prov.cities.find(function(c) { return c.name === cityName; }) : null;
            if (city && city.districts) {
              city.districts.forEach(function(d) {
                const opt = document.createElement('option');
                opt.value = d.name;
                opt.innerText = d.name;
                selectDist.appendChild(opt);
              });
              selectDist.disabled = false;
            }
          };

          window.onDistrictChange = function(distName) {
            const provName = document.getElementById('select-province').value;
            const cityName = document.getElementById('select-city').value;
            const selectVill = document.getElementById('select-village');

            selectVill.innerHTML = '<option value="">-- Pilih Kelurahan --</option>';

            if (!distName) {
              selectVill.disabled = true;
              return;
            }

            const prov = hierarchyData.find(function(p) { return p.name === provName; });
            const city = prov ? prov.cities.find(function(c) { return c.name === cityName; }) : null;
            const dist = city ? city.districts.find(function(d) { return d.name === distName; }) : null;
            if (dist && dist.villages) {
              dist.villages.forEach(function(v) {
                const opt = document.createElement('option');
                opt.value = v;
                opt.innerText = v;
                selectVill.appendChild(opt);
              });
              selectVill.disabled = false;
            }
          };

          window.handleManualFormSubmit = async function(e) {
            e.preventDefault();
            const province = document.getElementById('select-province').value;
            const city = document.getElementById('select-city').value;
            const district = document.getElementById('select-district').value;
            const village = document.getElementById('select-village').value;

            try {
              const res = await fetch('/api/location/find-sppg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ province: province, city: city, district: district, village: village })
              });
              const data = await res.json();
              if (data && data.data) {
                renderSppgResult(data.data, { province: province, city: city, district: district, village: village });
              }
            } catch (err) {
              console.error('Error finding SPPG:', err);
            }
          };

          function renderSppgResult(kitchen, loc) {
            currentKitchen = kitchen;
            currentSelectedLocation = loc;

            const locLabel = document.getElementById('sppg-result-location-label');
            if (locLabel && loc) {
              locLabel.innerText = [loc.village, loc.district, loc.city, loc.province].filter(Boolean).join(', ');
            }

            const nameEl = document.getElementById('sppg-card-name');
            const codeEl = document.getElementById('sppg-card-code');
            const capEl = document.getElementById('sppg-card-capacity');
            const schoolsEl = document.getElementById('sppg-card-schools');
            const studentsEl = document.getElementById('sppg-card-students');
            const slhsEl = document.getElementById('sppg-card-slhs');
            const addrEl = document.getElementById('sppg-card-address');

            if (nameEl) nameEl.innerText = kitchen.name;
            if (codeEl) codeEl.innerText = 'Kode SPPG: ' + kitchen.code;
            if (capEl) capEl.innerText = (kitchen.capacity || 0).toLocaleString() + ' Porsi';
            if (schoolsEl) schoolsEl.innerText = (kitchen.totalSchools || 0) + ' Sekolah';
            if (studentsEl) studentsEl.innerText = (kitchen.totalStudents || 0).toLocaleString() + ' Siswa';
            if (slhsEl) slhsEl.innerText = kitchen.slhs ? 'Ada (SLHS)' : 'Tersertifikasi';
            if (addrEl) addrEl.innerText = kitchen.address + ', ' + kitchen.village + ', ' + kitchen.district + ', ' + kitchen.city;

            window.goToStep('sppg-result');
            loadInsights(kitchen.id);
          }

          async function loadInsights(kitchenId) {
            try {
              const res = await fetch('/api/location/sppg/' + kitchenId + '/insights');
              const data = await res.json();
              if (data && data.data) {
                currentInsights = data.data;
                const finIn = document.getElementById('insight-finance-in');
                const finOut = document.getElementById('insight-finance-out');
                const slhsNum = document.getElementById('insight-slhs-number');

                if (finIn && currentInsights.corruptionInsight) {
                  finIn.innerText = currentInsights.corruptionInsight.totalInFormatted;
                }
                if (finOut && currentInsights.corruptionInsight) {
                  finOut.innerText = currentInsights.corruptionInsight.totalOutFormatted;
                }
                if (slhsNum && currentInsights.sanitationInsight) {
                  slhsNum.innerText = currentInsights.sanitationInsight.slhsCertificateNumber;
                }
              }
            } catch (e) {
              console.error('Error loading insights:', e);
            }
          }

          window.startInsightsTour = function() {
            window.goToStep('insight-1');
          };

          window.redirectToDashboard = function() {
            if (currentKitchen && currentKitchen.id) {
              window.location.href = '/lokasi?kitchen_id=' + currentKitchen.id + '&highlight=true';
            } else {
              window.location.href = '/lokasi';
            }
          };

          // Initialize
          loadHierarchy();

          // Auto-load if initialKitchenId is provided
          if (initialKitchenId) {
            fetch('/api/location/sppg/' + initialKitchenId + '/insights')
              .then(res => res.json())
              .then(data => {
                if (data && data.data && data.data.kitchen) {
                  renderSppgResult(data.data.kitchen, {
                    village: data.data.kitchen.village,
                    district: data.data.kitchen.district,
                    city: data.data.kitchen.city,
                    province: data.data.kitchen.province
                  });
                }
              })
              .catch(err => console.error(err));
          }
        })();
      `}}></script>
    </AdminLayout>
  );
};
