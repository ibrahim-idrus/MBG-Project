import type { FC } from 'hono/jsx';
import { AdminLayout } from '../../layouts/AdminLayout.js';

export const JadwalMenuPage: FC = () => {
  return (
    <AdminLayout title="Jadwal Menu" activePage="/menu" variant="user">
      <div class="max-w-4xl w-full mx-auto" id="menu-root">
        <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-card-padding">
          <h3 class="font-headline-sm text-headline-sm text-on-background mb-6">Jadwal Menu 7 Hari ke Depan</h3>

          {/* Day Picker */}
          <div id="day-picker" class="flex overflow-x-auto pb-4 mb-6 gap-2 snap-x" style="scrollbar-width:none;-ms-overflow-style:none;"></div>

          <div class="border-t border-surface-variant mb-6"></div>

          {/* Menu List View */}
          <div id="view-menus">
            <div id="menus-loading" class="text-center py-12">
              <span class="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">progress_activity</span>
              <p class="font-body-sm text-body-sm text-on-surface-variant mt-2">Memuat data menu...</p>
            </div>
            <div id="menus-content" class="hidden"></div>
            <div id="menus-empty" class="hidden text-center py-12">
              <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-3">restaurant</span>
              <p class="font-body-md text-body-md text-on-surface-variant">Belum ada menu untuk hari ini.</p>
            </div>
            <div id="menus-error" class="hidden text-center py-12">
              <span class="material-symbols-outlined text-4xl text-error mb-3">error</span>
              <p class="font-body-md text-body-md text-error">Gagal memuat data menu. Silakan coba lagi.</p>
            </div>
          </div>

          {/* Menu Detail View */}
          <div id="view-detail" class="hidden">
            <div class="mb-6">
              <button id="btn-back" class="flex items-center gap-2 text-primary font-label-md text-label-md hover:bg-primary/10 px-3 py-1.5 rounded-full transition-colors">
                <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                Kembali
              </button>
            </div>
            <div id="detail-content"></div>
          </div>
        </div>

        {/* Keterangan */}
        <div class="mt-6">
          <h5 class="font-label-md text-label-md text-on-background mb-2">Keterangan</h5>
          <ul class="font-body-sm text-body-sm text-on-surface-variant space-y-1 list-disc pl-4">
            <li>Informasi gizi merupakan perkiraan per porsi.</li>
            <li>Menu dapat berubah sewaktu-waktu.</li>
          </ul>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        #day-picker::-webkit-scrollbar { display: none; }
      ` }}></style>

      <script dangerouslySetInnerHTML={{ __html: `
(function() {
  var DAY_NAMES = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  var MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
  var MEAL_LABELS = { breakfast: 'Sarapan', lunch: 'Makan Siang', snack: 'Snack' };

  function formatDateShort(d) {
    return d.getDate() + ' ' + MONTH_NAMES[d.getMonth()];
  }

  function formatDateLong(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    return DAY_NAMES[d.getDay()] + ', ' + d.getDate() + ' ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
  }

  function getWeekDays() {
    var now = new Date();
    var dayOfWeek = now.getDay();
    var mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    var monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = new Date(monday);
      d.setDate(monday.getDate() + i);
      var yyyy = d.getFullYear();
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var dd = String(d.getDate()).padStart(2, '0');
      days.push({
        name: DAY_NAMES[d.getDay()],
        date: formatDateShort(d),
        dateStr: yyyy + '-' + mm + '-' + dd,
        isToday: d.toDateString() === now.toDateString()
      });
    }
    return days;
  }

  var weekDays = getWeekDays();
  var selectedDate = weekDays.find(function(d) { return d.isToday; }).dateStr;

  // Render day picker
  var pickerHtml = '';
  for (var i = 0; i < weekDays.length; i++) {
    var day = weekDays[i];
    var isActive = day.dateStr === selectedDate;
    var isWeekend = i >= 5;
    var classes = 'min-w-[70px] snap-start flex-shrink-0 flex flex-col items-center justify-center py-3 px-2 rounded-lg cursor-pointer transition-colors border ';
    if (isActive) {
      classes += 'bg-tertiary-container text-on-tertiary-container border-tertiary-container';
    } else {
      classes += 'bg-surface text-on-surface-variant border-surface-variant hover:border-outline';
      if (isWeekend) classes += ' opacity-60';
    }
    pickerHtml += '<button class="' + classes + '" data-date="' + day.dateStr + '">';
    pickerHtml += '<span class="font-label-md text-label-md font-bold mb-1">' + day.name + '</span>';
    pickerHtml += '<span class="font-body-sm text-body-sm' + (isActive ? ' opacity-90' : '') + '">' + day.date + '</span>';
    pickerHtml += '</button>';
  }
  document.getElementById('day-picker').innerHTML = pickerHtml;

  // Day click handler
  document.getElementById('day-picker').addEventListener('click', function(e) {
    var btn = e.target.closest('button[data-date]');
    if (!btn) return;
    selectedDate = btn.dataset.date;
    updateDayPicker();
    loadMenus(selectedDate);
    showView('menus');
  });

  function updateDayPicker() {
    var buttons = document.querySelectorAll('#day-picker button[data-date]');
    buttons.forEach(function(btn) {
      var isActive = btn.dataset.date === selectedDate;
      var isWeekend = btn === buttons[5] || btn === buttons[6];
      btn.className = 'min-w-[70px] snap-start flex-shrink-0 flex flex-col items-center justify-center py-3 px-2 rounded-lg cursor-pointer transition-colors border ';
      if (isActive) {
        btn.className += 'bg-tertiary-container text-on-tertiary-container border-tertiary-container';
      } else {
        btn.className += 'bg-surface text-on-surface-variant border-surface-variant hover:border-outline';
        if (isWeekend) btn.className += ' opacity-60';
      }
      var spanLabel = btn.querySelector('span:first-child');
      var spanDate = btn.querySelector('span:last-child');
      if (isActive) {
        spanDate.className = 'font-body-sm text-body-sm opacity-90';
      } else {
        spanDate.className = 'font-body-sm text-body-sm';
      }
    });
  }

  function showView(name) {
    document.getElementById('view-menus').classList.toggle('hidden', name !== 'menus');
    document.getElementById('view-detail').classList.toggle('hidden', name !== 'detail');
  }

  function esc(str) {
    if (str == null) return '';
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  async function loadMenus(date) {
    document.getElementById('menus-loading').classList.remove('hidden');
    document.getElementById('menus-content').classList.add('hidden');
    document.getElementById('menus-empty').classList.add('hidden');
    document.getElementById('menus-error').classList.add('hidden');
    try {
      var res = await fetch('/api/menus?date=' + date);
      if (!res.ok) throw new Error('Gagal memuat data');
      var json = await res.json();
      var menus = json.data || [];
      document.getElementById('menus-loading').classList.add('hidden');
      if (menus.length === 0) {
        document.getElementById('menus-empty').classList.remove('hidden');
        return;
      }
      var html = '';
      for (var i = 0; i < menus.length; i++) {
        var menu = menus[i];
        var mealLabel = MEAL_LABELS[menu.meal_type] || menu.meal_type;
        html += '<div class="mb-8 last:mb-0">';
        html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">';

        // Photo
        html += '<div class="rounded-xl overflow-hidden bg-surface-container-low aspect-video md:aspect-[4/3] relative cursor-pointer group" data-menu-id="' + menu.id + '">';
        if (menu.photo_url) {
          html += '<img alt="Foto ' + esc(menu.name) + '" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" src="' + esc(menu.photo_url) + '" onerror="this.style.display=\\'none\\';this.nextElementSibling.style.display=\\'flex\\'">';
          html += '<div class="absolute inset-0 flex-col items-center justify-center text-on-surface-variant hidden">';
          html += '<span class="material-symbols-outlined text-4xl mb-2">restaurant</span>';
          html += '<span class="font-body-sm text-body-sm">' + esc(menu.name) + '</span>';
          html += '</div>';
        } else {
          html += '<div class="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant">';
          html += '<span class="material-symbols-outlined text-4xl mb-2">restaurant</span>';
          html += '<span class="font-body-sm text-body-sm">' + esc(menu.name) + '</span>';
          html += '</div>';
        }
        html += '</div>';

        // Menu items
        html += '<div class="flex flex-col justify-center">';
        html += '<h4 class="font-headline-sm text-headline-sm text-on-background mb-1">' + esc(menu.name) + '</h4>';
        html += '<p class="font-label-md text-label-md text-primary mb-4">' + esc(mealLabel) + '</p>';

        if (menu.description) {
          html += '<p class="font-body-sm text-body-sm text-on-surface-variant mb-4">' + esc(menu.description) + '</p>';
        }

        html += '<button class="text-left w-full text-primary font-label-md text-label-md hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-2" data-menu-id="' + menu.id + '">';
        html += '<span class="material-symbols-outlined text-[18px]">visibility</span>';
        html += 'Lihat Detail';
        html += '</button>';

        html += '</div>';
        html += '</div>';

        // Nutrition grid
        html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">';
        var nutrients = [
          { label: 'Kalori', value: menu.total_calories, unit: 'kcal' },
          { label: 'Protein', value: menu.total_protein, unit: 'g' },
          { label: 'Karbohidrat', value: menu.total_carbohydrates, unit: 'g' },
          { label: 'Lemak', value: menu.total_fat, unit: 'g' }
        ];
        for (var j = 0; j < nutrients.length; j++) {
          var n = nutrients[j];
          html += '<div class="border border-surface-variant rounded-lg p-4 flex flex-col items-center justify-center bg-surface hover:shadow-sm transition-shadow">';
          html += '<span class="font-label-md text-label-md text-on-surface-variant mb-1">' + n.label + '</span>';
          html += '<span class="font-display-lg text-display-lg text-on-background font-bold mb-1">' + (n.value || 0) + '</span>';
          html += '<span class="font-body-sm text-body-sm text-outline">' + n.unit + '</span>';
          html += '</div>';
        }
        html += '</div>';

        if (i < menus.length - 1) {
          html += '<div class="border-t border-surface-variant my-6"></div>';
        }

        html += '</div>';
      }
      document.getElementById('menus-content').innerHTML = html;
      document.getElementById('menus-content').classList.remove('hidden');
    } catch(e) {
      document.getElementById('menus-loading').classList.add('hidden');
      document.getElementById('menus-error').classList.remove('hidden');
    }
  }

  // Click handler for menu detail
  document.getElementById('menus-content').addEventListener('click', function(e) {
    var btn = e.target.closest('[data-menu-id]');
    if (!btn) return;
    openMenuDetail(btn.dataset.menuId);
  });

  document.getElementById('btn-back').addEventListener('click', function() {
    showView('menus');
  });

  async function openMenuDetail(id) {
    showView('detail');
    var container = document.getElementById('detail-content');
    container.innerHTML = '<div class="text-center py-12"><span class="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">progress_activity</span><p class="font-body-sm text-body-sm text-on-surface-variant mt-2">Memuat detail menu...</p></div>';
    try {
      var res = await fetch('/api/menus/' + id);
      if (!res.ok) throw new Error('Gagal memuat detail');
      var json = await res.json();
      var menu = json.data;
      var mealLabel = MEAL_LABELS[menu.meal_type] || menu.meal_type;
      var compositions = menu.compositions || [];

      var html = '';

      // Photo
      html += '<div class="rounded-xl overflow-hidden bg-surface-container-low aspect-video md:aspect-[4/3] mb-6 relative">';
      if (menu.photo_url) {
        html += '<img alt="Foto ' + esc(menu.name) + '" class="object-cover w-full h-full" src="' + esc(menu.photo_url) + '" onerror="this.style.display=\\'none\\';this.nextElementSibling.style.display=\\'flex\\'">';
        html += '<div class="absolute inset-0 flex-col items-center justify-center text-on-surface-variant hidden">';
        html += '<span class="material-symbols-outlined text-4xl mb-2">restaurant</span>';
        html += '<span class="font-body-sm text-body-sm">' + esc(menu.name) + '</span>';
        html += '</div>';
      } else {
        html += '<div class="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant">';
        html += '<span class="material-symbols-outlined text-4xl mb-2">restaurant</span>';
        html += '<span class="font-body-sm text-body-sm">' + esc(menu.name) + '</span>';
        html += '</div>';
      }
      html += '</div>';

      // Menu info
      html += '<div class="mb-8">';
      html += '<h3 class="font-headline-md text-headline-md text-on-background mb-4">' + esc(menu.name) + '</h3>';
      html += '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">';
      var infoItems = [
        { icon: 'storefront', label: 'Dapur MBG', value: menu.kitchen_name },
        { icon: 'school', label: 'Sekolah', value: menu.school_name },
        { icon: 'calendar_today', label: 'Tanggal', value: formatDateLong(menu.menu_date) },
        { icon: 'restaurant_menu', label: 'Jenis Makan', value: mealLabel }
      ];
      for (var k = 0; k < infoItems.length; k++) {
        var item = infoItems[k];
        html += '<div class="flex items-start gap-3">';
        html += '<span class="material-symbols-outlined text-[20px] text-primary mt-0.5">' + item.icon + '</span>';
        html += '<div>';
        html += '<p class="font-label-md text-label-md text-on-surface-variant">' + item.label + '</p>';
        html += '<p class="font-body-md text-body-md text-on-surface">' + esc(item.value || '-') + '</p>';
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
      if (menu.description) {
        html += '<div class="bg-surface-container-low rounded-lg p-4 border border-surface-variant">';
        html += '<p class="font-label-md text-label-md text-on-surface-variant mb-1">Deskripsi</p>';
        html += '<p class="font-body-md text-body-md text-on-surface">' + esc(menu.description) + '</p>';
        html += '</div>';
      }
      html += '</div>';

      // Composition & Nutrition
      if (compositions.length > 0) {
        html += '<h4 class="font-headline-sm text-headline-sm text-on-background mb-4">Komposisi & Gizi</h4>';
        html += '<div class="bg-surface-container-low rounded-xl border border-surface-variant overflow-hidden mb-6">';
        html += '<div class="grid grid-cols-2 gap-0 bg-surface-container-high">';
        html += '<div class="px-4 py-3 font-label-md text-label-md text-on-surface-variant border-r border-surface-variant">Komposisi</div>';
        html += '<div class="px-4 py-3 font-label-md text-label-md text-on-surface-variant">Gizi</div>';
        html += '</div>';
        for (var c = 0; c < compositions.length; c++) {
          var comp = compositions[c];
          var borderClass = c < compositions.length - 1 ? 'border-b border-surface-variant' : '';
          html += '<div class="grid grid-cols-2 gap-0 ' + borderClass + '">';
          html += '<div class="px-4 py-3 border-r border-surface-variant">';
          html += '<p class="font-body-md text-body-md text-on-surface font-medium">' + esc(comp.food_item_name) + '</p>';
          html += '<p class="font-body-sm text-body-sm text-on-surface-variant">' + comp.amount + ' ' + esc(comp.unit) + '</p>';
          html += '</div>';
          html += '<div class="px-4 py-3">';
          var compNutrients = [
            { label: 'Protein', value: comp.protein },
            { label: 'Karbohidrat', value: comp.carbohydrates },
            { label: 'Lemak', value: comp.fat },
            { label: 'Serat', value: comp.fiber }
          ];
          for (var n = 0; n < compNutrients.length; n++) {
            var nutrient = compNutrients[n];
            html += '<p class="font-body-sm text-body-sm text-on-surface">' + nutrient.label + ' <span class="font-semibold">' + nutrient.value + 'g</span></p>';
          }
          html += '</div>';
          html += '</div>';
        }
        html += '</div>';
      }

      // Total nutrition
      html += '<h4 class="font-headline-sm text-headline-sm text-on-background mb-4">Total Gizi</h4>';
      html += '<div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">';
      var totalNutrients = [
        { label: 'Kalori', value: menu.total_calories, unit: 'kcal' },
        { label: 'Protein', value: menu.total_protein, unit: 'g' },
        { label: 'Karbohidrat', value: menu.total_carbohydrates, unit: 'g' },
        { label: 'Lemak', value: menu.total_fat, unit: 'g' },
        { label: 'Serat', value: menu.total_fiber, unit: 'g' }
      ];
      for (var t = 0; t < totalNutrients.length; t++) {
        var tn = totalNutrients[t];
        html += '<div class="border border-surface-variant rounded-lg p-4 flex flex-col items-center justify-center bg-surface hover:shadow-sm transition-shadow">';
        html += '<span class="font-label-md text-label-md text-on-surface-variant mb-1">' + tn.label + '</span>';
        html += '<span class="font-display-lg text-display-lg text-on-background font-bold mb-1">' + (tn.value || 0) + '</span>';
        html += '<span class="font-body-sm text-body-sm text-outline">' + tn.unit + '</span>';
        html += '</div>';
      }
      html += '</div>';

      container.innerHTML = html;
    } catch(e) {
      container.innerHTML = '<div class="text-center py-12"><span class="material-symbols-outlined text-4xl text-error mb-3">error</span><p class="font-body-md text-body-md text-error">Gagal memuat detail menu. Silakan coba lagi.</p></div>';
    }
  }

  // Initial load
  loadMenus(selectedDate);
})();
` }}></script>
    </AdminLayout>
  );
};
