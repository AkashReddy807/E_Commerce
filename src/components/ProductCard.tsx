import React from 'react';
import { Star, ShoppingBag, Eye, Heart, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  isAddedToCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  isAddedToCart,
}) => {
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-[#ffffff] border border-[#f0f0f0] overflow-hidden flex flex-col hover:border-[#cccccc] transition-all duration-300"
    >
      {/* Image Container - Clean Minimalist Framing */}
      <div className="relative aspect-square w-full bg-[#fafafa] overflow-hidden flex items-center justify-center p-4">
        <img
          src={mainImage}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-medium bg-[#111111] text-white">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-medium bg-[#ffffff] text-[#111111] border border-[#111111]">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-1.5 transition z-10 ${
            isWishlisted
              ? 'text-[#111111]'
              : 'text-[#999999] hover:text-[#111111]'
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 stroke-[1.5] ${isWishlisted ? 'fill-[#111111] text-[#111111]' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 z-10">
          <button
            id={`quickview-btn-${product.id}`}
            onClick={() => onQuickView(product)}
            className="flex-1 bg-[#ffffff] hover:bg-[#111111] hover:text-white text-[#111111] text-[11px] uppercase tracking-widest font-medium py-2 border border-[#111111] flex items-center justify-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 border-t border-[#f0f0f0]">
        <div>
          {/* Brand & Stock metadata */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#999999] mb-1">
            <span>{product.brand}</span>
            {product.stock > 0 ? (
              <span className={product.stock <= 5 ? 'text-[#111111] font-semibold' : 'text-[#666666]'}>
                {product.stock <= 5 ? `Qty: ${product.stock}` : 'In Stock'}
              </span>
            ) : (
              <span className="text-[#999999]">Sold Out</span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-medium text-xs sm:text-sm text-[#111111] hover:text-[#666666] transition-colors line-clamp-2 cursor-pointer leading-snug tracking-tight"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#666666]">
            <Star className="w-3 h-3 fill-[#111111] text-[#111111]" />
            <span className="font-mono font-medium text-[#111111]">{product.rating}</span>
            <span className="text-[#999999]">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-[#111111] font-mono">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#999999] line-through font-mono">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`p-2 text-xs transition border ${
              isAddedToCart
                ? 'bg-[#111111] text-white border-[#111111]'
                : product.stock === 0
                ? 'bg-[#fafafa] text-[#cccccc] border-[#f0f0f0] cursor-not-allowed'
                : 'bg-[#ffffff] text-[#111111] border-[#111111] hover:bg-[#111111] hover:text-white'
            }`}
            aria-label="Add to cart"
          >
            {isAddedToCart ? (
              <Check className="w-3.5 h-3.5 stroke-[2]" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

