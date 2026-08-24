import { pool, isConnectedToPostgres } from '../db.js';
import { Product } from '../../src/types.js';

// In-memory fallback dataset for seamless offline/resilient operations
let inMemoryProducts: Product[] = [
  {
    id: 'prod-1',
    title: 'Aura Sound Pro Wireless Noise-Cancelling Headphones',
    slug: 'aura-sound-pro-headphones',
    description: 'Engineered with custom 40mm beryllium drivers, active hybrid noise cancellation, 45-hour battery life, and ultra-plush memory foam earcups.',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.9,
    reviewsCount: 128,
    stock: 24,
    categoryId: 'electronics',
    brand: 'Acoustica',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
    ],
    features: [
      'Hybrid Active Noise Cancellation (42dB)',
      '45-Hour Playback with Fast Charge (10m = 5h)',
      'Lossless Spatial Audio with Head Tracking',
      'Multipoint Bluetooth 5.4 Connectivity',
    ],
    badge: 'Best Seller',
  },
  {
    id: 'prod-2',
    title: 'Nova UltraBook Pro 16 - M3 Max Grade Titanium',
    slug: 'nova-ultrabook-pro-16',
    description: 'Liquid Retina XDR display with 120Hz ProMotion, 32GB Unified Memory, 1TB NVMe Gen4 SSD, and whisper-quiet dual fan cooling.',
    price: 1899.0,
    originalPrice: 2099.0,
    rating: 4.8,
    reviewsCount: 85,
    stock: 12,
    categoryId: 'laptops',
    brand: 'NovaTech',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
    ],
    features: [
      '16.2-inch 3.4K OLED Display (1600 nits)',
      '32-Core Neural Engine for AI Acceleration',
      '22-Hour Battery Endurance',
      'Full Array of Thunderbolt 4 Ports',
    ],
    badge: 'Top Rated',
  },
  {
    id: 'prod-3',
    title: 'Aero Chrono Titanium Smartwatch Edition',
    slug: 'aero-chrono-titanium-smartwatch',
    description: 'Aerospace-grade titanium casing, sapphire crystal lens, dual-frequency GPS, ECG monitor, and continuous skin temperature sensor.',
    price: 429.0,
    originalPrice: 499.0,
    rating: 4.7,
    reviewsCount: 94,
    stock: 30,
    categoryId: 'wearables',
    brand: 'AeroTime',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    ],
    features: [
      '100m Water Resistance & Titanium Bezel',
      'Dual-Frequency Multi-GNSS Realtime Tracking',
      '14-Day Battery in Smart Mode',
      'Comprehensive Health & Sleep Metrics',
    ],
    badge: 'New Arrival',
  },
  {
    id: 'prod-4',
    title: 'Lumina Smart Ambient Studio Bar & Light Hub',
    slug: 'lumina-smart-ambient-bar',
    description: 'Full-spectrum RGBIC lighting with dynamic audio sync, Matter & Thread certified, adaptive color temperature, and magnetic desk mounting.',
    price: 119.5,
    originalPrice: 149.0,
    rating: 4.6,
    reviewsCount: 62,
    stock: 45,
    categoryId: 'smart-home',
    brand: 'Lumina',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
    ],
    features: [
      'Matter & HomeKit / Alexa Certified',
      'Zero-Latency Screen Mirroring Sync',
      '16 Million Colors & Tunable White (2000K-6500K)',
      'Touch Sensitive Slider Base',
    ],
    badge: 'Popular',
  },
  {
    id: 'prod-5',
    title: 'Vortex Mirrorless Cine 4K Studio Camera',
    slug: 'vortex-mirrorless-cine-camera',
    description: 'Full-frame 33MP BSI CMOS sensor, internal 4K 120p 10-bit 4:2:2 recording, 5-axis sensor-shift image stabilization, and dual CFexpress slots.',
    price: 1649.0,
    originalPrice: 1799.0,
    rating: 4.9,
    reviewsCount: 41,
    stock: 8,
    categoryId: 'cameras',
    brand: 'Vortex Optics',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    ],
    features: [
      '33MP Back-Illuminated Full-Frame Sensor',
      '759 Phase-Detection AF Points with AI Subject Detect',
      'Active Sensor Cooling Fan',
      'Real-time Eye AF for Humans, Animals & Birds',
    ],
    badge: 'Featured',
  },
  {
    id: 'prod-6',
    title: 'Minimalist Aluminum MagSafe 3-in-1 Charging Stand',
    slug: 'minimalist-aluminum-magsafe-stand',
    description: 'CNC machined anodized aluminum charging dock. Fast charges iPhone (15W), Apple Watch, and AirPods simultaneously with a single cable.',
    price: 89.0,
    originalPrice: 110.0,
    rating: 4.7,
    reviewsCount: 115,
    stock: 60,
    categoryId: 'accessories',
    brand: 'OrbitDesign',
    images: [
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&auto=format&fit=crop&q=80',
    ],
    features: [
      'Solid Weighted Anodized Aluminum Base',
      'Official Qi2 15W Certified Fast Magnetic Charging',
      'Clean Cable Management System',
      'Adjustable 45-Degree Viewing Angle',
    ],
    badge: 'Staff Pick',
  },
  {
    id: 'prod-7',
    title: 'SonicBloom Hi-Fi Studio Desktop Speakers (Pair)',
    slug: 'sonicbloom-desktop-speakers',
    description: 'Custom woven Kevlar woofers, silk dome tweeters, built-in 24-bit/192kHz DAC, optical input, and optical isolation isolation pads.',
    price: 279.0,
    originalPrice: 320.0,
    rating: 4.8,
    reviewsCount: 53,
    stock: 19,
    categoryId: 'electronics',
    brand: 'Acoustica',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    ],
    features: [
      '120W Peak Total Output Power',
      'Built-in Audiophile Burr-Brown DAC',
      'Bluetooth 5.3 with LDAC / aptX HD',
      'Acoustic Tuning EQ Controls on Rear',
    ],
    badge: 'Hot Deal',
  },
  {
    id: 'prod-8',
    title: 'Apex Pro Mechanical Wireless Keyboard - Hot Swap',
    slug: 'apex-pro-mechanical-keyboard',
    description: 'CNC frosted acrylic chassis, lubed linear switches, gasket mounted plate, south-facing RGB, and 4000mAh battery for 200 hours wireless.',
    price: 149.0,
    originalPrice: 179.0,
    rating: 4.9,
    reviewsCount: 210,
    stock: 38,
    categoryId: 'accessories',
    brand: 'NovaTech',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    ],
    features: [
      '75% Compact Layout with CNC Rotary Knob',
      'Hot-Swappable 5-Pin Switch Sockets',
      'Sound-Dampening Silicone & Poron Foam Layers',
      'Tri-Mode Connection (2.4GHz, BT 5.1, Type-C)',
    ],
    badge: 'Top Seller',
  },
];

function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
    rating: parseFloat(row.rating || 5.0),
    reviewsCount: parseInt(row.reviews_count || 0, 10),
    stock: parseInt(row.stock || 0, 10),
    categoryId: row.category_id,
    brand: row.brand,
    images: Array.isArray(row.images) ? row.images : [],
    features: Array.isArray(row.features) ? row.features : [],
    badge: row.badge,
    createdAt: row.created_at,
  };
}

export class ProductRepository {
  static async findAll(filters?: { categoryId?: string; search?: string; minPrice?: number; maxPrice?: number; sort?: string }): Promise<Product[]> {
    if (!isConnectedToPostgres) {
      return this.filterInMemory(filters);
    }
    try {
      let query = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE 1=1
      `;
      const values: any[] = [];
      let valIdx = 1;

      if (filters?.categoryId && filters.categoryId !== 'all') {
        query += ` AND p.category_id = $${valIdx++}`;
        values.push(filters.categoryId);
      }

      if (filters?.search && filters.search.trim() !== '') {
        query += ` AND (p.title ILIKE $${valIdx} OR p.description ILIKE $${valIdx} OR p.brand ILIKE $${valIdx})`;
        values.push(`%${filters.search.trim()}%`);
        valIdx++;
      }

      if (filters?.minPrice !== undefined) {
        query += ` AND p.price >= $${valIdx++}`;
        values.push(filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query += ` AND p.price <= $${valIdx++}`;
        values.push(filters.maxPrice);
      }

      if (filters?.sort === 'price_asc') {
        query += ` ORDER BY p.price ASC`;
      } else if (filters?.sort === 'price_desc') {
        query += ` ORDER BY p.price DESC`;
      } else if (filters?.sort === 'rating') {
        query += ` ORDER BY p.rating DESC`;
      } else if (filters?.sort === 'newest') {
        query += ` ORDER BY p.created_at DESC`;
      } else {
        query += ` ORDER BY p.id ASC`;
      }

      const res = await pool.query(query, values);
      return res.rows.map(mapRowToProduct);
    } catch {
      return this.filterInMemory(filters);
    }
  }

  private static filterInMemory(filters?: { categoryId?: string; search?: string; minPrice?: number; maxPrice?: number; sort?: string }): Product[] {
    let list = [...inMemoryProducts];
    if (filters?.categoryId && filters.categoryId !== 'all') {
      list = list.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s));
    }
    if (filters?.minPrice !== undefined) {
      list = list.filter((p) => p.price >= (filters.minPrice ?? 0));
    }
    if (filters?.maxPrice !== undefined) {
      list = list.filter((p) => p.price <= (filters.maxPrice ?? 999999));
    }
    if (filters?.sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (filters?.sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (filters?.sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }

  static async findById(id: string): Promise<Product | null> {
    if (!isConnectedToPostgres) {
      return inMemoryProducts.find((p) => p.id === id) || null;
    }
    try {
      const res = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      return mapRowToProduct(res.rows[0]);
    } catch {
      return inMemoryProducts.find((p) => p.id === id) || null;
    }
  }

  static async save(product: Partial<Product>): Promise<Product> {
    const id = product.id || `prod-${Date.now()}`;
    const slug = product.slug || product.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `prod-${Date.now()}`;

    if (!isConnectedToPostgres) {
      return this.saveToMemory(id, slug, product);
    }

    try {
      const res = await pool.query(
        `
        INSERT INTO products (id, title, slug, description, price, original_price, rating, reviews_count, stock, category_id, brand, images, features, badge)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          original_price = EXCLUDED.original_price,
          stock = EXCLUDED.stock,
          category_id = EXCLUDED.category_id,
          brand = EXCLUDED.brand,
          images = EXCLUDED.images,
          features = EXCLUDED.features,
          badge = EXCLUDED.badge
        RETURNING *;
      `,
        [
          id,
          product.title,
          slug,
          product.description || '',
          product.price || 0,
          product.originalPrice || null,
          product.rating || 5.0,
          product.reviewsCount || 0,
          product.stock || 10,
          product.categoryId || 'electronics',
          product.brand || 'Generic',
          product.images || ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
          product.features || [],
          product.badge || null,
        ]
      );
      return mapRowToProduct(res.rows[0]);
    } catch {
      return this.saveToMemory(id, slug, product);
    }
  }

  private static saveToMemory(id: string, slug: string, product: Partial<Product>): Product {
    const newProd: Product = {
      id,
      title: product.title || 'Untitled Product',
      slug,
      description: product.description || '',
      price: product.price || 0,
      originalPrice: product.originalPrice,
      rating: product.rating || 5.0,
      reviewsCount: product.reviewsCount || 0,
      stock: product.stock ?? 10,
      categoryId: product.categoryId || 'electronics',
      brand: product.brand || 'Generic',
      images: product.images || ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
      features: product.features || [],
      badge: product.badge,
    };
    const existingIdx = inMemoryProducts.findIndex((p) => p.id === id);
    if (existingIdx >= 0) {
      inMemoryProducts[existingIdx] = newProd;
    } else {
      inMemoryProducts.unshift(newProd);
    }
    return newProd;
  }

  static async deleteById(id: string): Promise<boolean> {
    if (!isConnectedToPostgres) {
      inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id);
      return true;
    }
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return true;
    } catch {
      inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id);
      return true;
    }
  }

  static async updateStock(id: string, delta: number): Promise<void> {
    if (!isConnectedToPostgres) {
      const p = inMemoryProducts.find((item) => item.id === id);
      if (p) p.stock = Math.max(0, p.stock + delta);
      return;
    }
    try {
      await pool.query('UPDATE products SET stock = GREATEST(0, stock + $1) WHERE id = $2', [delta, id]);
    } catch {
      const p = inMemoryProducts.find((item) => item.id === id);
      if (p) p.stock = Math.max(0, p.stock + delta);
    }
  }

  static async count(): Promise<number> {
    if (!isConnectedToPostgres) {
      return inMemoryProducts.length;
    }
    try {
      const res = await pool.query('SELECT COUNT(*) FROM products');
      return parseInt(res.rows[0].count, 10);
    } catch {
      return inMemoryProducts.length;
    }
  }
}
