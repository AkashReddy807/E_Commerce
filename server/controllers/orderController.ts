import { Router, Request, Response } from 'express';
import { OrderService } from '../services/orderService.js';
import { CouponRepository } from '../repositories/couponRepository.js';

export const orderRouter = Router();

// POST /api/v1/orders - Checkout and place a new order
orderRouter.post('/', async (req: Request, res: Response) => {
  try {
    const order = await OrderService.createOrder(req.body);
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/v1/orders - List all orders (Admin / History)
orderRouter.get('/', async (req: Request, res: Response) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/orders/:id - Look up order by ID
orderRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await OrderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/orders/:id/status - Update order status (Admin)
orderRouter.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const updated = await OrderService.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order status updated', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/orders/validate-coupon - Validate discount code
orderRouter.post('/validate-coupon', async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Promo code is required' });
    }
    const result = await OrderService.validateCoupon(code, Number(subtotal || 0));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ valid: false, discount: 0, message: err.message });
  }
});

// GET /api/v1/orders/coupons/active - List active promo codes
orderRouter.get('/coupons/active', async (req: Request, res: Response) => {
  try {
    const coupons = await CouponRepository.findAll();
    res.json({ success: true, data: coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
