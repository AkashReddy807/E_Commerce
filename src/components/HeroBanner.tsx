import React from 'react';
import { ArrowRight, Terminal } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onCodeClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick, onCodeClick }) => {
  return (
    <div className="mb-12 border border-[#f0f0f0] bg-[#ffffff] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Editorial Text Column */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#f0f0f0]">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#999999] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
              <span>COLLECTION 2026 // POSTGRESQL & SPRING BOOT</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#111111] leading-[1.1] mb-6">
              Precision Crafted <br />
              <span className="font-normal text-[#111111]">Audio & Hardware.</span>
            </h1>

            <p className="text-[#666666] text-xs sm:text-sm leading-relaxed max-w-md mb-8">
              A minimalist high-performance hardware catalog connected directly to a live Supabase PostgreSQL database with transactional Spring Boot architecture.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 bg-[#111111] hover:bg-[#333333] text-white text-xs uppercase tracking-widest px-7 py-3.5 transition rounded-none font-medium"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
            <button
              id="hero-spring-btn"
              onClick={onCodeClick}
              className="inline-flex items-center gap-2 bg-transparent hover:bg-[#fafafa] text-[#111111] text-xs uppercase tracking-widest px-6 py-3.5 border border-[#111111] transition rounded-none font-medium"
            >
              <Terminal className="w-3.5 h-3.5 text-[#111111]" />
              <span>Spring Boot REST</span>
            </button>
          </div>
        </div>

        {/* Right Showcase Column - Minimalist Geometric Product Presentation */}
        <div className="lg:col-span-5 bg-[#fafafa] p-8 sm:p-12 flex flex-col items-center justify-center relative min-h-[320px] lg:min-h-[420px]">
          {/* Subtle architectural line accents */}
          <div className="absolute inset-0 border-[16px] border-[#ffffff] pointer-events-none" />

          <div className="relative z-10 text-center space-y-4 max-w-xs">
            <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#e5e5e5]" />
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                alt="Studio ANC Reference Headphones"
                referrerPolicy="no-referrer"
                className="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-sm mix-blend-multiply"
              />
            </div>

            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-[#999999]">Featured Object</div>
              <div className="text-sm font-medium text-[#111111]">LUMEN Reference 01 — ANC</div>
              <div className="text-xs font-mono text-[#666666]">$349.00 USD</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Strip - Clean Minimalist 4-Column Grid with Razor Dividers */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[#f0f0f0] bg-[#ffffff] divide-y md:divide-y-0 md:divide-x divide-[#f0f0f0]">
        <div className="p-4 sm:p-5 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#111111] font-semibold mb-0.5">Complimentary Shipping</div>
          <div className="text-[11px] text-[#999999]">On all orders above $150</div>
        </div>
        <div className="p-4 sm:p-5 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#111111] font-semibold mb-0.5">2-Year Guarantee</div>
          <div className="text-[11px] text-[#999999]">Direct manufacturer warranty</div>
        </div>
        <div className="p-4 sm:p-5 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#111111] font-semibold mb-0.5">30-Day Evaluation</div>
          <div className="text-[11px] text-[#999999]">Effortless doorstep returns</div>
        </div>
        <div className="p-4 sm:p-5 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#111111] font-semibold mb-0.5">Instant Checkout</div>
          <div className="text-[11px] text-[#999999]">Card, UPI & Cash on Delivery</div>
        </div>
      </div>
    </div>
  );
};

