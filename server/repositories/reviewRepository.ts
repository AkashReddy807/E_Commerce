import { pool, isConnectedToPostgres } from '../db.js';
import { Review } from '../../src/types.js';

let inMemoryReviews: Review[] = [
  {
    id: 1,
    productId: 'prod-1',
    userName: 'Sarah Jenkins',
    rating: 5,
    comment: 'The sound isolation on these Aura Pro headphones is phenomenal. Deep, tight bass without any muddy distortion.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    productId: 'prod-1',
    userName: 'Alex Rivera',
    rating: 5,
    comment: 'Best purchase I have made this year! Battery easily lasts my entire work week without needing a recharge.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 3,
    productId: 'prod-2',
    userName: 'David Kim',
    rating: 5,
    comment: 'Blazingly fast compiling speeds and the OLED display is breathtaking. Handles 4K video rendering effortlessly.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 4,
    productId: 'prod-3',
    userName: 'Marcus Aurel',
    rating: 4,
    comment: 'Great build quality and very accurate heart rate tracker during morning marathons.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export class ReviewRepository {
  static async findByProductId(productId: string): Promise<Review[]> {
    if (!isConnectedToPostgres) {
      return inMemoryReviews.filter((r) => r.productId === productId);
    }
    try {
      const res = await pool.query('SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC', [productId]);
      return res.rows.map((row) => ({
        id: row.id,
        productId: row.product_id,
        userName: row.user_name,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
      }));
    } catch {
      return inMemoryReviews.filter((r) => r.productId === productId);
    }
  }

  static async create(productId: string, userName: string, rating: number, comment: string): Promise<Review> {
    if (!isConnectedToPostgres) {
      const newRev: Review = {
        id: inMemoryReviews.length + 1,
        productId,
        userName,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      inMemoryReviews.unshift(newRev);
      return newRev;
    }
    try {
      const res = await pool.query(
        'INSERT INTO reviews (product_id, user_name, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
        [productId, userName, rating, comment]
      );
      // Update product average rating & review count
      await pool.query(
        `UPDATE products SET 
          reviews_count = reviews_count + 1,
          rating = ROUND((SELECT AVG(rating) FROM reviews WHERE product_id = $1), 1)
         WHERE id = $1`,
        [productId]
      );

      const row = res.rows[0];
      return {
        id: row.id,
        productId: row.product_id,
        userName: row.user_name,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
      };
    } catch {
      const newRev: Review = {
        id: inMemoryReviews.length + 1,
        productId,
        userName,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      inMemoryReviews.unshift(newRev);
      return newRev;
    }
  }

  static async count(): Promise<number> {
    if (!isConnectedToPostgres) {
      return inMemoryReviews.length;
    }
    try {
      const res = await pool.query('SELECT COUNT(*) FROM reviews');
      return parseInt(res.rows[0].count, 10);
    } catch {
      return inMemoryReviews.length;
    }
  }
}

