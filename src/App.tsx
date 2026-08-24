import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerView } from './components/OrderTrackerView';
import { AdminInventoryView } from './components/AdminInventoryView';
import { SpringBootArchitectureView } from './components/SpringBootArchitectureView';
import { WishlistModal } from './components/WishlistModal';
import { Product, Category, CartItem, Order, Coupon, DatabaseStatus } from './types';
import { api } from './services/api';
import { SlidersHorizontal, ArrowUpDown, Sparkles, ShoppingBag, ShieldCheck, Database, Terminal, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'shop' | 'tracker' | 'admin' | 'springboot'>('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('featured');
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  // Cart & Wishlist state with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lumen_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('lumen_store_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutCoupon, setCheckoutCoupon] = useState<{ coupon: Coupon; discount: number } | null>(null);
  const [trackedOrderId, setTrackedOrderId] = useState<string | undefined>(undefined);
  const [recentAddedId, setRecentAddedId] = useState<string | null>(null);

  // Save cart & wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('lumen_store_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('lumen_store_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Initial Load
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch products whenever category, search, or sort changes
  useEffect(() => {
    fetchFilteredProducts();
  }, [selectedCategory, searchQuery, sortOption]);

  const fetchInitialData = async () => {
    try {
      const [cats, status] = await Promise.all([
        api.getCategories(),
        api.getSystemStatus(),
      ]);
      setCategories(cats);
      setDbStatus(status);
    } catch (err) {
      console.error('Initial data fetch error:', err);
    }
  };

  const fetchFilteredProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await api.getProducts({
        category: selectedCategory,
        search: searchQuery,
        sort: sortOption,
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    setRecentAddedId(product.id);
    setTimeout(() => setRecentAddedId(null), 1500);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleOrderSuccess = (order: Order) => {
    setTrackedOrderId(order.id);
    // Refresh products list in case stock decreased
    fetchFilteredProducts();
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        setIsCartOpen={setIsCartOpen}
        setIsWishlistOpen={setIsWishlistOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'shop' && (
          <div>
            {/* Hero Banner */}
            <HeroBanner
              onExploreClick={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onCodeClick={() => setActiveTab('springboot')}
            />

            {/* Category Filter Pills */}
            <div id="catalog-section">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                totalProductsCount={products.length}
              />
            </div>

            {/* Toolbar: Sort & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-700">
                  {loadingProducts ? 'Refreshing products...' : `Showing ${products.length} items`}
                </span>
                {selectedCategory !== 'all' && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium capitalize">
                    {selectedCategory}
                  </span>
                )}
                {searchQuery && (
                  <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-medium">
                    "{searchQuery}"
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sort by:</span>
                </div>
                <select
                  id="sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:bg-zinc-100 transition"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-4 animate-pulse">
                    <div className="aspect-square bg-zinc-200 rounded-xl" />
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                    <div className="h-3 bg-zinc-100 rounded w-1/2" />
                    <div className="h-6 bg-zinc-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-zinc-800 text-base">No products match your criteria</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Try clearing your search query or selecting a different category from the filter above.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some((w) => w.id === product.id)}
                    isAddedToCart={recentAddedId === product.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracker' && (
          <OrderTrackerView
            initialOrderId={trackedOrderId}
            onNavigateToShop={() => setActiveTab('shop')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminInventoryView
            products={products}
            categories={categories}
            onRefreshData={fetchFilteredProducts}
          />
        )}

        {activeTab === 'springboot' && <SpringBootArchitectureView />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <span className="font-extrabold text-lg tracking-tight text-zinc-900">
                  LUMEN<span className="text-indigo-600">STORE</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                Full-stack e-commerce engine with modular Spring Boot REST architecture, React TypeScript client, and real-time persistence with Supabase PostgreSQL.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">
                Tech Stack
              </h4>
              <ul className="space-y-2 text-xs text-zinc-600">
                <li className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PostgreSQL (Supabase)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Spring Boot 3.3.x / Express</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-600" />
                  <span>React 19 + TypeScript + Vite</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs text-zinc-600">
                <li>
                  <button onClick={() => setActiveTab('shop')} className="hover:text-indigo-600 transition">
                    Shop All Products
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('tracker')} className="hover:text-indigo-600 transition">
                    Track Customer Package
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('admin')} className="hover:text-indigo-600 transition">
                    Admin Inventory & DB Status
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('springboot')} className="hover:text-indigo-600 transition">
                    Spring Boot Code Explorer
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <div>© {new Date().getFullYear()} Lumen Store • Production Ready E-Commerce Architecture</div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Supabase Connected
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlist.some((w) => w.id === quickViewProduct.id) : false}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenCheckout={(coupon) => {
          setCheckoutCoupon(coupon || null);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        appliedCoupon={checkoutCoupon}
        onOrderSuccess={handleOrderSuccess}
        onClearCart={handleClearCart}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((p) => p.id !== id))}
      />
    </div>
  );
}
