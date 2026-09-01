import type { getKitchenInsightMetrics, getLocationHierarchy } from '../../db/queries.js';

/** Serialized into the page after compilation; keep runtime dependencies inside this function. */
export function initCekMbgStory(initialKitchenId: string) {
  type Insights = NonNullable<ReturnType<typeof getKitchenInsightMetrics>>;
  type Hierarchy = ReturnType<typeof getLocationHierarchy>;
  const byId = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const button = (id: string) => byId<HTMLButtonElement>(id);
  const select = (key: string) => byId<HTMLSelectElement>('select-' + key);
  const setText = (id: string, text: unknown) => { byId(id).textContent = String(text ?? '—'); };
  const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null;
  const format = (value: unknown) => number(value)?.toLocaleString('id-ID', { maximumFractionDigits: 1 }) ?? '—';
  const chapters = ['insight-1', 'insight-2', 'insight-3', 'insight-4'];
  const names = ['Anggaran', 'Gizi', 'Kebersihan', 'Keamanan'];
  const complete = new Set<string>();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const next = button('story-next');
  let step = 'permission';
  let hierarchy: Hierarchy = [];
  let hierarchyLoading = false;
  let kitchen: Insights['kitchen'] | null = null;
  let insights: Insights | null = null;
  let lookupVersion = 0;
  let frame = 0;
  let reviewing = false;
  let retry: (() => void) | null = null;

  function alert(message = '', action: (() => void) | null = null) {
    setText('story-alert-text', message);
    byId('story-alert').hidden = !message;
    byId('story-retry').hidden = !action;
    retry = action;
  }

  async function request<T>(url: string, body?: unknown): Promise<T> {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      if (response.status === 404) throw new Error('Tidak ada SPPG yang ditemukan. Coba pilih wilayah lain.');
      throw new Error('Data belum berhasil dimuat. Periksa koneksimu dan coba lagi.');
    }
    const json = await response.json() as { data?: T };
    if (!json.data) throw new Error('Data belum tersedia. Silakan coba lagi.');
    return json.data;
  }

  function message(error: unknown) {
    return error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'TypeError'
      ? error.message : 'Koneksi terputus atau terlalu lama. Silakan coba lagi.';
  }

  function controls() {
    button('btn-allow-location').hidden = step !== 'permission';
    next.hidden = step === 'permission' || step === 'loading';
    button('story-back').hidden = step === 'permission' || step === 'loading';
    next.disabled = (step === 'manual-form' && (!select('village').value || hierarchyLoading)) || (step === 'sppg-result' && !insights);
    const index = chapters.indexOf(step);
    const label = reviewing ? 'Kembali ke rapor' : step === 'manual-form' ? 'Temukan dapur' : step === 'sppg-result'
      ? insights ? 'Yuk, buka ceritanya' : 'Menyiapkan cerita…' : step === 'insight-summary' ? 'Lihat detail dapur'
      : index === 3 ? 'Lihat rapor lengkap' : 'Lanjut · ' + names[index + 1];
    setText('story-next-label', label);
    setText('story-footer-note', index >= 0 || step === 'insight-summary' ? 'Data demo · Bukan hasil audit atau penilaian resmi' : '4 cerita singkat · Kenali, pahami, ikut awasi');
  }

  function animateMetrics(scene: HTMLElement) {
    cancelAnimationFrame(frame);
    const sanitationRequirements = insights?.sanitationInsight?.requirements ?? [];
    const metrics: Record<string, number | null> = {
      finance: number(insights?.corruptionInsight?.consistencyRate),
      nutrition: null,
      sanitation: sanitationRequirements.length
        ? Math.round((sanitationRequirements.filter(item => item.met).length / sanitationRequirements.length) * 100)
        : null,
      safety: number(insights?.poisoningInsight?.caseCount),
    };
    const values = Array.from(scene.querySelectorAll<HTMLElement>('[data-value]'));
    const rings = Array.from(scene.querySelectorAll<SVGElement>('[data-ring]'));
    rings.forEach(ring => ring.style.setProperty('--ring-offset', '440'));
    const start = performance.now();
    const tick = (now: number) => {
      const progress = motion.matches ? 1 : Math.min(1, (now - start) / 650);
      values.forEach(el => {
        const value = metrics[el.dataset.value!];
        el.textContent = value === null || value === undefined ? '—' : format(progress === 1 ? value : Math.round(value * (1 - Math.pow(1 - progress, 3))));
      });
      rings.forEach(ring => {
        const value = metrics[ring.dataset.ring!];
        ring.style.setProperty('--ring-offset', String(440 * (1 - Math.max(0, Math.min(100, value ?? 0)) / 100)));
      });
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }

  function goTo(name: string, direction = 'forward') {
    const scene = byId('story-step-' + name);
    if (!scene) return;
    alert();
    document.querySelectorAll<HTMLElement>('.story-scene').forEach(el => { el.hidden = true; });
    step = name;
    scene.dataset.direction = direction;
    scene.hidden = false;
    const index = chapters.indexOf(name);
    setText('story-chapter-label', index >= 0 ? 'Cerita ' + (index + 1) + ' · ' + names[index] : name === 'insight-summary' ? 'Rapor dapur pilihanmu' : 'Mulai dari dapur di dekatmu');
    setText('story-progress-label', complete.size + ' / 4 cerita');
    byId('story-progress').setAttribute('aria-valuenow', String(complete.size));
    document.querySelectorAll<HTMLElement>('[data-segment]').forEach((segment, i) => {
      segment.classList.toggle('done', complete.has(chapters[i]));
      segment.classList.toggle('current', index === i && !complete.has(chapters[i]));
    });
    controls();
    animateMetrics(scene);
    setText('story-announcement', byId('title-' + name).textContent);
    scene.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function options(key: string, values: string[]) {
    const el = select(key);
    el.replaceChildren(new Option('Pilih ' + ({ province: 'provinsi', city: 'kabupaten / kota', district: 'kecamatan', village: 'kelurahan / desa' } as Record<string, string>)[key], ''));
    values.forEach(value => el.add(new Option(value, value)));
    el.disabled = values.length === 0;
  }

  async function loadHierarchy() {
    if (hierarchy.length || hierarchyLoading) return;
    hierarchyLoading = true;
    controls();
    try {
      hierarchy = await request<Hierarchy>('/api/location/hierarchy');
      options('province', hierarchy.map(p => p.name));
      if (!hierarchy.length && step === 'manual-form') alert('Belum ada wilayah yang tersedia. Coba lagi nanti.', loadHierarchy);
    } catch (error) {
      if (step === 'manual-form') alert(message(error), loadHierarchy);
    } finally { hierarchyLoading = false; controls(); }
  }

  function manual() {
    lookupVersion++;
    reviewing = false;
    goTo('manual-form');
    void loadHierarchy();
  }

  function renderRows(id: string, rows: [string, string][]) {
    const container = byId(id);
    container.replaceChildren();
    rows.forEach(([label, value]) => {
      const row = document.createElement('div');
      row.className = 'detail-row';
      const left = document.createElement('span');
      const right = document.createElement('strong');
      left.textContent = label;
      right.textContent = value;
      row.append(left, right);
      container.append(row);
    });
  }

  function renderInsights(data: Insights) {
    insights = data;
    const finance = data.corruptionInsight;
    const nutrition = data.nutritionInsight;
    const sanitation = data.sanitationInsight;
    const safety = data.poisoningInsight;
    const plate = nutrition?.plateNutrition;
    setText('insight-finance-in', finance?.totalInFormatted);
    setText('insight-finance-out', finance?.totalOutFormatted);
    setText('finance-remaining', finance?.remainingFormatted);
    setText('nutrition-energy', plate ? format(plate.calories) + ' kkal' : '—');
    setText('nutrition-protein', plate ? format(plate.protein) + ' g' : '—');
    setText('nutrition-menu', nutrition?.menuName ?? 'Menu belum tersedia');
    const nutritionRows: [string, string][] = plate ? [
      ['Energi', format(plate.calories) + ' kkal'],
      ['Protein', format(plate.protein) + ' g'],
      ['Karbohidrat', format(plate.carbohydrates) + ' g'],
      ['Lemak', format(plate.fat) + ' g'],
      ['Serat', format(plate.fiber) + ' g'],
    ] : [];
    renderRows('nutrition-details', nutritionRows);
    setText('sanitation-status', sanitation?.slhsCertified === true ? 'Tercatat memiliki SLHS' : sanitation?.slhsCertified === false ? 'Belum terkonfirmasi' : 'Belum tersedia');
    setText('insight-slhs-number', sanitation?.slhsCertificateNumber);
    renderRows('sanitation-details', (sanitation?.requirements ?? []).map(item => [item.label, item.met ? 'Terpenuhi' : 'Belum terpenuhi']));
    setText('safety-retention', safety?.sampleRetention);
    renderRows('safety-details', (safety?.safetyProtocols ?? []).map(item => [item.name, item.status]));
    controls();
  }

  function renderKitchen(data: Insights['kitchen']) {
    kitchen = data;
    insights = null;
    complete.clear();
    reviewing = false;
    setText('sppg-card-name', data.name);
    setText('sppg-card-code', data.code);
    setText('sppg-card-address', [data.address, data.village, data.district, data.city].filter(Boolean).join(', '));
    setText('sppg-card-schools', format(data.totalSchools));
    setText('sppg-card-students', format(data.totalStudents));
    setText('sppg-card-capacity', format(data.capacity));
    setText('summary-kitchen', data.name);
    document.querySelectorAll<HTMLDetailsElement>('details').forEach(el => { el.open = false; });
    goTo('sppg-result');
  }

  async function loadInsights(id: number, version: number) {
    try {
      const data = await request<Insights>('/api/location/sppg/' + encodeURIComponent(id) + '/insights');
      if (version !== lookupVersion) return;
      renderInsights(data);
      alert();
    } catch (error) {
      if (version === lookupVersion) alert(message(error), () => { alert(); void loadInsights(id, version); });
    }
  }

  async function findKitchen(body: unknown, version: number) {
    try {
      const data = await request<Insights['kitchen']>('/api/location/find-sppg', body);
      if (version !== lookupVersion) return;
      renderKitchen(data);
      void loadInsights(data.id, version);
    } catch (error) {
      if (version !== lookupVersion) return;
      manual();
      alert(message(error));
    }
  }

  function allowLocation() {
    const version = ++lookupVersion;
    goTo('loading');
    setText('loading-message', 'Mencari dapur MBG di sekitar lokasimu.');
    const unavailable = () => {
      if (version !== lookupVersion) return;
      manual();
      alert('Akses lokasi tidak tersedia atau tidak diizinkan. Pilih wilayahmu di bawah ini.');
    };
    if (!navigator.geolocation) { unavailable(); return; }
    navigator.geolocation.getCurrentPosition(
      position => {
        if (version !== lookupVersion) return;
        void findKitchen({ lat: position.coords.latitude, lng: position.coords.longitude }, version);
      }, unavailable, { timeout: 8000, maximumAge: 60000 },
    );
  }

  function submit() {
    const form = byId<HTMLFormElement>('form-location-hierarchy');
    if (!form.reportValidity() || next.disabled) return;
    const body = Object.fromEntries(['province', 'city', 'district', 'village'].map(key => [key, select(key).value]));
    const version = ++lookupVersion;
    goTo('loading');
    setText('loading-message', 'Mencocokkan dapur dengan wilayah pilihanmu.');
    void findKitchen(body, version);
  }

  function exit() {
    window.location.href = kitchen ? '/lokasi?kitchen_id=' + encodeURIComponent(kitchen.id) + '&highlight=true' : '/lokasi';
  }

  next.addEventListener('click', () => {
    if (step === 'manual-form') { submit(); return; }
    if (step === 'sppg-result' && insights) { goTo('insight-1'); return; }
    if (step === 'insight-summary') { exit(); return; }
    const index = chapters.indexOf(step);
    if (index >= 0) {
      complete.add(step);
      const target = reviewing ? 'insight-summary' : chapters[index + 1] || 'insight-summary';
      reviewing = false;
      goTo(target);
    }
  });
  button('story-back').addEventListener('click', () => {
    if (reviewing) { reviewing = false; goTo('insight-summary', 'back'); return; }
    if (step === 'manual-form') { lookupVersion++; goTo('permission', 'back'); return; }
    if (step === 'sppg-result') { manual(); return; }
    goTo(step === 'insight-summary' ? 'insight-4' : chapters[chapters.indexOf(step) - 1] || 'sppg-result', 'back');
  });
  button('btn-allow-location').addEventListener('click', allowLocation);
  ['btn-deny-location', 'change-location', 'cancel-search'].forEach(id => button(id).addEventListener('click', manual));
  button('btn-skip-insights').addEventListener('click', exit);
  button('story-retry').addEventListener('click', () => {
    const action = retry;
    alert();
    action?.();
  });
  byId('form-location-hierarchy').addEventListener('submit', event => { event.preventDefault(); submit(); });
  ['province', 'city', 'district', 'village'].forEach((key, index, keys) => {
    select(key).addEventListener('change', () => {
      alert();
      keys.slice(index + 1).forEach(child => options(child, []));
      const province = hierarchy.find(p => p.name === select('province').value);
      const city = province?.cities.find(c => c.name === select('city').value);
      const district = city?.districts.find(d => d.name === select('district').value);
      if (key === 'province') options('city', province?.cities.map(c => c.name) ?? []);
      if (key === 'city') options('district', city?.districts.map(d => d.name) ?? []);
      if (key === 'district') options('village', district?.villages ?? []);
      controls();
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-review]').forEach(el => el.addEventListener('click', () => {
    reviewing = true;
    goTo('insight-' + el.dataset.review, 'back');
  }));

  if (initialKitchenId) {
    const version = ++lookupVersion;
    goTo('loading');
    setText('loading-message', 'Menyiapkan cerita dapur pilihanmu.');
    request<Insights>('/api/location/sppg/' + encodeURIComponent(initialKitchenId) + '/insights')
      .then(data => {
        if (version !== lookupVersion) return;
        renderKitchen(data.kitchen);
        renderInsights(data);
      })
      .catch(error => { if (version === lookupVersion) { manual(); alert(message(error)); } });
  }
}
