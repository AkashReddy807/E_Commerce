import { pool, isConnectedToPostgres } from '../db.js';
import { Category } from '../../src/types.js';

let inMemoryCategories: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics & Audio',
    slug: 'electronics',
    icon: 'Headphones',
    description: 'Premium sound systems, noise-canceling headphones & hi-fi gear',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'laptops',
    name: 'Laptops & Computing',
    slug: 'laptops',
    icon: 'Laptop',
    description: 'Ultra-fast ultrabooks, creator laptops and desktop workstations',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'smart-home',
    name: 'Smart Home & IoT',
    slug: 'smart-home',
    icon: 'Home',
    description: 'Intelligent lighting, smart displays and automated home essentials',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'wearables',
    name: 'Smartwatches & Fitness',
    slug: 'wearables',
    icon: 'Watch',
    description: 'Precision health trackers, titanium smartwatches and fitness bands',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cameras',
    name: 'Cameras & Optics',
    slug: 'cameras',
    icon: 'Camera',
    description: 'Mirrorless 4K cinematic cameras, prime lenses and studio accessories',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'accessories',
    name: 'Minimal Accessories',
    slug: 'accessories',
    icon: 'Smartphone',
    description: 'MagSafe docks, wireless chargers, leather sleeves & travel gear',
    imageUrl: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&auto=format&fit=crop&q=80',
  },
];

function mapRowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    description: row.description,
    imageUrl: row.image_url,
  };
}

export class CategoryRepository {
  static async findAll(): Promise<Category[]> {
    if (!isConnectedToPostgres) {
      return inMemoryCategories;
    }
    try {
      const res = await pool.query('SELECT * FROM categories ORDER BY name ASC');
      return res.rows.map(mapRowToCategory);
    } catch {
      return inMemoryCategories;
    }
  }

  static async findById(id: string): Promise<Category | null> {
    if (!isConnectedToPostgres) {
      return inMemoryCategories.find((c) => c.id === id) || null;
    }
    try {
      const res = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      return mapRowToCategory(res.rows[0]);
    } catch {
      return inMemoryCategories.find((c) => c.id === id) || null;
    }
  }

  static async count(): Promise<number> {
    if (!isConnectedToPostgres) {
      return inMemoryCategories.length;
    }
    try {
      const res = await pool.query('SELECT COUNT(*) FROM categories');
      return parseInt(res.rows[0].count, 10);
    } catch {
      return inMemoryCategories.length;
    }
  }
}

