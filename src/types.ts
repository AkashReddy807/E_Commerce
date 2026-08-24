export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  imageUrl?: string;
  image_url?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  rating: number;
  reviewsCount: number;
  reviews_count?: number;
  stock: number;
  categoryId: string;
  category_id?: string;
  categoryName?: string;
  brand: string;
  images: string[];
  features: string[];
  badge?: string;
  createdAt?: string;
  created_at?: string;
}

export interface Review {
  id: number;
  productId: string;
  product_id?: string;
  userName: string;
  user_name?: string;
  rating: number;
  comment: string;
  createdAt?: string;
  created_at?: string;
}

export interface OrderItem {
  id?: number;
  orderId?: string;
  productId: string;
  product_id?: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  image_url?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customer_name?: string;
  customerEmail: string;
  customer_email?: string;
  customerPhone?: string;
  customer_phone?: string;
  shippingAddress: string;
  shipping_address?: string;
  city: string;
  postalCode: string;
  postal_code?: string;
  totalAmount: number;
  total_amount?: number;
  discountAmount?: number;
  discount_amount?: number;
  shippingFee?: number;
  shipping_fee?: number;
  paymentMethod: string;
  payment_method?: string;
  paymentStatus: string;
  payment_status?: string;
  orderStatus: 'Processing' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  order_status?: string;
  createdAt?: string;
  created_at?: string;
  items?: OrderItem[];
}

export interface Coupon {
  code: string;
  discountPercent: number;
  discount_percent?: number;
  maxDiscount?: number;
  max_discount?: number;
  minOrder: number;
  min_order?: number;
  isActive: boolean;
  is_active?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface DatabaseStatus {
  connected: boolean;
  database: string;
  host: string;
  pooler: string;
  error?: string | null;
  tableCounts?: {
    products: number;
    categories: number;
    orders: number;
    reviews: number;
    coupons: number;
  };
}
