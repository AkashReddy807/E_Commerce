import { pool, isConnectedToPostgres } from '../db.js';
import { Order, OrderItem } from '../../src/types.js';

let inMemoryOrders: Order[] = [];

function mapRowToOrder(row: any, items: OrderItem[] = []): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    city: row.city,
    postalCode: row.postal_code,
    totalAmount: parseFloat(row.total_amount),
    discountAmount: row.discount_amount ? parseFloat(row.discount_amount) : 0,
    shippingFee: row.shipping_fee ? parseFloat(row.shipping_fee) : 0,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    createdAt: row.created_at,
    items,
  };
}

export class OrderRepository {
  static async create(order: Partial<Order>): Promise<Order> {
    const id = order.id || `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!isConnectedToPostgres) {
      return this.createInMemory(id, order);
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const orderRes = await client.query(
          `
          INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_address, city, postal_code, total_amount, discount_amount, shipping_fee, payment_method, payment_status, order_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *;
        `,
          [
            id,
            order.customerName,
            order.customerEmail,
            order.customerPhone || '',
            order.shippingAddress,
            order.city,
            order.postalCode,
            order.totalAmount,
            order.discountAmount || 0,
            order.shippingFee || 0,
            order.paymentMethod || 'Credit Card',
            order.paymentStatus || 'Paid',
            order.orderStatus || 'Processing',
          ]
        );

        const items: OrderItem[] = [];
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            const itemRes = await client.query(
              `
              INSERT INTO order_items (order_id, product_id, title, price, quantity, image_url)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING *;
            `,
              [id, item.productId, item.title, item.price, item.quantity, item.imageUrl || '']
            );
            items.push({
              id: itemRes.rows[0].id,
              orderId: id,
              productId: item.productId,
              title: item.title,
              price: parseFloat(item.price as any),
              quantity: item.quantity,
              imageUrl: item.imageUrl,
            });

            // Decrease stock
            await client.query('UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2', [item.quantity, item.productId]);
          }
        }

        await client.query('COMMIT');
        return mapRowToOrder(orderRes.rows[0], items);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } catch {
      return this.createInMemory(id, order);
    }
  }

  private static createInMemory(id: string, order: Partial<Order>): Order {
    const newOrder: Order = {
      id,
      customerName: order.customerName || 'Customer',
      customerEmail: order.customerEmail || 'user@example.com',
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress || '123 Main St',
      city: order.city || 'Tech City',
      postalCode: order.postalCode || '10001',
      totalAmount: order.totalAmount || 0,
      discountAmount: order.discountAmount || 0,
      shippingFee: order.shippingFee || 0,
      paymentMethod: order.paymentMethod || 'Credit Card',
      paymentStatus: order.paymentStatus || 'Paid',
      orderStatus: (order.orderStatus as any) || 'Processing',
      createdAt: new Date().toISOString(),
      items: order.items || [],
    };
    inMemoryOrders.unshift(newOrder);
    return newOrder;
  }

  static async findById(id: string): Promise<Order | null> {
    if (!isConnectedToPostgres) {
      return inMemoryOrders.find((o) => o.id === id) || null;
    }
    try {
      const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
      if (orderRes.rows.length === 0) return null;

      const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [id]);
      const items: OrderItem[] = itemsRes.rows.map((row) => ({
        id: row.id,
        orderId: row.order_id,
        productId: row.product_id,
        title: row.title,
        price: parseFloat(row.price),
        quantity: row.quantity,
        imageUrl: row.image_url,
      }));

      return mapRowToOrder(orderRes.rows[0], items);
    } catch {
      return inMemoryOrders.find((o) => o.id === id) || null;
    }
  }

  static async findAll(): Promise<Order[]> {
    if (!isConnectedToPostgres) {
      return inMemoryOrders;
    }
    try {
      const orderRes = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      const orders: Order[] = [];

      for (const row of orderRes.rows) {
        const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [row.id]);
        const items = itemsRes.rows.map((i) => ({
          id: i.id,
          orderId: i.order_id,
          productId: i.product_id,
          title: i.title,
          price: parseFloat(i.price),
          quantity: i.quantity,
          imageUrl: i.image_url,
        }));
        orders.push(mapRowToOrder(row, items));
      }
      return orders;
    } catch {
      return inMemoryOrders;
    }
  }

  static async updateStatus(id: string, status: string): Promise<Order | null> {
    if (!isConnectedToPostgres) {
      const o = inMemoryOrders.find((x) => x.id === id);
      if (o) {
        o.orderStatus = status as any;
        return o;
      }
      return null;
    }
    try {
      const res = await pool.query('UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *', [status, id]);
      if (res.rows.length === 0) return null;
      return mapRowToOrder(res.rows[0]);
    } catch {
      const o = inMemoryOrders.find((x) => x.id === id);
      if (o) {
        o.orderStatus = status as any;
        return o;
      }
      return null;
    }
  }

  static async count(): Promise<number> {
    if (!isConnectedToPostgres) {
      return inMemoryOrders.length;
    }
    try {
      const res = await pool.query('SELECT COUNT(*) FROM orders');
      return parseInt(res.rows[0].count, 10);
    } catch {
      return inMemoryOrders.length;
    }
  }
}

