import type { FC, Child } from 'hono/jsx';
import type Database from 'better-sqlite3';
import { cekMbgStyles } from './cek-mbg.styles.js';
import { initCekMbgStory } from './cek-mbg.client.js';

const Icon: FC<{ name: string }> = ({ name }) => <span class="material-symbols-outlined" aria-hidden="true">{name}</span>;

const ReportArt: FC = () => (
  <div class="scene-art" aria-hidden="true">
    <span class="art-spark first">✦</span><span class="art-spark second">✦</span>
    <div class="report-art">
      <div class="art-check"><Icon name="check" /></div>
      <div class="art-line short"></div><div class="art-line"></div><div class="art-line"></div>
      <div class="art-face"></div><div class="art-smile"></div>
    </div>
  </div>
);

const Scene: FC<{ name: string; children: Child }> = ({ name, children }) => (
  <section id={`story-step-${name}`} class="story-scene" hidden={name !== 'permission'} tabindex={-1} aria-labelledby={`title-${name}`}>
    {children}
  </section>
);

const Narration: FC<{ children: Child }> = ({ children }) => (
  <div class="narration"><span class="narrator-icon"><Icon name="chat_bubble" /></span><p>{children}</p></div>
);

const Ring: FC<{ name: string; label: string }> = ({ name, label }) => (
  <div class="hero-metric">
    <div class="metric-ring">
      <svg viewBox="0 0 168 168" aria-hidden="true"><circle class="ring-track" cx="84" cy="84" r="70" /><circle class="ring-value" data-ring={name} cx="84" cy="84" r="70" /></svg>
      <strong class="metric-number"><span data-value={name}>—</span><small>%</small></strong>
      <span class="metric-caption">pada data demo</span>
    </div>
    <p class="metric-label">{label}</p>
  </div>
);

export const CekMbgPage: FC<{ db?: Database.Database; initialKitchenId?: string }> = ({ initialKitchenId }) => {
  // Never embed raw URL input in executable script.
  const safeKitchenId = /^\d+$/.test(initialKitchenId || '') ? initialKitchenId : '';
  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <title>Cek MBG · Cerita di balik sepiring gizi</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: cekMbgStyles }} />
      </head>
      <body>
        <div class="story-app" id="cek-mbg-story">
          <header class="story-top">
            <div class="top-row">
              <a href="/lokasi" class="story-brand" aria-label="Cek MBG, kembali ke lokasi"><span class="brand-mark"><Icon name="restaurant" /></span>Cek MBG<span class="data-badge">Demo</span></a>
              <span class="story-top-label">Cerita di balik sepiring gizi</span>
              <a class="icon-button" href="/lokasi" aria-label="Keluar dari cerita"><Icon name="close" /></a>
            </div>
            <div class="progress-wrap">
              <div class="progress-meta"><span id="story-chapter-label">Mulai dari dapur di dekatmu</span><span id="story-progress-label">0 / 4 cerita</span></div>
              <div id="story-progress" class="progress-track" role="progressbar" aria-label="Cerita yang selesai dibaca" aria-valuemin="0" aria-valuemax="4" aria-valuenow="0">
                {[1, 2, 3, 4].map(n => <span class="progress-segment" data-segment={n}></span>)}
              </div>
            </div>
          </header>
          <main class="story-main" id="story-main">
            <div id="story-alert" class="alert" role="alert" hidden><span id="story-alert-text"></span><button type="button" id="story-retry" class="text-button" hidden>Coba lagi</button></div>
            <div class="sr-only" id="story-announcement" aria-live="polite" aria-atomic="true"></div>
            <Scene name="permission">
              <ReportArt />
              <p class="eyebrow">Kenali makan siang mereka</p>
              <h1 id="title-permission">Sepiring gizi.<br />Banyak cerita baik.</h1>
              <p class="scene-copy">Dari anggaran sampai ke piring. Yuk, kenali dapur MBG di dekatmu lewat 4 cerita singkat.</p>
              <div class="chapter-pills">
                <span><Icon name="account_balance_wallet" />Anggaran</span><span><Icon name="nutrition" />Gizi</span><span><Icon name="water_drop" />Kebersihan</span><span><Icon name="shield" />Keamanan</span>
              </div>
              <button id="btn-deny-location" class="text-button" type="button">Pilih wilayah secara manual <span aria-hidden="true">→</span></button>
              <p class="privacy"><Icon name="location_on" />Lokasi hanya diakses setelah kamu mengizinkan.</p>
            </Scene>
            <Scene name="loading">
              <div class="loader" aria-hidden="true"></div>
              <h2 id="title-loading">Sebentar, kita cari dulu…</h2>
              <p class="scene-copy" id="loading-message">Mencari dapur MBG di sekitar lokasimu.</p>
              <button id="cancel-search" class="text-button" type="button">Pilih wilayah secara manual</button>
            </Scene>
            <Scene name="manual-form">
              <p class="eyebrow"><Icon name="location_on" />Langkah pertama</p>
              <h2 id="title-manual-form">Di mana kita mulai?</h2>
              <p class="scene-copy">Pilih wilayahmu. Kita cari dapur yang melayani daerah tersebut.</p>
              <form id="form-location-hierarchy" class="form-grid">
                {[
                  ['province', 'Provinsi'], ['city', 'Kabupaten / Kota'], ['district', 'Kecamatan'], ['village', 'Kelurahan / Desa'],
                ].map(([id, label]) => (
                  <div><label for={`select-${id}`}>{label}</label><select id={`select-${id}`} name={id} required disabled><option value="">Pilih {label.toLowerCase()}</option></select></div>
                ))}
              </form>
              <p class="privacy"><Icon name="info" />Pilihan wilayah mengikuti data dapur yang tersedia.</p>
            </Scene>
            <Scene name="sppg-result">
              <div class="kitchen-icon"><Icon name="storefront" /></div>
              <p class="eyebrow">Dapur ditemukan</p>
              <h2 id="title-sppg-result">Kenalan dengan<br />dapur di dekatmu.</h2>
              <div class="location-result">
                <span class="data-badge" id="sppg-card-code">SPPG</span>
                <h3 id="sppg-card-name">Dapur MBG</h3>
                <p class="location-address" id="sppg-card-address"></p>
                <div class="mini-stats">
                  <div><strong id="sppg-card-schools">—</strong><span>Sekolah</span></div>
                  <div><strong id="sppg-card-students">—</strong><span>Siswa</span></div>
                  <div><strong id="sppg-card-capacity">—</strong><span>Kapasitas porsi</span></div>
                </div>
              </div>
              <p class="scene-copy">Ada cerita di balik setiap porsi. Mari kita lihat satu per satu.</p>
              <button type="button" class="text-button" id="change-location">Ganti wilayah</button>
              <button type="button" class="text-button" id="btn-skip-insights">Langsung lihat dapur</button>
            </Scene>
            <Scene name="insight-1">
              <p class="eyebrow"><Icon name="account_balance_wallet" />Cerita 01 · Anggaran</p>
              <h2 id="title-insight-1">Dari anggaran,<br />jadi makan siang.</h2>
              <Ring name="finance" label="Konsistensi pencatatan anggaran" />
              <div class="stat-pair">
                <div class="stat-card"><span>Dana masuk</span><strong id="insight-finance-in">—</strong></div>
                <div class="stat-card"><span>Dana dibelanjakan</span><strong id="insight-finance-out">—</strong></div>
              </div>
              <Narration><strong>Setiap rupiah punya cerita.</strong> Bandingkan dana yang masuk dengan belanja dapur. Angka ini membantu kita memahami penggunaan anggaran, bukan membuktikan bebas korupsi.</Narration>
              <details class="detail-disclosure"><summary>Lihat rincian anggaran</summary><div class="detail-body"><div class="detail-row"><span>Sisa anggaran tercatat</span><strong id="finance-remaining">—</strong></div><p>Skor konsistensi masih berupa simulasi. Nilai anggaran dapat menggunakan nilai contoh jika transaksi belum tersedia.</p></div></details>
            </Scene>
            <Scene name="insight-2">
              <p class="eyebrow"><Icon name="nutrition" />Cerita 02 · Gizi</p>
              <h2 id="title-insight-2">Bukan sekadar kenyang.<br />Ada gizi di dalamnya.</h2>
              <div class="hero-metric">
                <div class="plate" aria-hidden="true"><div class="plate-part grain"><Icon name="rice_bowl" /></div><div class="plate-part protein"><Icon name="egg" /></div><div class="plate-part veg"><Icon name="eco" /></div><div class="plate-part fruit"><Icon name="nutrition" /></div><div class="plate-score"><span data-value="nutrition">—</span>%</div></div>
                <p class="metric-label"><span data-value="nutrition">—</span>% pemenuhan gizi pada data demo</p>
              </div>
              <div class="stat-pair"><div class="stat-card"><span>Energi per porsi</span><strong id="nutrition-energy">—</strong></div><div class="stat-card"><span>Protein per porsi</span><strong id="nutrition-protein">—</strong></div></div>
              <Narration><strong>Isi piringnya saling melengkapi.</strong> Sumber energi, protein, sayur, dan buah menyusun contoh menu ini. Yuk, lihat apa saja yang ada di dalamnya.</Narration>
              <details class="detail-disclosure"><summary>Intip menu &amp; kandungan gizi</summary><div class="detail-body"><p id="nutrition-menu"></p><div id="nutrition-details"></div></div></details>
            </Scene>
            <Scene name="insight-3">
              <p class="eyebrow"><Icon name="water_drop" />Cerita 03 · Kebersihan</p>
              <h2 id="title-insight-3">Cerita baik dimulai<br />dari dapur yang bersih.</h2>
              <Ring name="sanitation" label="Skor kebersihan dapur" />
              <div class="stat-card"><span>Sertifikat Laik Higiene Sanitasi (SLHS)</span><strong id="sanitation-status">—</strong></div>
              <Narration><strong>Bersih di setiap tahap.</strong> Air, alat masak, dan kebersihan petugas ikut diperhatikan. Skor demo ini menggambarkan cara membaca laporan, bukan hasil inspeksi langsung.</Narration>
              <details class="detail-disclosure"><summary>Lihat titik pemeriksaan</summary><div class="detail-body"><div id="sanitation-details"></div><p id="insight-slhs-number"></p></div></details>
            </Scene>
            <Scene name="insight-4">
              <p class="eyebrow"><Icon name="shield" />Cerita 04 · Keamanan</p>
              <h2 id="title-insight-4">Sampai ke piring,<br />tetap diperhatikan.</h2>
              <div class="hero-metric"><div class="shield-art">
                <svg viewBox="0 0 136 152" aria-hidden="true"><path d="M68 6 128 28v44c0 35-26 59-60 74C34 131 8 107 8 72V28Z" fill="var(--primary-soft)" stroke="var(--primary)" stroke-width="4" /></svg>
                <strong class="metric-number" data-value="safety">—</strong><span class="metric-caption">kasus pada demo</span>
              </div><p class="metric-label">Catatan keamanan pangan</p></div>
              <div class="stat-card"><span>Penyimpanan sampel makanan</span><strong id="safety-retention">—</strong></div>
              <Narration><strong>Pengawasan tidak berhenti di dapur.</strong> Sampel makanan dan pemeriksaan distribusi membantu penelusuran. Nol kasus pada data demo bukan jaminan tidak ada risiko.</Narration>
              <details class="detail-disclosure"><summary>Lihat protokol keamanan</summary><div class="detail-body" id="safety-details"></div></details>
            </Scene>
            <Scene name="insight-summary">
              <ReportArt />
              <p class="eyebrow">4 cerita sudah kamu kenali</p>
              <h2 id="title-insight-summary">Sekarang, kamu lebih tahu.</h2>
              <p class="scene-copy" id="summary-kitchen">Ini rapor singkat dapur pilihanmu.</p>
              <div class="summary-grid">
                {[
                  ['1', 'account_balance_wallet', 'Anggaran', 'finance', '%'],
                  ['2', 'nutrition', 'Gizi', 'nutrition', '%'],
                  ['3', 'water_drop', 'Kebersihan', 'sanitation', '%'],
                  ['4', 'shield', 'Keamanan', 'safety', ' kasus'],
                ].map(([step, icon, label, value, suffix]) => (
                  <button type="button" class="summary-tile" data-review={step} aria-label={`Baca ulang cerita ${label.toLowerCase()}`} aria-describedby={`summary-score-${value}`}>
                    <Icon name={icon} /><span>{label}</span>
                    <strong id={`summary-score-${value}`}><span data-value={value} style="display:inline;font:inherit;color:inherit">—</span>{suffix}</strong>
                    <small>Baca lagi <span aria-hidden="true" style="display:inline">↗</span></small>
                  </button>
                ))}
              </div>
              <p class="demo-note"><strong>Data demo, bukan penilaian resmi.</strong> Rapor ini menggunakan metrik simulasi. Periksa data sumber dan laporan terbaru sebelum mengambil kesimpulan.</p>
            </Scene>
          </main>
          <footer class="story-footer">
            <div class="footer-inner">
              <div class="footer-actions">
                <button type="button" class="icon-button story-back" id="story-back" aria-label="Kembali ke langkah sebelumnya" hidden><Icon name="arrow_back" /></button>
                <button type="button" class="story-primary" id="btn-allow-location"><Icon name="near_me" />Temukan dapur saya</button>
                <button type="button" class="story-primary" id="story-next" hidden><span id="story-next-label">Lanjut</span><Icon name="arrow_forward" /></button>
              </div>
              <p class="footer-note" id="story-footer-note">4 cerita singkat · Kenali, pahami, ikut awasi</p>
            </div>
          </footer>
        </div>
        <noscript><p>Aktifkan JavaScript untuk membaca cerita interaktif, atau <a href="/lokasi">lihat daftar dapur</a>.</p></noscript>
        <script dangerouslySetInnerHTML={{ __html: `(${initCekMbgStory.toString()})(${JSON.stringify(safeKitchenId)});` }} />
      </body>
    </html>
  );
};
