import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { Button } from '../components/Button.js';
import { ClientScript } from '../components/ClientScript.js';

const script = String.raw`
(() => {
  const rows = document.getElementById('aspiration-rows');
  const message = document.getElementById('aspiration-message');
  const modal = document.getElementById('aspiration-modal');
  const form = document.getElementById('aspiration-form');
  const detail = document.getElementById('aspiration-detail');
  const lightbox = document.getElementById('photo-lightbox');
  const lightboxImg = document.getElementById('photo-lightbox-img');
  const lightboxClose = document.getElementById('photo-lightbox-close');
  const lightboxBackdrop = document.getElementById('photo-lightbox-backdrop');
  let currentId = null;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const statusLabel = (status) => ({ pending: 'Pending', in_progress: 'Dalam proses', completed: 'Selesai', rejected: 'Ditolak' }[status] || status);
  const notify = (text, error = false) => {
    let target = message;
    if (error && !modal.classList.contains('hidden')) {
      target = form.querySelector('[role="alert"]');
      if (!target) {
        target = document.createElement('div');
        target.setAttribute('role', 'alert');
        form.prepend(target);
      }
    }
    target.textContent = text;
    target.className = 'md:col-span-2 mb-4 rounded-lg px-4 py-3 ' + (error ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed');
    target.hidden = !text;
  };
  const api = async (url, options) => {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(response.status === 401 ? 'Sesi berakhir. Silakan masuk kembali.' : Object.values(data.errors || {}).join(' ') || data.message || 'Permintaan gagal.');
      error.status = response.status;
      throw error;
    }
    return data;
  };

  const openLightbox = (src) => {
    if (!src) return;
    lightboxImg.src = src;
    lightboxImg.alt = 'Foto laporan';
    lightbox.classList.remove('hidden');
  };
  const closeLightbox = () => {
    lightbox.classList.add('hidden');
    lightboxImg.removeAttribute('src');
  };
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.classList.contains('hidden')) closeLightbox();
  });

  const photoCell = (item) => {
    if (item.photo_url) {
      return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-xs font-semibold" title="Laporan ini memiliki foto terlampir">'
        + '<span class="material-symbols-outlined" style="font-size: 14px;">image</span>Foto</span>';
    }
    return '<span class="text-xs text-on-surface-variant" title="Tidak ada foto terlampir">—</span>';
  };

  const photoBlock = (item) => {
    if (item.photo_url) {
      return '<div class="mt-4">'
        + '<div class="text-xs text-on-surface-variant mb-2">Foto</div>'
        + '<button type="button" data-photo="1" class="group block w-fit">'
        + '<img src="'+esc(item.photo_url)+'" alt="Foto laporan" class="w-32 h-32 object-cover rounded-lg border border-outline-variant group-hover:border-primary transition-colors" />'
        + '<span class="inline-flex items-center gap-1 mt-2 text-primary text-xs font-label-md text-label-md">'
        + '<span class="material-symbols-outlined" style="font-size: 14px;">open_in_full</span>Klik untuk memperbesar</span>'
        + '</button>'
        + '</div>';
    }
    return '<div class="mt-4">'
      + '<div class="text-xs text-on-surface-variant mb-2">Foto</div>'
      + '<div class="w-32 h-32 rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest flex flex-col items-center justify-center text-on-surface-variant">'
      + '<span class="material-symbols-outlined" style="font-size: 28px;">image_not_supported</span>'
      + '<span class="text-xs mt-1">Tidak ada foto</span>'
      + '</div>'
      + '</div>';
  };

  const load = async () => {
    try {
      const result = await api('/api/admin/aspirations?per_page=100&sort=newest');
      if (!result.data.length) {
        rows.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-on-surface-variant">Belum ada aspirasi.</td></tr>';
        return;
      }
      rows.innerHTML = result.data.map((item) => (
        '<tr class="border-b border-surface-variant hover:bg-surface-container-low">'
        + '<td class="p-3"><div class="font-semibold">'+esc(item.sender_name)+'</div>'
        + '<div class="text-xs text-on-surface-variant">'+esc(item.sender_email || '-')+'</div>'
        + '<div class="text-xs text-on-surface-variant">'+esc(item.sender_phone || '-')+'</div></td>'
        + '<td class="p-3">'+esc(item.category)+'</td>'
        + '<td class="p-3">'+esc(item.kitchen ? item.kitchen.name : '-')+'</td>'
        + '<td class="p-3 max-w-md">'+esc(item.description)+'</td>'
        + '<td class="p-3">'+esc(statusLabel(item.status))+'</td>'
        + '<td class="p-3">'+photoCell(item)+'</td>'
        + '<td class="p-3 text-right"><button type="button" data-edit="'+item.id+'" class="text-primary">Detail / Tanggapi</button></td>'
        + '</tr>'
      )).join('');
    } catch (error) {
      notify(error.message, true);
    }
  };

  rows.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-edit]');
    if (!button) return;
    try {
      const item = (await api('/api/admin/aspirations/'+button.dataset.edit)).data;
      currentId = item.id;
      form.querySelector('[role="alert"]')?.remove();
      form.elements.status.value = item.status;
      form.elements.admin_response.value = item.admin_response || '';
      detail.innerHTML = ''
        + '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">'
        + '<div><div class="text-xs text-on-surface-variant">Nama</div><div class="font-semibold">'+esc(item.sender_name)+'</div></div>'
        + '<div><div class="text-xs text-on-surface-variant">Email</div><div>'+esc(item.sender_email || '-')+'</div></div>'
        + '<div><div class="text-xs text-on-surface-variant">Telepon</div><div>'+esc(item.sender_phone || '-')+'</div></div>'
        + '<div><div class="text-xs text-on-surface-variant">Dapur MBG</div><div>'+esc(item.kitchen ? item.kitchen.name : '-')+'</div></div>'
        + '<div><div class="text-xs text-on-surface-variant">Kategori</div><div>'+esc(item.category)+'</div></div>'
        + '<div><div class="text-xs text-on-surface-variant">Tanggal</div><div>'+esc(item.created_at)+'</div></div>'
        + '</div>'
        + '<div class="mt-4"><div class="text-xs text-on-surface-variant mb-1">Deskripsi</div>'
        + '<div class="bg-surface-container-low rounded p-3 whitespace-pre-wrap">'+esc(item.description)+'</div></div>'
        + photoBlock(item);
      modal.classList.remove('hidden');
    } catch (error) {
      notify(error.message, true);
    }
  });

  detail.addEventListener('click', (event) => {
    const trigger = event.target.closest('button[data-photo]');
    if (!trigger) return;
    const img = trigger.querySelector('img');
    if (img && img.src) openLightbox(img.src);
  });

  document.getElementById('aspiration-close').addEventListener('click', () => modal.classList.add('hidden'));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      if (!payload.admin_response.trim()) delete payload.admin_response;
      await api('/api/admin/aspirations/'+currentId, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      modal.classList.add('hidden');
      notify('Aspirasi berhasil diperbarui.');
      load();
    } catch (error) {
      notify(error.message, true);
    }
  });
  load();
})();
`;

export const AspirasiPage: FC = () => (
  <AdminLayout title="Manajemen Aspirasi" activePage="/admin/aspirasi">
    <div>
      <div class="mb-8">
        <h2 class="font-display-lg text-display-lg font-bold text-on-surface">Manajemen Aspirasi</h2>
        <p class="font-body-md text-body-md text-on-surface-variant mt-2">Pantau dan tindak lanjuti umpan balik masyarakat.</p>
      </div>
      <div id="aspiration-message" hidden></div>
      <div class="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div class="p-card-padding border-b border-surface-variant flex justify-between items-center">
          <h3 class="font-headline-md text-headline-md">Daftar Aspirasi</h3>
          <Button variant="secondary" shape="rounded" type="button" onclick="location.reload()">Muat ulang</Button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low">
              <tr>
                <th class="p-3">Pengirim</th>
                <th class="p-3">Kategori</th>
                <th class="p-3">Dapur MBG</th>
                <th class="p-3">Aspirasi</th>
                <th class="p-3">Status</th>
                <th class="p-3">Foto</th>
                <th class="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody id="aspiration-rows"></tbody>
          </table>
        </div>
      </div>

      <div id="aspiration-modal" class="hidden fixed inset-0 z-30 bg-black/30 p-4 overflow-y-auto">
        <div class="bg-surface-card max-w-2xl mx-auto mt-10 rounded-xl p-6">
          <div class="flex justify-between items-center mb-5">
            <h3 class="font-headline-md text-headline-md">Detail &amp; Tanggapan</h3>
            <button id="aspiration-close" type="button" class="text-2xl" aria-label="Tutup">×</button>
          </div>
          <div id="aspiration-detail" class="bg-surface-container-low rounded-lg p-4 mb-4"></div>
          <form id="aspiration-form" class="space-y-4">
            <label>
              Status
              <select name="status" class="mt-1 w-full border border-outline-variant rounded-lg p-2">
                <option value="pending">Pending</option>
                <option value="in_progress">Dalam proses</option>
                <option value="completed">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
            </label>
            <label>
              Tanggapan
              <textarea name="admin_response" class="mt-1 w-full border border-outline-variant rounded-lg p-2 min-h-[120px]"></textarea>
            </label>
            <div class="flex justify-end">
              <button type="submit" class="bg-primary text-on-primary rounded-lg px-5 py-2 font-semibold">Simpan Tanggapan</button>
            </div>
          </form>
        </div>
      </div>

      <div id="photo-lightbox" class="hidden fixed inset-0 z-40">
        <div id="photo-lightbox-backdrop" class="absolute inset-0 bg-black/70"></div>
        <div class="relative h-full w-full flex items-center justify-center p-6">
          <img
            id="photo-lightbox-img"
            alt="Foto laporan diperbesar"
            class="max-h-full max-w-full rounded-lg shadow-2xl object-contain"
          />
          <button
            id="photo-lightbox-close"
            type="button"
            class="absolute top-4 right-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-lowest text-on-surface shadow-md hover:bg-surface-container-high transition-colors"
            aria-label="Tutup pratinjau"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    </div>
    <ClientScript>{script}</ClientScript>
  </AdminLayout>
);
