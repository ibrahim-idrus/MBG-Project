import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';

export const KeuanganUserPage: FC = () => {
  return (
    <AdminLayout title="Transparansi Keuangan" activePage="/keuangan" variant="user">
      <div class="max-w-4xl mx-auto" id="finance-root">
        <div id="view-kitchens">
          <div class="mb-8">
            <h2 class="font-display-lg text-display-lg text-primary mb-1">Transparansi Keuangan</h2>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Pilih Dapur/Kantor MBG untuk melihat data keuangan.</p>
          </div>
          <div id="kitchens-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
          <div id="kitchens-loading" class="text-center py-12">
            <span class="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">progress_activity</span>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-2">Memuat data...</p>
          </div>
          <div id="kitchens-empty" class="hidden text-center py-12">
            <span class="material-symbols-outlined text-4xl text-on-surface-variant">storefront</span>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-2">Tidak ada dapur MBG ditemukan.</p>
          </div>
          <div id="kitchens-error" class="hidden text-center py-12">
            <span class="material-symbols-outlined text-4xl text-error">error</span>
            <p class="font-body-sm text-body-sm text-error mt-2">Gagal memuat data. Silakan coba lagi.</p>
          </div>
        </div>

        <div id="view-detail" class="hidden">
          <div class="mb-6">
            <button id="btn-back" class="flex items-center gap-2 text-primary font-label-md text-label-md hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors">
              <span class="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali
            </button>
          </div>
          <div class="mb-8">
            <h2 id="detail-name" class="font-display-lg text-display-lg text-primary mb-1"></h2>
            <p id="detail-location" class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">location_on</span>
              <span></span>
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-tertiary-container/10 flex items-center justify-center text-tertiary-container">
                <span class="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <div>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Dana Diterima</p>
                <p id="stat-in" class="font-headline-sm text-headline-sm text-on-surface">-</p>
              </div>
            </div>
            <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-secondary-container/10 flex items-center justify-center text-secondary-container">
                <span class="material-symbols-outlined">outbox</span>
              </div>
              <div>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Total Pengeluaran</p>
                <p id="stat-out" class="font-headline-sm text-headline-sm text-on-surface">-</p>
              </div>
            </div>
            <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest flex items-center gap-4">
              <div class="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-container">
                <span class="material-symbols-outlined">savings</span>
              </div>
              <div>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Sisa Dana</p>
                <p id="stat-remaining" class="font-headline-sm text-headline-sm text-on-surface">-</p>
              </div>
            </div>
          </div>

          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest overflow-hidden">
            <div class="p-card-padding border-b border-surface-container-highest flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Rincian Transaksi</h3>
              <div class="flex items-center gap-2 flex-wrap">
                <select id="filter-type" class="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">
                  <option value="">Semua Tipe</option>
                  <option value="IN">Pemasukan</option>
                  <option value="OUT">Pengeluaran</option>
                </select>
                <select id="filter-category" class="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">
                  <option value="">Semua Kategori</option>
                </select>
                <select id="filter-sort" class="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                </select>
              </div>
            </div>
            <div id="tx-loading" class="text-center py-8 hidden">
              <span class="material-symbols-outlined text-3xl text-on-surface-variant animate-spin">progress_activity</span>
            </div>
            <div id="tx-empty" class="hidden text-center py-8">
              <p class="font-body-sm text-body-sm text-on-surface-variant">Tidak ada transaksi ditemukan.</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-surface-container-low font-label-md text-label-md text-on-surface-variant">
                    <th class="p-4 font-semibold">No</th>
                    <th class="p-4 font-semibold">Uraian</th>
                    <th class="p-4 font-semibold">Kategori</th>
                    <th class="p-4 font-semibold">Tanggal</th>
                    <th class="p-4 font-semibold text-right">Jumlah</th>
                    <th class="p-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody id="tx-body" class="font-body-sm text-body-sm"></tbody>
              </table>
            </div>
            <div id="tx-pagination" class="p-4 border-t border-surface-container-highest flex items-center justify-between text-body-sm text-on-surface-variant"></div>
          </div>
        </div>

        <div id="view-transaction" class="hidden">
          <div class="mb-6">
            <button id="btn-back-detail" class="flex items-center gap-2 text-primary font-label-md text-label-md hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors">
              <span class="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali
            </button>
          </div>
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_8px_32px_rgba(0,0,0,0.12)] overflow-hidden">
            <div class="px-6 py-4 border-b border-surface-variant">
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Detail Transaksi</h3>
            </div>
            <div class="p-6 space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="font-label-md text-label-md text-on-surface-variant mb-1">Tipe</p>
                  <p id="tx-type" class="font-body-md text-body-md font-medium"></p>
                </div>
                <div>
                  <p class="font-label-md text-label-md text-on-surface-variant mb-1">Kategori</p>
                  <p id="tx-category" class="font-body-md text-body-md font-medium"></p>
                </div>
                <div>
                  <p class="font-label-md text-label-md text-on-surface-variant mb-1">Tanggal</p>
                  <p id="tx-date" class="font-body-md text-body-md font-medium"></p>
                </div>
                <div>
                  <p class="font-label-md text-label-md text-on-surface-variant mb-1">Jumlah</p>
                  <p id="tx-amount" class="font-body-md text-body-md font-bold"></p>
                </div>
              </div>
              <div>
                <p class="font-label-md text-label-md text-on-surface-variant mb-1">Judul</p>
                <p id="tx-title" class="font-body-md text-body-md font-medium"></p>
              </div>
              <div>
                <p class="font-label-md text-label-md text-on-surface-variant mb-1">Deskripsi</p>
                <div class="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                  <p id="tx-description" class="font-body-md text-body-md text-on-surface"></p>
                </div>
              </div>
              <div>
                <p class="font-label-md text-label-md text-on-surface-variant mb-1">Dapur MBG</p>
                <p id="tx-kitchen" class="font-body-md text-body-md font-medium"></p>
                <p id="tx-kitchen-location" class="font-body-sm text-body-sm text-on-surface-variant"></p>
              </div>
              <div id="tx-document-section" class="hidden">
                <p class="font-label-md text-label-md text-on-surface-variant mb-2">Bukti/Dokumen Transaksi</p>
                <div id="tx-doc-viewer" class="border border-outline-variant rounded-xl overflow-hidden bg-surface-container mb-3 hidden"></div>
                <div class="border border-outline-variant rounded-lg overflow-hidden bg-surface-container">
                  <div class="p-4 flex items-center gap-4">
                    <div class="w-10 h-10 bg-primary-container/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined">description</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p id="tx-doc-name" class="font-body-md text-body-md text-on-surface font-medium truncate"></p>
                      <p class="font-body-sm text-body-sm text-on-surface-variant">Klik untuk membuka dokumen</p>
                    </div>
                    <a id="tx-doc-link" href="#" target="_blank" rel="noopener" class="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors shrink-0">
                      <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      ` }}></style>

      <script dangerouslySetInnerHTML={{ __html: `
(function() {
  const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
  function formatRp(n) { return fmt.format(n); }
  function formatDate(d) {
    var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
    var dt = new Date(d + 'T00:00:00');
    return dt.getDate() + ' ' + months[dt.getMonth()] + ' ' + dt.getFullYear();
  }

  var currentKitchenId = null;
  var currentPage = 1;

  function showView(name) {
    document.getElementById('view-kitchens').classList.toggle('hidden', name !== 'kitchens');
    document.getElementById('view-detail').classList.toggle('hidden', name !== 'detail');
    document.getElementById('view-transaction').classList.toggle('hidden', name !== 'transaction');
    window.scrollTo(0, 0);
  }

  async function loadKitchens() {
    document.getElementById('kitchens-loading').classList.remove('hidden');
    document.getElementById('kitchens-empty').classList.add('hidden');
    document.getElementById('kitchens-error').classList.add('hidden');
    try {
      var res = await fetch('/api/kitchens');
      var json = await res.json();
      var list = json.data || [];
      document.getElementById('kitchens-loading').classList.add('hidden');
      if (list.length === 0) { document.getElementById('kitchens-empty').classList.remove('hidden'); return; }
      var html = '';
      for (var i = 0; i < list.length; i++) {
        var k = list[i];
        html += '<div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-container-highest hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group" onclick="window.__selectKitchen(' + k.id + ',\\'' + k.name.replace(/'/g, "\\\\'") + '\\',\\'' + k.location.replace(/'/g, "\\\\'") + '\\')">';
        html += '<div class="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mb-3 group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors"><span class="material-symbols-outlined">storefront</span></div>';
        html += '<h3 class="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors">' + k.name + '</h3>';
        html += '<p class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">location_on</span>' + k.location + '</p>';
        html += '</div>';
      }
      document.getElementById('kitchens-list').innerHTML = html;
    } catch(e) {
      document.getElementById('kitchens-loading').classList.add('hidden');
      document.getElementById('kitchens-error').classList.remove('hidden');
    }
  }

  window.__selectKitchen = function(id, name, location) {
    currentKitchenId = id;
    currentPage = 1;
    document.getElementById('detail-name').textContent = name;
    document.getElementById('detail-location').querySelector('span:last-child').textContent = location;
    showView('detail');
    loadSummary(id);
    loadCategories(id);
    loadTransactions(id, 1);
  };

  async function loadSummary(kitchenId) {
    document.getElementById('stat-in').textContent = '-';
    document.getElementById('stat-out').textContent = '-';
    document.getElementById('stat-remaining').textContent = '-';
    try {
      var res = await fetch('/api/kitchens/' + kitchenId + '/summary');
      var json = await res.json();
      var d = json.data;
      document.getElementById('stat-in').textContent = formatRp(d.totalIn);
      document.getElementById('stat-out').textContent = formatRp(d.totalOut);
      document.getElementById('stat-remaining').textContent = formatRp(d.remaining);
    } catch(e) {}
  }

  async function loadCategories(kitchenId) {
    var sel = document.getElementById('filter-category');
    sel.innerHTML = '<option value="">Semua Kategori</option>';
    try {
      var res = await fetch('/api/kitchens/' + kitchenId + '/categories');
      var json = await res.json();
      var cats = json.data || [];
      for (var i = 0; i < cats.length; i++) {
        var opt = document.createElement('option');
        opt.value = cats[i];
        opt.textContent = cats[i];
        sel.appendChild(opt);
      }
    } catch(e) {}
  }

  async function loadTransactions(kitchenId, page) {
    currentPage = page || 1;
    var type = document.getElementById('filter-type').value;
    var category = document.getElementById('filter-category').value;
    var sort = document.getElementById('filter-sort').value;
    var url = '/api/kitchens/' + kitchenId + '/transactions?page=' + currentPage + '&limit=10';
    if (type) url += '&type=' + type;
    if (category) url += '&category=' + encodeURIComponent(category);
    if (sort) url += '&sort=' + sort;

    document.getElementById('tx-loading').classList.remove('hidden');
    document.getElementById('tx-empty').classList.add('hidden');
    document.getElementById('tx-body').innerHTML = '';
    try {
      var res = await fetch(url);
      var json = await res.json();
      document.getElementById('tx-loading').classList.add('hidden');
      var data = json.data || [];
      var pag = json.pagination || {};
      if (data.length === 0) { document.getElementById('tx-empty').classList.remove('hidden'); renderPagination(pag); return; }
      var html = '';
      for (var i = 0; i < data.length; i++) {
        var tx = data[i];
        var num = ((currentPage - 1) * 10) + i + 1;
        var isOut = tx.type === 'OUT';
        var badgeClass = isOut ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
        var badgeLabel = isOut ? 'Keluar' : 'Masuk';
        var amountClass = isOut ? 'text-error' : 'text-tertiary';
        var amountPrefix = isOut ? '- ' : '+ ';
        html += '<tr class="border-b border-surface-container-highest hover:bg-surface-bright transition-colors cursor-pointer" onclick="window.__selectTransaction(' + tx.id + ')">';
        html += '<td class="p-4 text-on-surface-variant">' + num + '</td>';
        html += '<td class="p-4 font-medium text-on-surface">' + tx.title + '</td>';
        html += '<td class="p-4 text-on-surface-variant">' + tx.category + '</td>';
        html += '<td class="p-4 text-on-surface-variant whitespace-nowrap">' + formatDate(tx.transaction_date) + '</td>';
        html += '<td class="p-4 text-right font-medium ' + amountClass + '">' + amountPrefix + formatRp(tx.amount) + '</td>';
        html += '<td class="p-4 text-center"><button class="text-primary hover:bg-primary-container hover:text-on-primary-container px-3 py-1 rounded-md transition-colors text-xs font-semibold">Detail</button></td>';
        html += '</tr>';
      }
      document.getElementById('tx-body').innerHTML = html;
      renderPagination(pag);
    } catch(e) {
      document.getElementById('tx-loading').classList.add('hidden');
      document.getElementById('tx-empty').classList.remove('hidden');
    }
  }

  function renderPagination(pag) {
    var el = document.getElementById('tx-pagination');
    if (!pag.totalPages || pag.totalPages <= 1) { el.innerHTML = ''; return; }
    var html = '<span>Halaman ' + pag.page + ' dari ' + pag.totalPages + ' (' + pag.total + ' transaksi)</span>';
    html += '<div class="flex items-center gap-1">';
    html += '<button ' + (pag.page <= 1 ? 'disabled' : '') + ' onclick="window.__loadPage(' + (pag.page - 1) + ')" class="p-1 rounded hover:bg-surface-container disabled:opacity-50"><span class="material-symbols-outlined text-[20px]">chevron_left</span></button>';
    for (var i = 1; i <= Math.min(pag.totalPages, 5); i++) {
      if (i === pag.page) html += '<button class="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center">' + i + '</button>';
      else html += '<button onclick="window.__loadPage(' + i + ')" class="w-8 h-8 rounded hover:bg-surface-container flex items-center justify-center">' + i + '</button>';
    }
    html += '<button ' + (pag.page >= pag.totalPages ? 'disabled' : '') + ' onclick="window.__loadPage(' + (pag.page + 1) + ')" class="p-1 rounded hover:bg-surface-container disabled:opacity-50"><span class="material-symbols-outlined text-[20px]">chevron_right</span></button>';
    html += '</div>';
    el.innerHTML = html;
  }

  window.__loadPage = function(page) {
    if (currentKitchenId) loadTransactions(currentKitchenId, page);
  };

  window.__selectTransaction = async function(id) {
    showView('transaction');
    document.getElementById('tx-type').textContent = '-';
    document.getElementById('tx-category').textContent = '-';
    document.getElementById('tx-date').textContent = '-';
    document.getElementById('tx-amount').textContent = '-';
    document.getElementById('tx-title').textContent = '-';
    document.getElementById('tx-description').textContent = '-';
    document.getElementById('tx-kitchen').textContent = '-';
    document.getElementById('tx-kitchen-location').textContent = '';
    document.getElementById('tx-document-section').classList.add('hidden');
    try {
      var res = await fetch('/api/transactions/' + id);
      var json = await res.json();
      var d = json.data;
      var isOut = d.type === 'OUT';
      document.getElementById('tx-type').innerHTML = '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ' + (isOut ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant') + '">' + (isOut ? 'Keluar' : 'Masuk') + '</span>';
      document.getElementById('tx-category').textContent = d.category;
      document.getElementById('tx-date').textContent = formatDate(d.transaction_date);
      document.getElementById('tx-amount').textContent = (isOut ? '- ' : '+ ') + formatRp(d.amount);
      document.getElementById('tx-amount').className = 'font-body-md text-body-md font-bold ' + (isOut ? 'text-error' : 'text-tertiary');
      document.getElementById('tx-title').textContent = d.title;
      document.getElementById('tx-description').textContent = d.description || '-';
      document.getElementById('tx-kitchen').textContent = d.kitchen_name;
      document.getElementById('tx-kitchen-location').textContent = d.kitchen_city + ', ' + d.kitchen_province;
      if (d.document_url) {
        document.getElementById('tx-document-section').classList.remove('hidden');
        var parts = d.document_url.split('/');
        document.getElementById('tx-doc-name').textContent = parts[parts.length - 1];
        document.getElementById('tx-doc-link').href = d.document_url;
        var viewer = document.getElementById('tx-doc-viewer');
        var ext = (parts[parts.length - 1] || '').split('.').pop().toLowerCase();
        var isImage = ['jpg','jpeg','png','gif','webp','bmp','svg'].indexOf(ext) !== -1;
        var isPdf = ext === 'pdf';
        if (isImage) {
          viewer.classList.remove('hidden');
          viewer.innerHTML = '<div class="relative group"><img src="' + d.document_url + '" alt="Bukti transaksi" class="w-full max-h-[400px] object-contain bg-surface-container-lowest cursor-pointer" onclick="window.open(this.src)" /><div class="absolute inset-0 bg-on-surface/0 group-hover:bg-on-surface/10 transition-colors flex items-center justify-center pointer-events-none"><span class="material-symbols-outlined text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity">zoom_in</span></div></div>';
        } else if (isPdf) {
          viewer.classList.remove('hidden');
          viewer.innerHTML = '<div class="flex items-center justify-between px-4 py-3 bg-surface border-b border-outline-variant"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-error text-[20px]">picture_as_pdf</span><span class="font-body-sm text-body-sm text-on-surface font-medium">' + parts[parts.length - 1] + '</span></div><a href="' + d.document_url + '" target="_blank" rel="noopener" class="text-primary font-label-md text-label-md hover:underline flex items-center gap-1">Buka penuh <span class="material-symbols-outlined text-[14px]">open_in_new</span></a></div><iframe src="' + d.document_url + '" class="w-full h-[400px] bg-surface-container-lowest" frameborder="0"></iframe>';
        } else {
          viewer.classList.add('hidden');
          viewer.innerHTML = '';
        }
      } else {
        document.getElementById('tx-document-section').classList.add('hidden');
        document.getElementById('tx-doc-viewer').classList.add('hidden');
        document.getElementById('tx-doc-viewer').innerHTML = '';
      }
    } catch(e) {}
  };

  document.getElementById('btn-back').onclick = function() { showView('kitchens'); };
  document.getElementById('btn-back-detail').onclick = function() { showView('detail'); };

  document.getElementById('filter-type').onchange = function() { if (currentKitchenId) loadTransactions(currentKitchenId, 1); };
  document.getElementById('filter-category').onchange = function() { if (currentKitchenId) loadTransactions(currentKitchenId, 1); };
  document.getElementById('filter-sort').onchange = function() { if (currentKitchenId) loadTransactions(currentKitchenId, 1); };

  loadKitchens();
})();
      ` }}></script>
    </AdminLayout>
  );
};
