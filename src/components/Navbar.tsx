import React from 'react';
import { ShoppingBag, Heart, Search, PackageCheck, Database, SlidersHorizontal, Terminal, ShieldCheck } from 'lucide-react';
import { DatabaseStatus } from '../types';

interface NavbarProps {
  activeTab: 'shop' | 'tracker' | 'admin' | 'springboot';
  setActiveTab: (tab: 'shop' | 'tracker' | 'admin' | 'springboot') => void;
  cartCount: number;
  wishlistCount: number;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dbStatus: DatabaseStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  setIsCartOpen,
  setIsWishlistOpen,
  searchQuery,
  setSearchQuery,
  dbStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      {/* Top Banner Notice */}
      <div className="bg-zinc-900 text-zinc-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Supabase PostgreSQL
            </span>
            <span className="hidden sm:inline text-zinc-500">|</span>
            <span className="hidden sm:inline">Use code <span className="text-amber-300 font-mono font-semibold">SUPABASE50</span> for 50% off</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setActiveTab('springboot')}
              className="hover:text-white transition flex items-center gap-1 text-zinc-400"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Spring Boot Architecture
            </button>
            <span className="text-zinc-600">|</span>
            <button
              onClick={() => setActiveTab('tracker')}
              className="hover:text-white transition flex items-center gap-1 text-zinc-400"
            >
              <PackageCheck className="w-3.5 h-3.5 text-sky-400" />
              Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab('shop')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xl shadow-sm group-hover:bg-indigo-600 transition-colors">
                <span className="font-mono">⚡</span>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-zinc-900 block leading-none">
                  LUMEN<span className="text-indigo-600">STORE</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block mt-0.5">
                  Spring Boot & Postgres
                </span>
              </div>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
              <button
                id="nav-tab-shop"
                onClick={() => setActiveTab('shop')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'shop'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Store Catalog
              </button>
              <button
                id="nav-tab-tracker"
                onClick={() => setActiveTab('tracker')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'tracker'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Order Tracker
              </button>
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'admin'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Admin & DB
              </button>
              <button
                id="nav-tab-springboot"
                onClick={() => setActiveTab('springboot')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'springboot'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Terminal className="w-3 h-3" />
                Spring Boot Code
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, tech gear..."
                className="w-full bg-zinc-100/80 border border-zinc-200 focus:border-indigo-500 focus:bg-white text-sm rounded-xl pl-9.5 pr-4 py-2 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Database indicator pill */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                dbStatus?.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={dbStatus?.host || 'Supabase PostgreSQL'}
            >
              <Database className="w-3 h-3" />
              <span className="hidden xl:inline">{dbStatus?.connected ? 'Supabase Connected' : 'DB Ready'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>

            {/* Wishlist Button */}
            <button
              id="navbar-wishlist-btn"
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 rounded-xl text-zinc-700 hover:text-rose-600 hover:bg-zinc-100 transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition shadow-xs"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-md font-mono">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear, headphones, laptops..."
              className="w-full bg-zinc-100 border border-zinc-200 text-sm rounded-xl pl-9.5 pr-4 py-2 outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
