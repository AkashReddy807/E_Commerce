import React from 'react';
import { Star, ShoppingBag, Eye, Heart, Check, Sparkles } from 'lucide-react';
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
      className="group relative bg-white rounded-2xl border border-zinc-200 overflow-hidden flex flex-col hover:border-zinc-300 hover:shadow-lg transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden">
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
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-900/90 text-white backdrop-blur-xs shadow-xs">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500 text-white shadow-xs">
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
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition shadow-xs z-10 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500'
              : 'bg-white/80 text-zinc-700 hover:bg-white hover:text-rose-500'
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 z-10">
          <button
            id={`quickview-btn-${product.id}`}
            onClick={() => onQuickView(product)}
            className="flex-1 bg-white/95 hover:bg-white text-zinc-900 text-xs font-semibold py-2 rounded-xl shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium mb-1">
            <span>{product.brand}</span>
            {product.stock > 0 ? (
              <span className={`text-[10px] font-medium ${product.stock <= 5 ? 'text-amber-600 font-semibold' : 'text-emerald-600'}`}>
                {product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
              </span>
            ) : (
              <span className="text-[10px] text-rose-500 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-semibold text-sm text-zinc-900 hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-zinc-700">{product.rating}</span>
            <span className="text-xs text-zinc-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-zinc-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-zinc-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition shadow-xs ${
              isAddedToCart
                ? 'bg-emerald-600 text-white'
                : product.stock === 0
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-indigo-600'
            }`}
            aria-label="Add to cart"
          >
            {isAddedToCart ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
