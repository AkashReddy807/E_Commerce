import { pool, isConnectedToPostgres } from '../db.js';
import { Coupon } from '../../src/types.js';

let inMemoryCoupons: Coupon[] = [
  {
    code: 'WELCOME10',
    discountPercent: 10,
    maxDiscount: 50.0,
    minOrder: 50.0,
    isActive: true,
  },
  {
    code: 'SAVE20',
    discountPercent: 20,
    maxDiscount: 150.0,
    minOrder: 100.0,
    isActive: true,
  },
  {
    code: 'SUPABASE50',
    discountPercent: 50,
    maxDiscount: 300.0,
    minOrder: 200.0,
    isActive: true,
  },
];

export class CouponRepository {
  static async findByCode(code: string): Promise<Coupon | null> {
    if (!isConnectedToPostgres) {
      return inMemoryCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive) || null;
    }
    try {
      const res = await pool.query('SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = TRUE', [code]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        code: row.code,
        discountPercent: row.discount_percent,
        maxDiscount: row.max_discount ? parseFloat(row.max_discount) : undefined,
        minOrder: row.min_order ? parseFloat(row.min_order) : 0,
        isActive: row.is_active,
      };
    } catch {
      return inMemoryCoupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive) || null;
    }
  }

  static async findAll(): Promise<Coupon[]> {
    if (!isConnectedToPostgres) {
      return inMemoryCoupons;
    }
    try {
      const res = await pool.query('SELECT * FROM coupons WHERE is_active = TRUE');
      return res.rows.map((row) => ({
        code: row.code,
        discountPercent: row.discount_percent,
        maxDiscount: row.max_discount ? parseFloat(row.max_discount) : undefined,
        minOrder: row.min_order ? parseFloat(row.min_order) : 0,
        isActive: row.is_active,
      }));
    } catch {
      return inMemoryCoupons;
    }
  }

  static async count(): Promise<number> {
    if (!isConnectedToPostgres) {
      return inMemoryCoupons.length;
    }
    try {
      const res = await pool.query('SELECT COUNT(*) FROM coupons');
      return parseInt(res.rows[0].count, 10);
    } catch {
      return inMemoryCoupons.length;
    }
  }
}

