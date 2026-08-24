import { Product, Category, Order, Review, Coupon, DatabaseStatus } from '../types';

export const api = {
  // Products
  async getProducts(params?: { category?: string; search?: string; minPrice?: number; maxPrice?: number; sort?: string }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.minPrice !== undefined) searchParams.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) searchParams.set('maxPrice', params.maxPrice.toString());
    if (params?.sort) searchParams.set('sort', params.sort);

    const res = await fetch(`/api/v1/products?${searchParams.toString()}`);
    const data = await res.json();
    return data.data || [];
  },

  async getProductById(id: string): Promise<{ product: Product; reviews: Review[] }> {
    const res = await fetch(`/api/v1/products/${id}`);
    const data = await res.json();
    return { product: data.data, reviews: data.reviews || [] };
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/v1/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    return data.data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/v1/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    return data.data;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    return data.success;
  },

  async addReview(productId: string, userName: string, rating: number, comment: string): Promise<Review> {
    const res = await fetch(`/api/v1/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, rating, comment }),
    });
    const data = await res.json();
    return data.data;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/v1/categories');
    const data = await res.json();
    return data.data || [];
  },

  // Orders
  async createOrder(order: Partial<Order>): Promise<Order> {
    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to place order');
    }
    return data.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await fetch(`/api/v1/orders/${id}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Order not found');
    }
    return data.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const res = await fetch('/api/v1/orders');
    const data = await res.json();
    return data.data || [];
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const res = await fetch(`/api/v1/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    return data.data;
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount: number; message?: string }> {
    const res = await fetch('/api/v1/orders/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return await res.json();
  },

  async getActiveCoupons(): Promise<Coupon[]> {
    const res = await fetch('/api/v1/orders/coupons/active');
    const data = await res.json();
    return data.data || [];
  },

  // System & Database status
  async getSystemStatus(): Promise<DatabaseStatus & { latencyMs?: number; serverTime?: string; dbVersion?: string; fallbackMode?: boolean }> {
    const res = await fetch('/api/v1/system/status');
    return await res.json();
  },

  async getSpringBootDocs(): Promise<{ framework: string; database: string; description: string; files: Array<{ fileName: string; language: string; description: string; code: string }> }> {
    const res = await fetch('/api/v1/system/springboot-docs');
    return await res.json();
  },
};
