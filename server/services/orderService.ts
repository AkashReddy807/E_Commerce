import { OrderRepository } from '../repositories/orderRepository.js';
import { CouponRepository } from '../repositories/couponRepository.js';
import { Order, Coupon } from '../../src/types.js';

export class OrderService {
  static async createOrder(orderData: Partial<Order>): Promise<Order> {
    // Validate minimal order
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    if (!orderData.shippingAddress || !orderData.customerName || !orderData.customerEmail) {
      throw new Error('Customer information and shipping address are required');
    }

    return await OrderRepository.create(orderData);
  }

  static async getOrderById(id: string): Promise<Order | null> {
    return await OrderRepository.findById(id);
  }

  static async getAllOrders(): Promise<Order[]> {
    return await OrderRepository.findAll();
  }

  static async updateOrderStatus(id: string, status: string): Promise<Order | null> {
    return await OrderRepository.updateStatus(id, status);
  }

  static async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount: number; message?: string }> {
    const coupon = await CouponRepository.findByCode(code);
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or expired promo coupon code' };
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of $${coupon.minOrder.toFixed(2)} required for code ${coupon.code}`,
      };
    }

    let discount = (subtotal * coupon.discountPercent) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount * 100) / 100,
      message: `${coupon.discountPercent}% discount applied! Saved $${discount.toFixed(2)}`,
    };
  }
}
