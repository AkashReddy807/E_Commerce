import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Edit3, CheckCircle, RefreshCw, Layers, DollarSign, ShoppingCart, AlertTriangle, ArrowUpRight, X, Sparkles } from 'lucide-react';
import { Product, Order, Category, DatabaseStatus } from '../types';
import { api } from '../services/api';

interface AdminInventoryViewProps {
  products: Product[];
  categories: Category[];
  onRefreshData: () => void;
}

export const AdminInventoryView: React.FC<AdminInventoryViewProps> = ({
  products,
  categories,
  onRefreshData,
}) => {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'database'>('inventory');

  // Add/Edit Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formPrice, setFormPrice] = useState('299.00');
  const [formOriginalPrice, setFormOriginalPrice] = useState('349.00');
  const [formStock, setFormStock] = useState('20');
  const [formCategory, setFormCategory] = useState('electronics');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80');
  const [formBadge, setFormBadge] = useState('Featured');
  const [savingProduct, setSavingProduct] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [status, fetchedOrders] = await Promise.all([
        api.getSystemStatus(),
        api.getAllOrders(),
      ]);
      setDbStatus(status);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setFormTitle(prod.title);
      setFormBrand(prod.brand);
      setFormPrice(prod.price.toString());
      setFormOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
      setFormStock(prod.stock.toString());
      setFormCategory(prod.categoryId);
      setFormDescription(prod.description);
      setFormImageUrl(prod.images?.[0] || '');
      setFormBadge(prod.badge || '');
    } else {
      setEditingProduct(null);
      setFormTitle('');
      setFormBrand('Apex Acoustics');
      setFormPrice('199.00');
      setFormOriginalPrice('249.00');
      setFormStock('25');
      setFormCategory('electronics');
      setFormDescription('Engineered with high-fidelity acoustic sound drivers and premium aluminum chassis.');
      setFormImageUrl('https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80');
      setFormBadge('New Arrival');
    }
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProduct(true);
      const payload: Partial<Product> = {
        id: editingProduct?.id,
        title: formTitle,
        brand: formBrand,
        price: parseFloat(formPrice),
        originalPrice: formOriginalPrice ? parseFloat(formOriginalPrice) : undefined,
        stock: parseInt(formStock, 10),
        categoryId: formCategory,
        description: formDescription,
        images: [formImageUrl],
        badge: formBadge || undefined,
        features: ['Precision CNC machined finish', 'Fast USB-C charging protocol', 'PostgreSQL database synced record'],
      };

      if (editingProduct?.id) {
        await api.updateProduct(editingProduct.id, payload);
        setStatusMessage('Product updated successfully in PostgreSQL!');
      } else {
        await api.createProduct(payload);
        setStatusMessage('New product created and saved to PostgreSQL!');
      }

      setIsAddModalOpen(false);
      onRefreshData();
      loadAdminData();
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from the PostgreSQL database?')) return;
    try {
      await api.deleteProduct(id);
      onRefreshData();
      loadAdminData();
      setStatusMessage('Product removed from database.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      alert('Failed to delete product: ' + err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadAdminData();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header & DB Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
              Admin & Database Management
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Connected to Supabase PostgreSQL at <span className="font-mono text-zinc-700">aws-0-ap-northeast-1.pooler.supabase.com:5432</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadAdminData();
              onRefreshData();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>

          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-indigo-600 text-white transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Total Products</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-900">{products.length}</div>
          <div className="text-[11px] text-zinc-500 font-medium">PostgreSQL Catalog rows</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-900">{orders.length}</div>
          <div className="text-[11px] text-zinc-500 font-medium">Placed customer orders</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-zinc-900">${totalRevenue.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Across all orders</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{lowStockCount}</div>
          <div className="text-[11px] text-zinc-500 font-medium">Items with ≤10 inventory</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'inventory'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          Product Inventory ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'orders'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'database'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          Supabase PostgreSQL Diagnostics
        </button>
      </div>

      {/* Tab 1: Product Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover bg-zinc-100 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-zinc-900 line-clamp-1">{prod.title}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">ID: {prod.id} • {prod.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-600 capitalize">{prod.categoryId}</td>
                    <td className="p-4 font-bold text-zinc-900">${prod.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold ${
                        prod.stock <= 5
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : prod.stock <= 15
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {prod.stock} in stock
                      </span>
                    </td>
                    <td className="p-4 text-zinc-700">★ {prod.rating} ({prod.reviewsCount})</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenAddModal(prod)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete from PostgreSQL"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Customer Orders Table */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                      No customer orders yet. Place an order from the cart to see it listed here!
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-50/80 transition">
                      <td className="p-4 font-mono font-bold text-zinc-900">{ord.id}</td>
                      <td className="p-4">
                        <div className="font-semibold text-zinc-900">{ord.customerName}</div>
                        <div className="text-[11px] text-zinc-400">{ord.customerEmail}</div>
                      </td>
                      <td className="p-4 font-bold text-indigo-600">${ord.totalAmount?.toFixed(2)}</td>
                      <td className="p-4 text-zinc-600">{ord.paymentMethod}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-900 text-white">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="bg-zinc-100 border border-zinc-200 rounded-lg px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Database Diagnostics */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-zinc-900 text-sm">Supabase PostgreSQL Connection</h3>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Host:</span>
                <span className="font-mono text-zinc-800">aws-0-ap-northeast-1.pooler.supabase.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Database:</span>
                <span className="font-mono text-zinc-800">postgres</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Port:</span>
                <span className="font-mono text-zinc-800">5432 (SSL Mode Required)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">User:</span>
                <span className="font-mono text-zinc-800">postgres.cuxhbnvfiuqxmwkgnkyi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Database Engine:</span>
                <span className="font-mono text-zinc-800">PostgreSQL 15+ Enterprise</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-zinc-900 text-sm">Active Table Row Counts</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="text-xs text-zinc-400 uppercase font-mono">products</div>
                <div className="text-xl font-bold text-zinc-900 mt-1">{products.length} rows</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="text-xs text-zinc-400 uppercase font-mono">categories</div>
                <div className="text-xl font-bold text-zinc-900 mt-1">{categories.length} rows</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="text-xs text-zinc-400 uppercase font-mono">orders</div>
                <div className="text-xl font-bold text-zinc-900 mt-1">{orders.length} rows</div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div className="text-xs text-zinc-400 uppercase font-mono">coupons</div>
                <div className="text-xl font-bold text-zinc-900 mt-1">3 active</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-zinc-900 mb-1">
              {editingProduct ? 'Edit Product' : 'Add New Hardware Product'}
            </h2>
            <p className="text-xs text-zinc-500 mb-4">
              Changes will be committed directly to Supabase PostgreSQL
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 bg-white focus:border-indigo-500 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-indigo-600 text-white transition shadow-sm"
                >
                  {savingProduct ? 'Saving to DB...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
