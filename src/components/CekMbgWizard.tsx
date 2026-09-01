import type { FC } from 'hono/jsx';

export const CekMbgWizard: FC = () => {
  return (
    <div id="cek-mbg-wizard-root">
      {/* Hero Banner with Cek MBG Trigger Button */}
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[#5B43B2] to-[#3B2880] p-6 md:p-8 text-white shadow-lg mb-8">
        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm mb-3">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
            <span>Transparansi Satuan Pelayanan Pemenuhan Gizi (SPPG)</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Cek SPPG & Kualitas MBG di Wilayah Anda
          </h2>
          <p class="text-white/80 text-sm md:text-base leading-relaxed mb-6">
            Temukan dapur SPPG yang melayani sekolah anak Anda, cek pemenuhan gizi harian, persentase kebersihan & sanitasi, rekam jejak keamanan pangan, serta transparansi keuangan bebas korupsi.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <button
              id="btn-trigger-cek-mbg"
              onclick="window.location.href='/cek-mbg'"
              class="inline-flex items-center gap-2 bg-white text-primary hover:bg-white/90 active:scale-95 font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-200 text-sm md:text-base"
            >
              <span class="material-symbols-outlined text-[20px]">location_searching</span>
              Cek MBG Sekarang
            </button>
            <span class="text-xs text-white/70 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-green-300">verified</span>
              Data Real-Time Terverifikasi BGN
            </span>
          </div>
        </div>

        {/* Decorative background vectors */}
        <div class="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div class="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 opacity-20 pointer-events-none">
          <span class="material-symbols-outlined text-9xl">health_and_safety</span>
        </div>
      </div>

      {/* Main Guided Modal */}
      <div
        id="cek-mbg-modal"
        class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        onclick="if(event.target === this) window.closeCekMbgModal()"
      >
        <div class="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-surface-variant flex flex-col my-8 transition-all animate-in fade-in zoom-in-95 duration-200">
          
          {/* Modal Header */}
          <div class="p-5 border-b border-surface-variant/80 flex items-center justify-between bg-surface-bright/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[22px]">health_and_safety</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold" id="wizard-modal-title">
                  Cek MBG & SPPG
                </h3>
                <p class="font-body-sm text-body-sm text-on-surface-variant" id="wizard-modal-subtitle">
                  Panduan interaktif pengecekan SPPG wilayah Anda
                </p>
              </div>
            </div>
            <button
              onclick="window.closeCekMbgModal()"
              class="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              title="Tutup"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Wizard Body Container */}
          <div class="p-6 md:p-8 flex-1 overflow-y-auto max-h-[75vh]">
            
            {/* STEP 1: Geolocation Permission Decision */}
            <div id="wizard-step-permission" class="space-y-6">
              <div class="text-center max-w-lg mx-auto py-2">
                <div class="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <span class="material-symbols-outlined text-3xl">near_me</span>
                </div>
                <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">
                  Izinkan Akses Lokasi?
                </h4>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Untuk menampilkan Satuan Pelayanan Pemenuhan Gizi (SPPG) yang melayani kelurahan Anda secara otomatis, izinkan peramban mendeteksi lokasi saat ini.
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  id="btn-allow-location"
                  onclick="window.handleAllowLocation()"
                  class="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-on-primary py-3.5 px-5 rounded-xl font-semibold shadow-md active:scale-95 transition-all text-sm md:text-base"
                >
                  <span class="material-symbols-outlined text-[20px]">my_location</span>
                  Ya, Izinkan Lokasi
                </button>
                <button
                  type="button"
                  id="btn-deny-location"
                  onclick="window.handleDenyLocation()"
                  class="flex items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-surface-variant py-3.5 px-5 rounded-xl font-medium active:scale-95 transition-all text-sm md:text-base"
                >
                  <span class="material-symbols-outlined text-[20px]">edit_location_alt</span>
                  Tidak, Pilih Manual
                </button>
              </div>

              <div class="bg-surface-bright rounded-xl p-4 border border-surface-variant/60 flex items-start gap-3 text-xs text-on-surface-variant">
                <span class="material-symbols-outlined text-primary text-[18px] mt-0.5">lock</span>
                <span>Data lokasi hanya digunakan dalam sesi ini untuk menemukan SPPG di sekitar Anda dan tidak disimpan secara permanen.</span>
              </div>
            </div>

            {/* STEP 2A: Geolocation Loading Screen */}
            <div id="wizard-step-loading" class="hidden py-8 flex flex-col items-center justify-center text-center space-y-6">
              <div class="relative flex items-center justify-center w-24 h-24">
                <div class="absolute w-24 h-24 rounded-full bg-primary/20 animate-ping"></div>
                <div class="absolute w-16 h-16 rounded-full bg-primary/40 animate-pulse"></div>
                <div class="relative w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                  <span class="material-symbols-outlined text-2xl animate-spin">sync</span>
                </div>
              </div>
              <div class="space-y-2">
                <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Mencari SPPG di sekitar Anda...
                </h4>
                <p class="font-body-sm text-body-sm text-primary font-medium">
                  "Find SPPG around you"
                </p>
                <p class="font-body-sm text-body-sm text-on-surface-variant max-w-sm mx-auto">
                  Sedang mendeteksi kelurahan terdekat dan mencocokkan dapur pelayanan gizi resmi...
                </p>
              </div>
            </div>

            {/* STEP 2B: Manual Hierarchical Selection Form */}
            <div id="wizard-step-manual-form" class="hidden space-y-5">
              <div class="flex items-center justify-between pb-2 border-b border-surface-variant/60">
                <div>
                  <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Pilih Wilayah Anda
                  </h4>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">
                    Hierarki bertingkat: Provinsi &rarr; Kabupaten/Kota &rarr; Kecamatan &rarr; Kelurahan
                  </p>
                </div>
                <button
                  type="button"
                  onclick="window.goToStep('permission')"
                  class="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[14px]">arrow_back</span>
                  Kembali
                </button>
              </div>

              <form id="form-location-hierarchy" onsubmit="window.handleManualFormSubmit(event)" class="space-y-4">
                <div>
                  <label class="block font-label-md text-label-md text-on-surface mb-1.5">
                    1. Provinsi <span class="text-error">*</span>
                  </label>
                  <select
                    id="select-province"
                    class="w-full bg-surface-container-low border border-surface-variant rounded-xl px-4 py-2.5 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    onchange="window.onProvinceChange(this.value)"
                    required
                  >
                    <option value="">-- Pilih Provinsi --</option>
                  </select>
                </div>

                <div>
                  <label class="block font-label-md text-label-md text-on-surface mb-1.5">
                    2. Kabupaten / Kota <span class="text-error">*</span>
                  </label>
                  <select
                    id="select-city"
                    class="w-full bg-surface-container-low border border-surface-variant rounded-xl px-4 py-2.5 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                    onchange="window.onCityChange(this.value)"
                    disabled
                    required
                  >
                    <option value="">-- Pilih Kota/Kabupaten --</option>
                  </select>
                </div>

                <div>
                  <label class="block font-label-md text-label-md text-on-surface mb-1.5">
                    3. Kecamatan <span class="text-error">*</span>
                  </label>
                  <select
                    id="select-district"
                    class="w-full bg-surface-container-low border border-surface-variant rounded-xl px-4 py-2.5 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                    onchange="window.onDistrictChange(this.value)"
                    disabled
                    required
                  >
                    <option value="">-- Pilih Kecamatan --</option>
                  </select>
                </div>

                <div>
                  <label class="block font-label-md text-label-md text-on-surface mb-1.5">
                    4. Kelurahan <span class="text-error">*</span>
                  </label>
                  <select
                    id="select-village"
                    class="w-full bg-surface-container-low border border-surface-variant rounded-xl px-4 py-2.5 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                    disabled
                    required
                  >
                    <option value="">-- Pilih Kelurahan --</option>
                  </select>
                </div>

                <div class="pt-2">
                  <button
                    type="submit"
                    id="btn-submit-manual-location"
                    class="w-full bg-primary hover:bg-primary/90 text-on-primary py-3 px-5 rounded-xl font-semibold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span class="material-symbols-outlined text-[18px]">search</span>
                    Tampilkan SPPG Kelurahan Ini
                  </button>
                </div>
              </form>
            </div>

            {/* STEP 3: Show SPPG at that Kelurahan */}
            <div id="wizard-step-sppg-result" class="hidden space-y-6">
              <div class="bg-surface-bright rounded-xl p-4 border border-surface-variant/60 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[20px]">location_on</span>
                  <div>
                    <span class="text-xs text-on-surface-variant block">Wilayah Terdeteksi / Dipilih:</span>
                    <span class="font-bold text-sm text-on-surface" id="sppg-result-location-label">-</span>
                  </div>
                </div>
                <button
                  type="button"
                  onclick="window.goToStep('manual-form')"
                  class="text-xs text-primary hover:underline font-medium"
                >
                  Ubah Lokasi
                </button>
              </div>

              {/* SPPG Card */}
              <div class="bg-surface-container-lowest rounded-2xl border-2 border-primary/20 p-5 shadow-sm space-y-4">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-tertiary-container/10 text-tertiary mb-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      <span>SPPG Aktif Melayani Wilayah Ini</span>
                    </div>
                    <h3 class="font-headline-md text-headline-md font-bold text-primary" id="sppg-card-name">
                      Dapur MBG
                    </h3>
                    <p class="font-body-sm text-body-sm text-on-surface-variant font-mono" id="sppg-card-code">
                      KODE-001
                    </p>
                  </div>
                  <div class="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                    <span class="material-symbols-outlined text-2xl">restaurant</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-surface-variant/60">
                  <div class="bg-surface-container-low p-3 rounded-lg text-center">
                    <span class="text-[11px] text-on-surface-variant block mb-0.5">Kapasitas Porsi</span>
                    <span class="font-bold text-sm text-on-surface" id="sppg-card-capacity">-</span>
                  </div>
                  <div class="bg-surface-container-low p-3 rounded-lg text-center">
                    <span class="text-[11px] text-on-surface-variant block mb-0.5">Sekolah Binaan</span>
                    <span class="font-bold text-sm text-on-surface" id="sppg-card-schools">-</span>
                  </div>
                  <div class="bg-surface-container-low p-3 rounded-lg text-center">
                    <span class="text-[11px] text-on-surface-variant block mb-0.5">Siswa Terlayani</span>
                    <span class="font-bold text-sm text-on-surface" id="sppg-card-students">-</span>
                  </div>
                  <div class="bg-surface-container-low p-3 rounded-lg text-center">
                    <span class="text-[11px] text-on-surface-variant block mb-0.5">Sertifikasi SLHS</span>
                    <span class="font-bold text-sm text-tertiary" id="sppg-card-slhs">Ada</span>
                  </div>
                </div>

                <div class="text-xs text-on-surface-variant flex items-start gap-2">
                  <span class="material-symbols-outlined text-[16px] text-on-surface-variant mt-0.5">home_pin</span>
                  <span id="sppg-card-address">-</span>
                </div>
              </div>

              {/* Skip Insights Decision Box (Flowchart Node: Skip insights?) */}
              <div class="bg-surface-container-low rounded-xl p-5 border border-surface-variant space-y-3">
                <h4 class="font-label-md text-label-md font-bold text-on-surface flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[18px]">insights</span>
                  Ingin Memeriksa Rincian Kualitas & Transparansi SPPG?
                </h4>
                <p class="text-xs text-on-surface-variant leading-relaxed">
                  Anda dapat meninjau 4 insight utama (Integritas Keuangan, Keterpenuhan Gizi, Higiene Sanitasi, & Bebas Keracunan) atau langsung menuju Dashboard Utama.
                </p>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    id="btn-proceed-insights"
                    onclick="window.startInsightsTour()"
                    class="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary py-3 px-4 rounded-xl font-semibold shadow-sm active:scale-95 transition-all text-sm"
                  >
                    <span class="material-symbols-outlined text-[18px]">analytics</span>
                    Lihat Rincian Insight
                  </button>
                  <button
                    type="button"
                    id="btn-skip-insights"
                    onclick="window.skipInsightsToDashboard()"
                    class="flex items-center justify-center gap-2 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface border border-surface-variant py-3 px-4 rounded-xl font-medium active:scale-95 transition-all text-sm"
                  >
                    <span class="material-symbols-outlined text-[18px]">dashboard</span>
                    Lewati Insight (Skip)
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 4: Insight 1 - Kawal Anggaran & Bebas Korupsi (Duolingo Story Card 1) */}
            <div id="wizard-step-insight-1" class="hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Duolingo Segmented Story Progress */}
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-primary flex items-center gap-1.5">
                    <span class="text-base">🛡️</span>
                    Cerita 1 dari 4: Kawal Anggaran MBG
                  </span>
                  <span class="font-semibold text-on-surface-variant">25% Selesai</span>
                </div>
                <div class="grid grid-cols-4 gap-2">
                  <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                  <div class="h-2 rounded-full bg-surface-container-high"></div>
                  <div class="h-2 rounded-full bg-surface-container-high"></div>
                  <div class="h-2 rounded-full bg-surface-container-high"></div>
                </div>
              </div>

              {/* Character Speech Bubble Banner */}
              <div class="bg-gradient-to-r from-primary-fixed/40 via-surface-bright to-primary-fixed/20 rounded-2xl p-5 border-2 border-primary/20 relative shadow-sm">
                <div class="flex items-start gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                    🛡️
                  </div>
                  <div class="space-y-1">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                      <span class="material-symbols-outlined text-[14px]">verified</span>
                      100% Konsistensi Pemasukan vs Pengeluaran
                    </div>
                    <h4 class="font-headline-sm text-headline-sm font-extrabold text-on-surface">
                      Uang Makan Siang Anak Tersalurkan Utuh!
                    </h4>
                    <p class="text-xs text-on-surface-variant leading-relaxed">
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

                {/* Duolingo Story Checkpoint Pills */}
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

              {/* Duolingo Action Bar */}
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
                    onclick="window.skipInsightsToDashboard()"
                    class="text-xs text-on-surface-variant hover:underline px-3 py-2"
                  >
                    Lewati ke Dashboard
                  </button>
                  <button
                    type="button"
                    onclick="window.goToStep('insight-2')"
                    class="bg-primary hover:bg-[#3E2B82] text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                  >
                    <span>Lanjut: Cek Piring Gizi 🥗</span>
                    <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 5: Insight 2 - Daily Nutrition Compliance (Duolingo Story Card 2) */}
            <div id="wizard-step-insight-2" class="hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Duolingo Segmented Story Progress */}
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-primary flex items-center gap-1.5">
                    <span class="text-base">🥗</span>
                    Cerita 2 dari 4: Piring Gizi Juara
                  </span>
                  <span class="font-semibold text-on-surface-variant">50% Selesai</span>
                </div>
                <div class="grid grid-cols-4 gap-2">
                  <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                  <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                  <div class="h-2 rounded-full bg-surface-container-high"></div>
                  <div class="h-2 rounded-full bg-surface-container-high"></div>
                </div>
              </div>

              {/* Character Speech Bubble Banner */}
              <div class="bg-gradient-to-r from-blue-500/10 via-surface-bright to-blue-500/5 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-900/40 relative shadow-sm">
                <div class="flex items-start gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                    🥗
                  </div>
                  <div class="space-y-1">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      <span class="material-symbols-outlined text-[14px]">restaurant_menu</span>
                      98.4% Terpenuhi Sesuai Standar AKG
                    </div>
                    <h4 class="font-headline-sm text-headline-sm font-extrabold text-on-surface">
                      Kandungan Gizi Keseharian yang Didistribusikan
                    </h4>
                    <p class="text-xs text-on-surface-variant leading-relaxed">
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

              {/* Duolingo Action Bar */}
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
                    onclick="window.skipInsightsToDashboard()"
                    class="text-xs text-on-surface-variant hover:underline px-3 py-2"
                  >
                    Lewati ke Dashboard
                  </button>
                  <button
                    type="button"
                    onclick="window.goToStep('insight-3')"
                    class="bg-primary hover:bg-[#3E2B82] text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                  >
                    <span>Lanjut: Cek Sanitasi Dapur ✨</span>
                    <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 6: Insight 3 - Sanitation & SLHS Certificate (Duolingo Story Card 3) */}
            <div id="wizard-step-insight-3" class="hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Duolingo Segmented Story Progress */}
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-primary flex items-center gap-1.5">
                    <span class="text-base">✨</span>
                    Cerita 3 dari 4: Dapur Bersih & SLHS
                  </span>
                  <span class="font-semibold text-on-surface-variant">75% Selesai</span>
                </div>
                <div class="grid grid-cols-4 gap-2">
                  <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                  <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                  <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                  <div class="h-2 rounded-full bg-surface-container-high"></div>
                </div>
              </div>

              {/* Character Speech Bubble Banner */}
              <div class="bg-gradient-to-r from-purple-500/10 via-surface-bright to-purple-500/5 rounded-2xl p-5 border-2 border-purple-200 dark:border-purple-900/40 relative shadow-sm">
                <div class="flex items-start gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                    ✨
                  </div>
                  <div class="space-y-1">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      <span class="material-symbols-outlined text-[14px]">clean_hands</span>
                      Tingkat Sanitasi: 96% (Sangat Baik)
                    </div>
                    <h4 class="font-headline-sm text-headline-sm font-extrabold text-on-surface">
                      Persentase Sanitasi & Kebersihan Dapur SPPG
                    </h4>
                    <p class="text-xs text-on-surface-variant leading-relaxed">
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

              {/* Duolingo Action Bar */}
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
                    onclick="window.skipInsightsToDashboard()"
                    class="text-xs text-on-surface-variant hover:underline px-3 py-2"
                  >
                    Lewati ke Dashboard
                  </button>
                  <button
                    type="button"
                    onclick="window.goToStep('insight-4')"
                    class="bg-primary hover:bg-[#3E2B82] text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                  >
                    <span>Lanjut: Rekam Jejak Keamanan 🛡️</span>
                    <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 7: Insight 4 - Food Poisoning Record & Safety (Duolingo Story Card 4) */}
            <div id="wizard-step-insight-4" class="hidden space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Duolingo Segmented Story Progress */}
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-primary flex items-center gap-1.5">
                    <span class="text-base">🛡️</span>
                    Cerita 4 dari 4: Rekam Jejak Bebas Keracunan
                  </span>
                  <span class="font-semibold text-on-surface-variant">100% Selesai</span>
                </div>
                <div class="grid grid-cols-4 gap-2">
                  <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                  <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                  <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                  <div class="h-2 rounded-full bg-primary shadow-sm"></div>
                </div>
              </div>

              {/* Character Speech Bubble Banner */}
              <div class="bg-gradient-to-r from-emerald-500/10 via-surface-bright to-emerald-500/5 rounded-2xl p-5 border-2 border-emerald-200 dark:border-emerald-900/40 relative shadow-sm">
                <div class="flex items-start gap-3.5">
                  <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                    🛡️
                  </div>
                  <div class="space-y-1">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                      <span class="material-symbols-outlined text-[14px]">shield_with_heart</span>
                      0 Kasus Keracunan Dilaporkan (100% Aman)
                    </div>
                    <h4 class="font-headline-sm text-headline-sm font-extrabold text-on-surface">
                      Kasus Keracunan MBG dari SPPG Ini
                    </h4>
                    <p class="text-xs text-on-surface-variant leading-relaxed">
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

              {/* Duolingo Action Bar */}
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
                  class="bg-primary hover:bg-[#3E2B82] text-white font-bold text-sm px-7 py-3.5 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                >
                  <span>Lihat Rapor Akhir! 🏆</span>
                  <span class="material-symbols-outlined text-[18px]">emoji_events</span>
                </button>
              </div>
            </div>

            {/* STEP 8: Celebratory Final Summary Card (Duolingo Scorecard) */}
            <div id="wizard-step-insight-summary" class="hidden space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center py-2">
              {/* Trophy Avatar */}
              <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center mx-auto shadow-lg text-4xl animate-bounce">
                🏆
              </div>

              <div class="space-y-1 max-w-md mx-auto">
                <div class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900">
                  ⭐⭐⭐⭐⭐ SPPG Bintang 5
                </div>
                <h3 class="text-2xl font-extrabold text-on-surface">
                  SPPG Sangat Terpercaya & Layak!
                </h3>
                <p class="text-xs text-on-surface-variant leading-relaxed">
                  Semua 4 pilar pengawasan transparansi MBG telah terpenuhi dengan predikat memuaskan. Makanan anak-anak di wilayah ini terpantau aman, bergizi, dan bebas dari korupsi.
                </p>
              </div>

              {/* 4-Pillar Scorecard */}
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
                <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/70 text-center">
                  <span class="text-lg block">🪙</span>
                  <span class="text-[11px] text-on-surface-variant block mt-0.5">Keuangan</span>
                  <span class="font-extrabold text-xs text-green-700 block">100% Bersih</span>
                </div>
                <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/70 text-center">
                  <span class="text-lg block">🥗</span>
                  <span class="text-[11px] text-on-surface-variant block mt-0.5">Gizi AKG</span>
                  <span class="font-extrabold text-xs text-green-700 block">98.4% Sesuai</span>
                </div>
                <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/70 text-center">
                  <span class="text-lg block">✨</span>
                  <span class="text-[11px] text-on-surface-variant block mt-0.5">Sanitasi</span>
                  <span class="font-extrabold text-xs text-green-700 block">96% (SLHS)</span>
                </div>
                <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/70 text-center">
                  <span class="text-lg block">🛡️</span>
                  <span class="text-[11px] text-on-surface-variant block mt-0.5">Keamanan</span>
                  <span class="font-extrabold text-xs text-green-700 block">0 Kasus (Aman)</span>
                </div>
              </div>

              {/* Final Actions */}
              <div class="pt-3 space-y-2.5 max-w-md mx-auto">
                <button
                  type="button"
                  id="btn-finish-dashboard"
                  onclick="window.skipInsightsToDashboard()"
                  class="w-full bg-primary hover:bg-[#3E2B82] text-white font-extrabold text-base py-3.5 px-6 rounded-2xl shadow-[0_4px_0_#2E1E66] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <span class="material-symbols-outlined text-[20px]">dashboard</span>
                  Buka Dashboard Utama SPPG 🚀
                </button>
                <button
                  type="button"
                  onclick="window.goToStep('insight-1')"
                  class="text-xs text-primary font-bold hover:underline py-1.5 flex items-center justify-center gap-1 mx-auto"
                >
                  <span class="material-symbols-outlined text-[16px]">refresh</span>
                  Ulangi Baca Cerita Laporan
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Embedded Client-Side Script for Interactive Step Management */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          let hierarchyData = [];
          let currentKitchen = null;
          let currentInsights = null;
          let currentSelectedLocation = null;

          window.openCekMbgModal = function() {
            const modal = document.getElementById('cek-mbg-modal');
            if (modal) modal.classList.remove('hidden');
            window.goToStep('permission');
            loadHierarchy();
          };

          window.closeCekMbgModal = function() {
            const modal = document.getElementById('cek-mbg-modal');
            if (modal) modal.classList.add('hidden');
          };

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
              const el = document.getElementById('wizard-step-' + s);
              if (el) el.classList.add('hidden');
            });

            const targetEl = document.getElementById('wizard-step-' + stepName);
            if (targetEl) targetEl.classList.remove('hidden');

            const titleEl = document.getElementById('wizard-modal-title');
            const subEl = document.getElementById('wizard-modal-subtitle');

            if (stepName === 'permission') {
              if (titleEl) titleEl.innerText = 'Cek MBG & SPPG';
              if (subEl) subEl.innerText = 'Mulai pengecekan dapur MBG di wilayah Anda';
            } else if (stepName === 'loading') {
              if (titleEl) titleEl.innerText = 'Mencari SPPG...';
              if (subEl) subEl.innerText = 'Mendeteksi lokasi otomatis via GPS';
            } else if (stepName === 'manual-form') {
              if (titleEl) titleEl.innerText = 'Pilih Wilayah';
              if (subEl) subEl.innerText = 'Tentukan provinsi, kota, kecamatan, kelurahan';
            } else if (stepName === 'sppg-result') {
              if (titleEl) titleEl.innerText = 'SPPG Ditemukan';
              if (subEl) subEl.innerText = 'Dapur pelayanan gizi di kelurahan Anda';
            } else if (stepName === 'insight-summary') {
              if (titleEl) titleEl.innerText = 'Rapor Kelayakan SPPG 🏆';
              if (subEl) subEl.innerText = 'Rangkuman 4 pilar pengawasan transparansi MBG';
            } else if (stepName.startsWith('insight-')) {
              const idx = stepName.split('-')[1];
              if (titleEl) titleEl.innerText = 'Laporan Cerita SPPG (' + idx + '/4)';
              if (subEl) subEl.innerText = 'Kisah transparansi, gizi, sanitasi & integritas';
            }
          };

          // Step 1: Geolocation handler
          window.handleAllowLocation = function() {
            window.goToStep('loading');

            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                function(pos) {
                  fetchNearestKitchen(pos.coords.latitude, pos.coords.longitude);
                },
                function(err) {
                  console.warn('Geolocation failed or denied, fallback to default center:', err);
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

          window.skipInsightsToDashboard = function() {
            window.closeCekMbgModal();
            if (currentKitchen) {
              // Highlight the selected kitchen or scroll to it
              const activeBanner = document.getElementById('active-sppg-filter-banner');
              const activeName = document.getElementById('active-sppg-name-label');
              if (activeBanner && activeName) {
                activeName.innerText = currentKitchen.name + ' (' + currentKitchen.city + ')';
                activeBanner.classList.remove('hidden');
              }
              // Open kitchen detail or scroll to section
              const targetRow = document.getElementById('kitchen-row-' + currentKitchen.id);
              if (targetRow) {
                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetRow.classList.add('bg-primary-fixed/40');
                setTimeout(() => targetRow.classList.remove('bg-primary-fixed/40'), 3000);
              }
            }
          };

          window.resetActiveSppgFilter = function() {
            const activeBanner = document.getElementById('active-sppg-filter-banner');
            if (activeBanner) activeBanner.classList.add('hidden');
          };
        })();
      `}}></script>
    </div>
  );
};
