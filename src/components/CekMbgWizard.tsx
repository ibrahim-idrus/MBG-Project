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
              onclick="window.openCekMbgModal()"
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

            {/* STEP 4: Insight 1 - Corruption Indication & Financial Consistency */}
            <div id="wizard-step-insight-1" class="hidden space-y-5">
              {/* Progress breadcrumb */}
              <div class="flex items-center justify-between text-xs text-on-surface-variant pb-2 border-b border-surface-variant/60">
                <span class="font-semibold text-primary">Insight 1 dari 4: Keuangan & Integritas</span>
                <div class="flex gap-1.5">
                  <span class="w-6 h-1.5 rounded-full bg-primary"></span>
                  <span class="w-6 h-1.5 rounded-full bg-surface-container-high"></span>
                  <span class="w-6 h-1.5 rounded-full bg-surface-container-high"></span>
                  <span class="w-6 h-1.5 rounded-full bg-surface-container-high"></span>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 inline-flex items-center gap-1 mb-2">
                      <span class="material-symbols-outlined text-[14px]">verified</span>
                      0 Indikasi Anomali (Bersih & Transparan)
                    </span>
                    <h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Konsistensi Pemasukan vs Pengeluaran
                    </h4>
                  </div>
                  <div class="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <span class="material-symbols-outlined text-xl">account_balance</span>
                  </div>
                </div>

                <p class="text-xs text-on-surface-variant leading-relaxed">
                  Menampilkan evaluasi integritas dana MBG. Seluruh transaksi operasional dan belanja bahan pangan diaudit secara real-time untuk mencegah penyelewengan.
                </p>

                {/* Financial stats */}
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div class="bg-surface-container-low p-3.5 rounded-xl border border-surface-variant/50">
                    <span class="text-[11px] text-on-surface-variant block mb-1">Total Pagu Diterima</span>
                    <span class="font-bold text-sm text-on-surface" id="insight-finance-in">Rp150.000.000</span>
                  </div>
                  <div class="bg-surface-container-low p-3.5 rounded-xl border border-surface-variant/50">
                    <span class="text-[11px] text-on-surface-variant block mb-1">Realisasi Belanja Bahan</span>
                    <span class="font-bold text-sm text-on-surface" id="insight-finance-out">Rp127.500.000</span>
                  </div>
                  <div class="bg-surface-container-low p-3.5 rounded-xl border border-surface-variant/50">
                    <span class="text-[11px] text-on-surface-variant block mb-1">Konsistensi Pembukuan</span>
                    <span class="font-bold text-sm text-green-600">100% Sesuai SPJ</span>
                  </div>
                </div>

                {/* Integrity Checklist */}
                <div class="bg-surface-bright rounded-xl p-4 border border-surface-variant/60 space-y-2.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-on-surface-variant flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
                      Kesesuaian Harga Pasar Bahan Baku
                    </span>
                    <span class="font-semibold text-green-700">Wajar (100%)</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-on-surface-variant flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
                      Faktur & Kwitansi Pendukung Digital
                    </span>
                    <span class="font-semibold text-green-700">Lengkap</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-on-surface-variant flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
                      Audit Trail Rekening BGN
                    </span>
                    <span class="font-semibold text-green-700">Terverifikasi</span>
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <div class="flex items-center justify-between pt-3 border-t border-surface-variant/60">
                <button
                  type="button"
                  onclick="window.goToStep('sppg-result')"
                  class="text-xs text-on-surface-variant hover:text-on-surface font-medium flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                  Kembali
                </button>
                <div class="flex gap-2">
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
                    class="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-xl font-semibold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    Lanjut: Cek Gizi
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 5: Insight 2 - Daily Nutrition Compliance */}
            <div id="wizard-step-insight-2" class="hidden space-y-5">
              {/* Progress breadcrumb */}
              <div class="flex items-center justify-between text-xs text-on-surface-variant pb-2 border-b border-surface-variant/60">
                <span class="font-semibold text-primary">Insight 2 dari 4: Pemenuhan Kandungan Gizi</span>
                <div class="flex gap-1.5">
                  <span class="w-6 h-1.5 rounded-full bg-primary"></span>
                  <span class="w-6 h-1.5 rounded-full bg-primary"></span>
                  <span class="w-6 h-1.5 rounded-full bg-surface-container-high"></span>
                  <span class="w-6 h-1.5 rounded-full bg-surface-container-high"></span>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 inline-flex items-center gap-1 mb-2">
                      <span class="material-symbols-outlined text-[14px]">restaurant_menu</span>
                      98.4% Terpenuhi Sesuai Standar AKG
                    </span>
                    <h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Kandungan Gizi Keseharian yang Didistribusikan
                    </h4>
                  </div>
                  <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <span class="material-symbols-outlined text-xl">nutrition</span>
                  </div>
                </div>

                <p class="text-xs text-on-surface-variant leading-relaxed">
                  SPPG ini menyusun menu seimbang berbasis pangan lokal sesuai standar Angka Kecukupan Gizi (AKG) Kemenkes RI yang diawasi langsung oleh nutrisionis bersertifikat.
                </p>

                {/* Nutrition Grid */}
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/50 text-center">
                    <span class="text-[11px] text-on-surface-variant block">Kalori / Porsi</span>
                    <span class="font-bold text-base text-primary">670 kcal</span>
                    <span class="text-[10px] text-green-600 block">Target: 650 kcal (103%)</span>
                  </div>
                  <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/50 text-center">
                    <span class="text-[11px] text-on-surface-variant block">Protein</span>
                    <span class="font-bold text-base text-primary">27.5 g</span>
                    <span class="text-[10px] text-green-600 block">Target: 25 g (110%)</span>
                  </div>
                  <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/50 text-center">
                    <span class="text-[11px] text-on-surface-variant block">Karbohidrat</span>
                    <span class="font-bold text-base text-primary">82 g</span>
                    <span class="text-[10px] text-green-600 block">Target: 80 g (102%)</span>
                  </div>
                  <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/50 text-center">
                    <span class="text-[11px] text-on-surface-variant block">Lemak & Serat</span>
                    <span class="font-bold text-base text-primary">19g / 5.5g</span>
                    <span class="text-[10px] text-green-600 block">Seimbang & Kaya Vitamin</span>
                  </div>
                </div>

                {/* Sample menu card */}
                <div class="bg-surface-bright rounded-xl p-4 border border-surface-variant/60">
                  <span class="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                    Contoh Distribusi Menu Seimbang:
                  </span>
                  <p class="text-xs text-on-surface font-medium leading-relaxed">
                    Nasi Pulen Organik, Ayam Panggang Kecap Madu, Tumis Brokoli & Wortel Segar, Buah Pisang Raja, serta Susu Pasteurisasi.
                  </p>
                </div>
              </div>

              {/* Navigation buttons */}
              <div class="flex items-center justify-between pt-3 border-t border-surface-variant/60">
                <button
                  type="button"
                  onclick="window.goToStep('insight-1')"
                  class="text-xs text-on-surface-variant hover:text-on-surface font-medium flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                  Kembali
                </button>
                <div class="flex gap-2">
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
                    class="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-xl font-semibold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    Lanjut: Sanitasi
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 6: Insight 3 - Sanitation and Cleanliness Percentage */}
            <div id="wizard-step-insight-3" class="hidden space-y-5">
              {/* Progress breadcrumb */}
              <div class="flex items-center justify-between text-xs text-on-surface-variant pb-2 border-b border-surface-variant/60">
                <span class="font-semibold text-primary">Insight 3 dari 4: Sanitasi & Kebersihan</span>
                <div class="flex gap-1.5">
                  <span class="w-6 h-1.5 rounded-full bg-primary"></span>
                  <span class="w-6 h-1.5 rounded-full bg-primary"></span>
                  <span class="w-6 h-1.5 rounded-full bg-primary"></span>
                  <span class="w-6 h-1.5 rounded-full bg-surface-container-high"></span>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 inline-flex items-center gap-1 mb-2">
                      <span class="material-symbols-outlined text-[14px]">clean_hands</span>
                      Tingkat Sanitasi: 96% (Sangat Baik)
                    </span>
                    <h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Persentase Sanitasi & Kebersihan Dapur SPPG
                    </h4>
                  </div>
                  <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                    <span class="material-symbols-outlined text-xl">sanitizer</span>
                  </div>
                </div>

                <p class="text-xs text-on-surface-variant leading-relaxed">
                  Menampilkan evaluasi kelaikan higiene sanitasi dapur penyedia makanan berdasarkan inspeksi berkala Dinas Kesehatan dan audit Badan Gizi Nasional.
                </p>

                {/* SLHS Certificate box */}
                <div class="bg-primary-fixed/30 rounded-xl p-4 border border-primary/20 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center">
                      <span class="material-symbols-outlined text-[20px]">verified_user</span>
                    </div>
                    <div>
                      <span class="text-xs font-bold text-on-surface block">Sertifikat Laik Higiene Sanitasi (SLHS)</span>
                      <span class="text-[11px] text-on-surface-variant" id="insight-slhs-number">Tersertifikasi Resmi BGN & Dinkes</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 bg-green-600 text-white rounded-full text-[11px] font-bold">Terverifikasi</span>
                </div>

                {/* Hygiene Checklist */}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/50">
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="font-semibold text-on-surface">Uji Lab Kualitas Air</span>
                      <span class="font-bold text-green-600">100%</span>
                    </div>
                    <p class="text-[11px] text-on-surface-variant">Bebas E.Coli, logam berat, & klorin berlebih.</p>
                  </div>
                  <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/50">
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="font-semibold text-on-surface">Sterilisasi Alat & Wadah</span>
                      <span class="font-bold text-green-600">98%</span>
                    </div>
                    <p class="text-[11px] text-on-surface-variant">Pencucian suhu tinggi & wadah food grade.</p>
                  </div>
                  <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/50">
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="font-semibold text-on-surface">Higiene Juru Masak (APD)</span>
                      <span class="font-bold text-green-600">95%</span>
                    </div>
                    <p class="text-[11px] text-on-surface-variant">Masker, hairnet, sarung tangan, & swab berkala.</p>
                  </div>
                  <div class="bg-surface-container-low p-3 rounded-xl border border-surface-variant/50">
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="font-semibold text-on-surface">Pengelolaan Limbah</span>
                      <span class="font-bold text-green-600">92%</span>
                    </div>
                    <p class="text-[11px] text-on-surface-variant">Pemisahan sampah organik & saluran tertutup.</p>
                  </div>
                </div>
              </div>

              {/* Navigation buttons */}
              <div class="flex items-center justify-between pt-3 border-t border-surface-variant/60">
                <button
                  type="button"
                  onclick="window.goToStep('insight-2')"
                  class="text-xs text-on-surface-variant hover:text-on-surface font-medium flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                  Kembali
                </button>
                <div class="flex gap-2">
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
                    class="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-xl font-semibold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    Lanjut: Rekam Jejak
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 7: Insight 4 - Food Poisoning Record */}
            <div id="wizard-step-insight-4" class="hidden space-y-5">
              {/* Progress breadcrumb */}
              <div class="flex items-center justify-between text-xs text-on-surface-variant pb-2 border-b border-surface-variant/60">
                <span class="font-semibold text-primary">Insight 4 dari 4: Rekam Jejak Keamanan MBG</span>
                <div class="flex gap-1.5">
                  <span class="w-6 h-1.5 rounded-full bg-primary"></span>
                  <span class="w-6 h-1.5 rounded-full bg-primary"></span>
                  <span class="w-6 h-1.5 rounded-full bg-primary"></span>
                  <span class="w-6 h-1.5 rounded-full bg-primary"></span>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 inline-flex items-center gap-1 mb-2">
                      <span class="material-symbols-outlined text-[14px]">shield_with_heart</span>
                      0 Kasus Keracunan Dilaporkan (100% Aman)
                    </span>
                    <h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Kasus Keracunan MBG dari SPPG Ini
                    </h4>
                  </div>
                  <div class="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <span class="material-symbols-outlined text-xl">safety_check</span>
                  </div>
                </div>

                <p class="text-xs text-on-surface-variant leading-relaxed">
                  Menunjukkan rekam jejak insiden dan kepatuhan keamanan pangan sejak awal beroperasi. SPPG ini menjaga zero incident melalui protokol retensi sampel makanan 24 jam.
                </p>

                {/* Poisoning stats */}
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div class="bg-surface-container-low p-3.5 rounded-xl border border-surface-variant/50 text-center">
                    <span class="text-[11px] text-on-surface-variant block mb-0.5">Total Kasus Keracunan</span>
                    <span class="font-bold text-xl text-green-600">0 Kasus</span>
                    <span class="text-[10px] text-on-surface-variant">Zero Incident Record</span>
                  </div>
                  <div class="bg-surface-container-low p-3.5 rounded-xl border border-surface-variant/50 text-center">
                    <span class="text-[11px] text-on-surface-variant block mb-0.5">Sample Retention Box</span>
                    <span class="font-bold text-sm text-primary">24 Jam Disimpan</span>
                    <span class="text-[10px] text-on-surface-variant">Suhu 4°C Terjaga</span>
                  </div>
                  <div class="bg-surface-container-low p-3.5 rounded-xl border border-surface-variant/50 text-center">
                    <span class="text-[11px] text-on-surface-variant block mb-0.5">Kepuasan & Keamanan Siswa</span>
                    <span class="font-bold text-xl text-amber-600">4.9 / 5.0</span>
                    <span class="text-[10px] text-on-surface-variant">1.250+ Ulasan Positif</span>
                  </div>
                </div>

                {/* Safety Protocol Checklist */}
                <div class="bg-surface-bright rounded-xl p-4 border border-surface-variant/60 space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-on-surface flex items-center gap-1.5 font-medium">
                      <span class="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
                      Pengujian Organoleptik (Rasa, Aroma, Warna) Setiap Batch
                    </span>
                    <span class="font-semibold text-green-700">Lolos</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-on-surface flex items-center gap-1.5 font-medium">
                      <span class="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
                      Monitoring Suhu Makanan Saat Distribusi (&gt; 60°C)
                    </span>
                    <span class="font-semibold text-green-700">Terkontrol</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-on-surface flex items-center gap-1.5 font-medium">
                      <span class="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
                      Kanal Pelaporan & Reaksi Cepat 24 Jam
                    </span>
                    <span class="font-semibold text-green-700">Tersedia</span>
                  </div>
                </div>
              </div>

              {/* Navigation buttons: Finish & Open Main Dashboard */}
              <div class="flex items-center justify-between pt-3 border-t border-surface-variant/60">
                <button
                  type="button"
                  onclick="window.goToStep('insight-3')"
                  class="text-xs text-on-surface-variant hover:text-on-surface font-medium flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[16px]">arrow_back</span>
                  Kembali
                </button>
                <button
                  type="button"
                  id="btn-finish-dashboard"
                  onclick="window.skipInsightsToDashboard()"
                  class="bg-primary hover:bg-primary/90 text-on-primary px-6 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
                >
                  <span class="material-symbols-outlined text-[18px]">dashboard</span>
                  Buka Dashboard Utama SPPG
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
              'insight-4'
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
            } else if (stepName.startsWith('insight-')) {
              const idx = stepName.split('-')[1];
              if (titleEl) titleEl.innerText = 'Insight SPPG (' + idx + '/4)';
              if (subEl) subEl.innerText = 'Evaluasi kualitas, gizi, sanitasi & integritas';
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
