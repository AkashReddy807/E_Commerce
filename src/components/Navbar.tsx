import React from 'react';
import { ShoppingBag, Heart, Search, PackageCheck, Database, Terminal } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-[#ffffff]/95 backdrop-blur-sm border-b border-[#f0f0f0]">
      {/* Top Banner Notice - Clean Minimalism Micro Bar */}
      <div className="bg-[#fafafa] border-b border-[#f0f0f0] text-[#666666] text-[10px] uppercase tracking-widest py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-[#111111]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ecc71]" />
              Supabase PostgreSQL Live
            </span>
            <span className="text-[#dddddd]">/</span>
            <span className="hidden sm:inline text-[#999999]">
              Special Offer: Code <span className="font-mono text-[#111111] font-semibold">SAVE20</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] tracking-widest">
            <button
              onClick={() => setActiveTab('springboot')}
              className="hover:text-[#111111] transition flex items-center gap-1.5 text-[#666666]"
            >
              <Terminal className="w-3 h-3 text-[#111111]" />
              <span>Spring Boot REST</span>
            </button>
            <span className="text-[#dddddd]">/</span>
            <button
              onClick={() => setActiveTab('tracker')}
              className="hover:text-[#111111] transition flex items-center gap-1.5 text-[#666666]"
            >
              <PackageCheck className="w-3 h-3 text-[#111111]" />
              <span>Track Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-8 lg:gap-12">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab('shop')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="text-2xl font-bold tracking-tighter text-[#111111]">
                LUMEN<span className="font-light text-[#999999]">.</span>
              </div>
            </button>

            {/* Navigation Tabs - Clean Minimalist Uppercase Links */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest">
              <button
                id="nav-tab-shop"
                onClick={() => setActiveTab('shop')}
                className={`py-2 transition relative ${
                  activeTab === 'shop'
                    ? 'text-[#111111] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                Collection
              </button>
              <button
                id="nav-tab-tracker"
                onClick={() => setActiveTab('tracker')}
                className={`py-2 transition relative ${
                  activeTab === 'tracker'
                    ? 'text-[#111111] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                Logistics
              </button>
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`py-2 transition relative ${
                  activeTab === 'admin'
                    ? 'text-[#111111] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                Inventory
              </button>
              <button
                id="nav-tab-springboot"
                onClick={() => setActiveTab('springboot')}
                className={`py-2 transition relative flex items-center gap-1.5 ${
                  activeTab === 'springboot'
                    ? 'text-[#111111] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#111111]'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <span>Architecture</span>
              </button>
            </nav>
          </div>

          {/* Search Bar - Clean Minimalist Input */}
          <div className="flex-1 max-w-xs xl:max-w-sm hidden lg:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#999999] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search objects & gear..."
                className="w-full bg-[#fafafa] border border-[#f0f0f0] focus:border-[#111111] focus:bg-[#ffffff] text-xs rounded-none pl-9 pr-8 py-2 text-[#111111] placeholder:text-[#999999] outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#999999] hover:text-[#111111]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            {/* Database indicator pill */}
            <div
              className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#999999]"
              title={dbStatus?.host || 'Supabase PostgreSQL'}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#2ecc71]" />
              <span className="hidden xl:inline">DB Online</span>
            </div>

            {/* Wishlist Button */}
            <button
              id="navbar-wishlist-btn"
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-[#111111] hover:text-[#666666] transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#111111] text-white text-[9px] font-medium w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-[#111111] hover:bg-[#333333] text-white px-4 py-2 text-xs uppercase tracking-widest font-medium transition rounded-none"
              aria-label="Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
              <span className="hidden sm:inline">Bag</span>
              <span className="text-[11px] font-mono ml-0.5">
                ({cartCount})
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full bg-[#fafafa] border border-[#f0f0f0] text-xs pl-8 pr-4 py-2 outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
