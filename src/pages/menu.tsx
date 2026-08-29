import type { FC } from 'hono/jsx';
import { AdminLayout } from '../layouts/AdminLayout.js';
import { Button } from '../components/Button.js';

interface DayMenu {
  day: string;
  grade: string;
  gradeColor: string;
  meals: { name: string }[];
  calories: string;
}

const weekDays: DayMenu[] = [
  { day: 'Senin', grade: 'A', gradeColor: 'bg-green-100 text-green-700', meals: [{ name: 'Oatmeal with Berries & Almonds' }, { name: 'Grilled Chicken Salad' }, { name: 'Greek Yogurt' }], calories: '920 kcal' },
  { day: 'Selasa', grade: 'B+', gradeColor: 'bg-green-100 text-green-700', meals: [{ name: 'Scrambled Eggs & Toast' }, { name: 'Beef Stir-fry with Rice' }, { name: 'Apple Slices & Peanut Butter' }], calories: '1200 kcal' },
  { day: 'Rabu', grade: 'A', gradeColor: 'bg-green-100 text-green-700', meals: [], calories: '' },
  { day: 'Kamis', grade: 'B', gradeColor: 'bg-yellow-100 text-yellow-700', meals: [], calories: '' },
  { day: 'Jumat', grade: 'A-', gradeColor: 'bg-green-100 text-green-700', meals: [], calories: '' },
  { day: 'Sabtu', grade: '-', gradeColor: 'bg-gray-100 text-gray-500', meals: [], calories: '' },
  { day: 'Minggu', grade: '-', gradeColor: 'bg-gray-100 text-gray-500', meals: [], calories: '' },
];

export const MenuPage: FC = () => {
  return (
    <AdminLayout title="Menu & Gizi" activePage="/admin/menu">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 class="font-display-lg text-display-lg text-on-surface">Weekly Menu Schedule</h2>
          <p class="font-body-md text-body-md text-on-surface-variant mt-1">Manage and monitor nutritional values for the upcoming week.</p>
        </div>
        <Button variant="primary" shape="pill">
          <span class="material-symbols-outlined text-[18px]">edit</span>
          Edit Schedule
        </Button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)] col-span-1">
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-2">Weekly Nutrition Score</p>
          <div class="flex items-end gap-2">
            <span class="font-display-lg text-display-lg text-on-surface">A-</span>
            <span class="text-green-600 font-label-md text-label-md flex items-center gap-1 mb-1">
              <span class="material-symbols-outlined text-[14px]">arrow_upward</span> 2%
            </span>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">from last week</p>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Avg Calories/Day</p>
          <p class="font-headline-md text-headline-md text-on-surface">2,150</p>
          <p class="font-body-sm text-body-sm text-outline">kcal</p>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Avg Protein/Day</p>
          <p class="font-headline-md text-headline-md text-on-surface">65</p>
          <p class="font-body-sm text-body-sm text-outline">g</p>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Avg Carbs/Day</p>
          <p class="font-headline-md text-headline-md text-on-surface">280</p>
          <p class="font-body-sm text-body-sm text-outline">g</p>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Avg Fats/Day</p>
          <p class="font-headline-md text-headline-md text-on-surface">55</p>
          <p class="font-body-sm text-body-sm text-outline">g</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {weekDays.map((day) => (
          <div class="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
            <div class="p-4 border-b border-surface-variant flex justify-between items-center">
              <p class="font-headline-sm text-headline-sm text-on-surface">{day.day}</p>
              <span class={`px-2.5 py-1 rounded-full text-xs font-semibold ${day.gradeColor}`}>{day.grade}</span>
            </div>
            <div class="p-4">
              {day.meals.length > 0 ? (
                <div class="space-y-2">
                  {day.meals.map((meal) => (
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-[16px] text-on-surface-variant">restaurant</span>
                      <span class="font-body-sm text-body-sm text-on-surface">{meal.name}</span>
                    </div>
                  ))}
                  <div class="mt-3 pt-3 border-t border-surface-variant">
                    <span class="font-label-md text-label-md text-primary">{day.calories}</span>
                  </div>
                </div>
              ) : (
                <div class="flex flex-col items-center justify-center py-6 text-on-surface-variant">
                  <span class="material-symbols-outlined text-3xl mb-2 opacity-50">no_meals</span>
                  <p class="font-body-sm text-body-sm opacity-70">
                    {day.day === 'Sabtu' || day.day === 'Minggu' ? 'Weekend off' : 'Menu details set'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};
