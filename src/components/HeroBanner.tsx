import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Sparkles, ArrowRight, Zap } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onCodeClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick, onCodeClick }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-zinc-800 to-indigo-950 text-white p-6 sm:p-10 mb-8 border border-zinc-800 shadow-xl">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-300 border border-white/10 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PostgreSQL & Spring Boot Architecture Demo</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Curated High-Performance <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-sky-300 to-teal-300">
              Hardware & Tech Essentials
            </span>
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Experience an enterprise-grade e-commerce application powered by React on the client,
            Spring Boot REST architecture patterns, and live persistent data synced to Supabase PostgreSQL.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-md hover:shadow-indigo-500/25"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-spring-btn"
              onClick={onCodeClick}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl border border-white/15 transition backdrop-blur-xs"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Spring Boot REST Code</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <Truck className="w-5 h-5 text-indigo-400 mb-2" />
            <div className="text-xs font-semibold text-white">Express Delivery</div>
            <div className="text-[11px] text-zinc-400">Free global dispatch on orders over $150</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-xs font-semibold text-white">2-Year Warranty</div>
            <div className="text-[11px] text-zinc-400">Official manufacturer backed guarantee</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <RotateCcw className="w-5 h-5 text-sky-400 mb-2" />
            <div className="text-xs font-semibold text-white">30-Day Returns</div>
            <div className="text-[11px] text-zinc-400">Hassle-free instant refund policy</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs font-bold mb-2">
              %
            </div>
            <div className="text-xs font-semibold text-white">Coupon Codes</div>
            <div className="text-[11px] text-zinc-400">Apply <span className="font-mono text-amber-300">SAVE20</span> at checkout</div>
          </div>
        </div>
      </div>
    </div>
  );
};
