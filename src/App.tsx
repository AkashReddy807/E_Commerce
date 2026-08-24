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
    <div className="min-h-screen flex flex-col bg-[#ffffff] font-sans text-[#111111] antialiased selection:bg-[#111111] selection:text-white">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-[#ffffff] p-4 border border-[#f0f0f0]">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#666666] font-medium">
                  {loadingProducts ? 'Refreshing...' : `Showing ${products.length} Products`}
                </span>
                {selectedCategory !== 'all' && (
                  <span className="text-[10px] uppercase tracking-widest bg-[#fafafa] text-[#111111] px-2 py-0.5 border border-[#e5e5e5] font-medium">
                    {selectedCategory}
                  </span>
                )}
                {searchQuery && (
                  <span className="text-[10px] uppercase tracking-widest bg-[#fafafa] text-[#111111] px-2 py-0.5 border border-[#e5e5e5] font-medium">
                    "{searchQuery}"
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#999999]">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sort</span>
                </div>
                <select
                  id="sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="text-xs uppercase tracking-widest font-medium bg-[#fafafa] border border-[#e5e5e5] px-3 py-1.5 outline-none cursor-pointer focus:border-[#111111] transition rounded-none"
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
                  <div key={i} className="bg-[#ffffff] border border-[#f0f0f0] p-4 space-y-4 animate-pulse">
                    <div className="aspect-square bg-[#fafafa]" />
                    <div className="h-3 bg-[#fafafa] w-3/4" />
                    <div className="h-2 bg-[#fafafa] w-1/2" />
                    <div className="h-4 bg-[#fafafa] w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-[#ffffff] border border-[#f0f0f0] p-8 space-y-4">
                <div className="w-12 h-12 border border-[#111111] text-[#111111] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="font-light text-base uppercase tracking-widest text-[#111111]">No products found</h3>
                <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
                  Refine your keyword search or select all categories to browse the complete catalog.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center text-xs uppercase tracking-widest font-medium text-[#111111] border-b border-[#111111] pb-0.5 hover:text-[#666666] hover:border-[#666666] transition"
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

      {/* Editorial Minimalist Footer */}
      <footer className="mt-20 border-t border-[#f0f0f0] bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="font-light text-base tracking-[0.25em] uppercase text-[#111111]">
                  LUMEN STORE
                </span>
              </div>
              <p className="text-xs text-[#666666] max-w-sm leading-relaxed">
                Full-stack e-commerce engine with Spring Boot REST architecture, React TypeScript client, and real-time persistence with Supabase PostgreSQL.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#999999] mb-4">
                Architecture
              </h4>
              <ul className="space-y-2.5 text-xs text-[#666666]">
                <li className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-[#111111] stroke-[1.5]" />
                  <span>PostgreSQL (Supabase)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#111111] stroke-[1.5]" />
                  <span>Spring Boot 3.3.x API</span>
                </li>
                <li className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#111111] stroke-[1.5]" />
                  <span>React 19 + TypeScript</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#999999] mb-4">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs text-[#666666]">
                <li>
                  <button onClick={() => setActiveTab('shop')} className="hover:text-[#111111] transition">
                    Shop Collection
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('tracker')} className="hover:text-[#111111] transition">
                    Order Tracker
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('admin')} className="hover:text-[#111111] transition">
                    Database & Inventory
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('springboot')} className="hover:text-[#111111] transition">
                    Spring Boot Explorer
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#f0f0f0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#999999]">
            <div>© {new Date().getFullYear()} LUMEN STORE • Clean Minimalist E-Commerce Design</div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[#111111]">
                <span className="w-1.5 h-1.5 bg-[#111111]"></span>
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
