import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';
import { FormInput } from '../../components/FormInput.js';
import { ClientScript } from '../../components/ClientScript.js';

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const MAX_PHOTO_LABEL = '3 MB';

const script = String.raw`
(() => {
  const MAX_PHOTO_BYTES = ` + String(MAX_PHOTO_BYTES) + `;
  const MAX_PHOTO_LABEL = '` + MAX_PHOTO_LABEL + `';
  const form = document.getElementById('laporan-form');
  const alertBox = document.getElementById('laporan-alert');
  const submitBtn = document.getElementById('laporan-submit');
  const photoInput = document.getElementById('photo-input');
  const photoEmpty = document.getElementById('photo-empty');
  const photoPreview = document.getElementById('photo-preview');
  const photoThumb = document.getElementById('photo-thumb');
  const photoName = document.getElementById('photo-name');
  const photoSize = document.getElementById('photo-size');
  const photoStatus = document.getElementById('photo-status');
  const photoRemove = document.getElementById('photo-remove');
  const photoReplace = document.getElementById('photo-replace');
  const kitchenSelect = form.elements.namedItem('kitchen_id');

  const setAlert = (message, error) => {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = 'mb-6 rounded-lg px-4 py-3 ' + (error ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed');
    alertBox.hidden = !message;
  };
  const clearAlert = () => setAlert('', false);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const setPhoto = (file) => {
    if (!file) {
      photoInput.value = '';
      photoThumb.removeAttribute('src');
      photoEmpty.classList.remove('hidden');
      photoPreview.classList.add('hidden');
      if (photoStatus) photoStatus.classList.add('hidden');
      clearAlert();
      return;
    }
    if (!file.type || !file.type.startsWith('image/')) {
      setAlert('Format foto tidak didukung. Pilih file gambar (JPG, PNG, atau WebP).', true);
      photoInput.value = '';
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setAlert('Ukuran foto ' + formatBytes(file.size) + ' melebihi batas maksimum ' + MAX_PHOTO_LABEL + '. Pilih foto yang lebih kecil.', true);
      photoInput.value = '';
      return;
    }
    clearAlert();
    const reader = new FileReader();
    reader.onload = () => {
      photoThumb.src = reader.result;
      photoName.textContent = file.name;
      photoSize.textContent = formatBytes(file.size) + ' / maks ' + MAX_PHOTO_LABEL;
      photoEmpty.classList.add('hidden');
      photoPreview.classList.remove('hidden');
      if (photoStatus) {
        photoStatus.classList.remove('hidden');
        photoStatus.classList.add('flex');
      }
    };
    reader.readAsDataURL(file);
  };

  const loadKitchens = async () => {
    try {
      const result = await fetch('/api/kitchens');
      if (!result.ok) throw new Error('Gagal memuat daftar dapur.');
      const payload = await result.json();
      kitchenSelect.innerHTML = '<option disabled selected value="">Pilih dapur</option>' + payload.data.map((k) => '<option value="'+k.id+'">'+k.name+' &mdash; '+k.city+'</option>').join('');
    } catch (error) {
      setAlert(error.message, true);
    }
  };

  photoInput.addEventListener('change', () => setPhoto(photoInput.files && photoInput.files[0]));
  photoRemove.addEventListener('click', () => setPhoto(null));
  photoReplace.addEventListener('click', () => photoInput.click());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAlert();
    submitBtn.disabled = true;
    try {
      const fd = new FormData(form);
      const photo = fd.get('photo');
      let photoUrl = null;
      if (photo && photo.size) {
        if (!photo.type || !photo.type.startsWith('image/')) throw new Error('Format foto tidak didukung. Pilih file gambar (JPG, PNG, atau WebP).');
        if (photo.size > MAX_PHOTO_BYTES) throw new Error('Ukuran foto ' + formatBytes(photo.size) + ' melebihi batas maksimum ' + MAX_PHOTO_LABEL + '.');
        photoUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Gagal membaca file foto.'));
          reader.readAsDataURL(photo);
        });
      }
      const payload = {
        sender_name: fd.get('sender_name'),
        sender_email: fd.get('sender_email'),
        sender_phone: fd.get('sender_phone'),
        kitchen_id: Number(fd.get('kitchen_id')),
        category: fd.get('category'),
        description: fd.get('description'),
        photo_url: photoUrl,
      };
      const response = await fetch('/api/aspirations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data && data.errors ? Object.values(data.errors).join(' ') : data.message || 'Gagal mengirim laporan.';
        throw new Error(message);
      }
      setAlert('Laporan berhasil dikirim. Terima kasih atas masukan Anda.', false);
      form.reset();
      setPhoto(null);
    } catch (error) {
      setAlert(error.message, true);
    } finally {
      submitBtn.disabled = false;
    }
  });
  loadKitchens();
})();
`;

export const LaporanPage: FC = () => {
  return (
    <AdminLayout title="Laporan & Kritik" activePage="/laporan" variant="user">
      <div class="w-full min-h-screen flex justify-center items-start">
        <div class="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant p-6 md:p-card-padding mt-4 md:mt-8">
          <div class="mb-8">
            <h2 class="font-headline-md text-headline-md text-on-surface mb-2">Buat Laporan</h2>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Sampaikan kritik atau laporan terkait pelayanan dapur MBG.</p>
          </div>
          <div id="laporan-alert" hidden></div>
          <form id="laporan-form" class="space-y-6">
            <FormInput label="Nama Lengkap" type="text" name="sender_name" placeholder="Masukkan nama Anda" />
            <FormInput label="Email" type="text" name="sender_email" placeholder="nama@email.com" />
            <FormInput label="Nomor Telepon" type="text" name="sender_phone" placeholder="08xxxxxxxxxx" />
            <FormInput
              label="Kategori Laporan"
              type="select"
              name="category"
              placeholder="Pilih kategori"
              options={[
                { value: 'kualitas', label: 'Kualitas Makanan' },
                { value: 'pelayanan', label: 'Pelayanan Staff' },
                { value: 'fasilitas', label: 'Fasilitas Dapur' },
                { value: 'kebersihan', label: 'Kebersihan' },
                { value: 'distribusi', label: 'Distribusi' },
                { value: 'lainnya', label: 'Lainnya' },
              ]}
            />
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">Dapur MBG</label>
              <div class="relative">
                <select
                  name="kitchen_id"
                  class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
                >
                  <option disabled selected value="">Memuat dapur...</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                  <span class="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-baseline justify-between">
                <label class="font-label-md text-label-md text-on-surface">Foto (Opsional)</label>
                <span class="font-body-sm text-body-sm text-on-surface-variant">Maks. {MAX_PHOTO_LABEL} &middot; JPG, PNG, WebP</span>
              </div>

              <div id="photo-empty" class="w-full border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors duration-200 flex flex-col items-center justify-center p-8 cursor-pointer relative group">
                <input
                  id="photo-input"
                  name="photo"
                  accept="image/*"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  type="file"
                />
                <span class="material-symbols-outlined text-outline group-hover:text-primary text-4xl mb-3 transition-colors">image</span>
                <p class="font-body-sm text-body-sm text-on-surface-variant text-center">
                  Klik untuk upload foto<br />atau drag &amp; drop
                </p>
                <p class="font-body-sm text-body-sm text-outline mt-2 text-center">Belum ada foto dipilih</p>
              </div>

              <div id="photo-status" class="hidden items-center gap-2 px-3 py-2 rounded-lg bg-tertiary-container text-on-tertiary-container font-label-md text-label-md">
                <span class="material-symbols-outlined" style="font-size: 18px;">check_circle</span>
                <span>Foto dipilih dan siap dikirim</span>
              </div>

              <div id="photo-preview" class="hidden w-full border-2 border-primary rounded-xl bg-surface-container-lowest p-3 flex items-center gap-4">
                <img
                  id="photo-thumb"
                  alt="Pratinjau foto"
                  class="w-20 h-20 object-cover rounded-lg border border-outline-variant shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-label-md text-label-md text-on-surface truncate" id="photo-name">filename.jpg</div>
                  <div class="font-body-sm text-body-sm text-on-surface-variant" id="photo-size">0 KB</div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    id="photo-replace"
                    type="button"
                    class="inline-flex items-center gap-1 border border-outline-variant text-on-surface px-3 py-1.5 rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                    aria-label="Ganti foto"
                  >
                    <span class="material-symbols-outlined" style="font-size: 16px;">swap_horiz</span>
                    Ganti
                  </button>
                  <button
                    id="photo-remove"
                    type="button"
                    class="inline-flex items-center gap-1 border border-outline-variant text-error px-3 py-1.5 rounded-lg font-label-md text-label-md hover:bg-error-container/30 transition-colors"
                    aria-label="Hapus foto"
                  >
                    <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
            <FormInput label="Deskripsi" type="textarea" name="description" placeholder="Tulis detail laporan Anda..." rows={4} />
            <div class="pt-4">
              <button
                id="laporan-submit"
                type="submit"
                class="w-full bg-[#34A853] hover:bg-[#2c8d45] text-white font-label-md text-label-md rounded-lg px-6 py-2.5 flex items-center justify-center gap-2 transition-colors"
              >
                Kirim Laporan
                <span class="material-symbols-outlined" style="font-size: 18px;">send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <ClientScript>{script}</ClientScript>
    </AdminLayout>
  );
};
