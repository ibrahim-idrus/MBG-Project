import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../data/mbg.db');

// Food items master data - Indonesian common foods
const foodItemsData = [
  // Grains & Staples
  { name: 'Beras (Rice)', default_unit: 'g', calories_per_100g: 130, protein_per_100g: 2.7, carbohydrates_per_100g: 28.2, fat_per_100g: 0.3, fiber_per_100g: 0.4 },
  { name: 'Bihun (Rice Noodles)', default_unit: 'g', calories_per_100g: 109, protein_per_100g: 0.9, carbohydrates_per_100g: 25.9, fat_per_100g: 0.2, fiber_per_100g: 0.9 },
  { name: 'Mie (Noodles)', default_unit: 'g', calories_per_100g: 138, protein_per_100g: 4.5, carbohydrates_per_100g: 25.5, fat_per_100g: 2.1, fiber_per_100g: 1.2 },
  { name: 'Roti (Bread)', default_unit: 'g', calories_per_100g: 265, protein_per_100g: 9.0, carbohydrates_per_100g: 49.0, fat_per_100g: 3.2, fiber_per_100g: 2.7 },
  { name: 'Kentang (Potato)', default_unit: 'g', calories_per_100g: 77, protein_per_100g: 2.0, carbohydrates_per_100g: 17.5, fat_per_100g: 0.1, fiber_per_100g: 2.2 },
  { name: 'Ubi Jalar (Sweet Potato)', default_unit: 'g', calories_per_100g: 86, protein_per_100g: 1.6, carbohydrates_per_100g: 20.1, fat_per_100g: 0.1, fiber_per_100g: 3.0 },

  // Proteins
  { name: 'Ayam (Chicken)', default_unit: 'g', calories_per_100g: 239, protein_per_100g: 27.3, carbohydrates_per_100g: 0, fat_per_100g: 13.6, fiber_per_100g: 0 },
  { name: 'Daging Sapi (Beef)', default_unit: 'g', calories_per_100g: 250, protein_per_100g: 26.0, carbohydrates_per_100g: 0, fat_per_100g: 15.0, fiber_per_100g: 0 },
  { name: 'Ikan (Fish)', default_unit: 'g', calories_per_100g: 206, protein_per_100g: 22.0, carbohydrates_per_100g: 0, fat_per_100g: 12.3, fiber_per_100g: 0 },
  { name: 'Telur (Egg)', default_unit: 'g', calories_per_100g: 155, protein_per_100g: 12.6, carbohydrates_per_100g: 1.1, fat_per_100g: 10.6, fiber_per_100g: 0 },
  { name: 'Tahu (Tofu)', default_unit: 'g', calories_per_100g: 76, protein_per_100g: 8.1, carbohydrates_per_100g: 1.9, fat_per_100g: 4.8, fiber_per_100g: 0.3 },
  { name: 'Tempe (Tempeh)', default_unit: 'g', calories_per_100g: 192, protein_per_100g: 20.3, carbohydrates_per_100g: 7.6, fat_per_100g: 10.8, fiber_per_100g: 1.4 },

  // Vegetables
  { name: 'Bayam (Spinach)', default_unit: 'g', calories_per_100g: 23, protein_per_100g: 2.9, carbohydrates_per_100g: 3.6, fat_per_100g: 0.4, fiber_per_100g: 2.2 },
  { name: 'Wortel (Carrot)', default_unit: 'g', calories_per_100g: 41, protein_per_100g: 0.9, carbohydrates_per_100g: 9.6, fat_per_100g: 0.2, fiber_per_100g: 2.8 },
  { name: 'Brokoli (Broccoli)', default_unit: 'g', calories_per_100g: 34, protein_per_100g: 2.8, carbohydrates_per_100g: 6.6, fat_per_100g: 0.4, fiber_per_100g: 2.6 },
  { name: 'Kangkung (Water Spinach)', default_unit: 'g', calories_per_100g: 19, protein_per_100g: 2.6, carbohydrates_per_100g: 3.1, fat_per_100g: 0.2, fiber_per_100g: 2.1 },
  { name: 'Labu Siam (Chayote)', default_unit: 'g', calories_per_100g: 19, protein_per_100g: 0.8, carbohydrates_per_100g: 4.5, fat_per_100g: 0.1, fiber_per_100g: 1.7 },

  // Fruits
  { name: 'Pisang (Banana)', default_unit: 'g', calories_per_100g: 89, protein_per_100g: 1.1, carbohydrates_per_100g: 22.8, fat_per_100g: 0.3, fiber_per_100g: 2.6 },
  { name: 'Apel (Apple)', default_unit: 'g', calories_per_100g: 52, protein_per_100g: 0.3, carbohydrates_per_100g: 13.8, fat_per_100g: 0.2, fiber_per_100g: 2.4 },
  { name: 'Jeruk (Orange)', default_unit: 'g', calories_per_100g: 47, protein_per_100g: 0.9, carbohydrates_per_100g: 11.8, fat_per_100g: 0.1, fiber_per_100g: 2.4 },

  // Dairy
  { name: 'Susu (Milk)', default_unit: 'ml', calories_per_100g: 42, protein_per_100g: 3.4, carbohydrates_per_100g: 5.0, fat_per_100g: 1.0, fiber_per_100g: 0 },
  { name: 'Yogurt', default_unit: 'g', calories_per_100g: 59, protein_per_100g: 10.0, carbohydrates_per_100g: 3.6, fat_per_100g: 0.4, fiber_per_100g: 0 },

  // Legumes & Nuts
  { name: 'Kacang Hijau (Mung Bean)', default_unit: 'g', calories_per_100g: 347, protein_per_100g: 23.9, carbohydrates_per_100g: 62.6, fat_per_100g: 1.2, fiber_per_100g: 16.3 },
  { name: 'Kacang Tanah (Peanut)', default_unit: 'g', calories_per_100g: 567, protein_per_100g: 25.8, carbohydrates_per_100g: 16.1, fat_per_100g: 49.2, fiber_per_100g: 8.5 },

  // Oils & Fats
  { name: 'Minyak Goreng (Cooking Oil)', default_unit: 'ml', calories_per_100g: 884, protein_per_100g: 0, carbohydrates_per_100g: 0, fat_per_100g: 100, fiber_per_100g: 0 },
  { name: 'Margarine', default_unit: 'g', calories_per_100g: 717, protein_per_100g: 0.2, carbohydrates_per_100g: 0.9, fat_per_100g: 80.7, fiber_per_100g: 0 },

  // Spices & Condiments
  { name: 'Gula (Sugar)', default_unit: 'g', calories_per_100g: 387, protein_per_100g: 0, carbohydrates_per_100g: 100, fat_per_100g: 0, fiber_per_100g: 0 },
  { name: 'Garam (Salt)', default_unit: 'g', calories_per_100g: 0, protein_per_100g: 0, carbohydrates_per_100g: 0, fat_per_100g: 0, fiber_per_100g: 0 },
  { name: 'Bawang Merah (Shallot)', default_unit: 'g', calories_per_100g: 72, protein_per_100g: 2.5, carbohydrates_per_100g: 16.8, fat_per_100g: 0.1, fiber_per_100g: 3.2 },
  { name: 'Bawang Putih (Garlic)', default_unit: 'g', calories_per_100g: 149, protein_per_100g: 6.4, carbohydrates_per_100g: 33.1, fat_per_100g: 0.5, fiber_per_100g: 2.1 },
  { name: 'Cabai (Chili)', default_unit: 'g', calories_per_100g: 40, protein_per_100g: 1.9, carbohydrates_per_100g: 8.8, fat_per_100g: 0.4, fiber_per_100g: 1.5 },
];

// Menu compositions - linking menus to food items
const menuCompositionsData = [
  // Menu 1: Bubur Ayam Spesial (Breakfast)
  { menu_name: 'Bubur Ayam Spesial', food_name: 'Beras (Rice)', amount: 100, unit: 'g' },
  { menu_name: 'Bubur Ayam Spesial', food_name: 'Ayam (Chicken)', amount: 50, unit: 'g' },
  { menu_name: 'Bubur Ayam Spesial', food_name: 'Telur (Egg)', amount: 30, unit: 'g' },
  { menu_name: 'Bubur Ayam Spesial', food_name: 'Bawang Merah (Shallot)', amount: 10, unit: 'g' },

  // Menu 2: Nasi Uduk Betawi (Breakfast)
  { menu_name: 'Nasi Uduk Betawi', food_name: 'Beras (Rice)', amount: 150, unit: 'g' },
  { menu_name: 'Nasi Uduk Betawi', food_name: 'Telur (Egg)', amount: 50, unit: 'g' },
  { menu_name: 'Nasi Uduk Betawi', food_name: 'Tempe (Tempeh)', amount: 50, unit: 'g' },
  { menu_name: 'Nasi Uduk Betawi', food_name: 'Minyak Goreng (Cooking Oil)', amount: 10, unit: 'ml' },

  // Menu 3: Ayam Goreng dengan Nasi (Lunch)
  { menu_name: 'Ayam Goreng dengan Nasi', food_name: 'Beras (Rice)', amount: 200, unit: 'g' },
  { menu_name: 'Ayam Goreng dengan Nasi', food_name: 'Ayam (Chicken)', amount: 150, unit: 'g' },
  { menu_name: 'Ayam Goreng dengan Nasi', food_name: 'Minyak Goreng (Cooking Oil)', amount: 20, unit: 'ml' },
  { menu_name: 'Ayam Goreng dengan Nasi', food_name: 'Bawang Putih (Garlic)', amount: 5, unit: 'g' },

  // Menu 4: Ikan Bakar dengan Nasi (Lunch)
  { menu_name: 'Ikan Bakar dengan Nasi', food_name: 'Beras (Rice)', amount: 200, unit: 'g' },
  { menu_name: 'Ikan Bakar dengan Nasi', food_name: 'Ikan (Fish)', amount: 150, unit: 'g' },
  { menu_name: 'Ikan Bakar dengan Nasi', food_name: 'Bawang Merah (Shallot)', amount: 15, unit: 'g' },
  { menu_name: 'Ikan Bakar dengan Nasi', food_name: 'Cabai (Chili)', amount: 10, unit: 'g' },

  // Menu 5: Rendang dengan Nasi (Lunch)
  { menu_name: 'Rendang dengan Nasi', food_name: 'Beras (Rice)', amount: 200, unit: 'g' },
  { menu_name: 'Rendang dengan Nasi', food_name: 'Daging Sapi (Beef)', amount: 120, unit: 'g' },
  { menu_name: 'Rendang dengan Nasi', food_name: 'Bayam (Spinach)', amount: 50, unit: 'g' },
  { menu_name: 'Rendang dengan Nasi', food_name: 'Minyak Goreng (Cooking Oil)', amount: 15, unit: 'ml' },

  // Menu 6: Pisang Goreng (Snack)
  { menu_name: 'Pisang Goreng', food_name: 'Pisang (Banana)', amount: 100, unit: 'g' },
  { menu_name: 'Pisang Goreng', food_name: 'Minyak Goreng (Cooking Oil)', amount: 15, unit: 'ml' },
  { menu_name: 'Pisang Goreng', food_name: 'Gula (Sugar)', amount: 10, unit: 'g' },

  // Menu 7: Roti Isi Coklat (Snack)
  { menu_name: 'Roti Isi Coklat', food_name: 'Roti (Bread)', amount: 60, unit: 'g' },
  { menu_name: 'Roti Isi Coklat', food_name: 'Gula (Sugar)', amount: 15, unit: 'g' },
  { menu_name: 'Roti Isi Coklat', food_name: 'Margarine', amount: 5, unit: 'g' },
];

export function seedFoodItems(): void {
  console.log('Seeding food items and menu compositions...');
  
  const db = new Database(DB_PATH);
  
  // Check if food items already exist
  const foodItemCount = db.prepare('SELECT COUNT(*) as count FROM food_items').get() as { count: number };
  
  if (foodItemCount.count === 0) {
    console.log('Seeding food items...');
    const insertFoodItem = db.prepare(`
      INSERT INTO food_items (name, default_unit, calories_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, fiber_per_100g)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const item of foodItemsData) {
      insertFoodItem.run(item.name, item.default_unit, item.calories_per_100g, item.protein_per_100g, item.carbohydrates_per_100g, item.fat_per_100g, item.fiber_per_100g);
    }
    
    console.log(`✓ ${foodItemsData.length} food items seeded`);
  } else {
    console.log(`Food items already exist (${foodItemCount.count} items), skipping...`);
  }
  
  // Check if menu compositions already exist
  const compositionCount = db.prepare('SELECT COUNT(*) as count FROM menu_compositions').get() as { count: number };
  
  if (compositionCount.count === 0) {
    console.log('Seeding menu compositions...');
    const insertComposition = db.prepare(`
      INSERT INTO menu_compositions (menu_id, food_item_id, amount, unit, calories, protein, carbohydrates, fat, fiber)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const comp of menuCompositionsData) {
      // Get menu_id by name
      const menu = db.prepare('SELECT id FROM menus WHERE name = ?').get(comp.menu_name) as { id: number } | undefined;
      
      // Get food_item_id by name
      const foodItem = db.prepare('SELECT id, calories_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, fiber_per_100g FROM food_items WHERE name = ?').get(comp.food_name) as any;
      
      if (menu && foodItem) {
        // Calculate nutrition based on amount
        const factor = comp.amount / 100;
        const calories = Math.round(foodItem.calories_per_100g * factor * 100) / 100;
        const protein = Math.round(foodItem.protein_per_100g * factor * 100) / 100;
        const carbohydrates = Math.round(foodItem.carbohydrates_per_100g * factor * 100) / 100;
        const fat = Math.round(foodItem.fat_per_100g * factor * 100) / 100;
        const fiber = Math.round(foodItem.fiber_per_100g * factor * 100) / 100;
        
        insertComposition.run(menu.id, foodItem.id, comp.amount, comp.unit, calories, protein, carbohydrates, fat, fiber);
      }
    }
    
    console.log(`✓ ${menuCompositionsData.length} menu compositions seeded`);
  } else {
    console.log(`Menu compositions already exist (${compositionCount.count} items), skipping...`);
  }
  
  db.close();
  console.log('Food items and menu compositions seed completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFoodItems();
}
