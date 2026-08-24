import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (productId: string) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistItems,
  onAddToCart,
  onRemoveFromWishlist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-[#ffffff] max-w-lg w-full p-6 sm:p-8 border border-[#f0f0f0] shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#111111] fill-[#111111] stroke-[1.5]" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111]">
              Saved Wishlist
            </h2>
            <span className="text-xs font-mono text-[#999999]">
              ({wishlistItems.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#999999] hover:text-[#111111] transition"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        <div className="py-4 max-h-96 overflow-y-auto space-y-3">
          {wishlistItems.length === 0 ? (
            <div className="py-12 text-center text-[#999999] text-xs uppercase tracking-wider">
              Your wishlist is empty.
            </div>
          ) : (
            wishlistItems.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between gap-3 p-3 bg-[#fafafa] border border-[#f0f0f0]"
              >
                <img
                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                  alt={prod.title}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover bg-[#ffffff] border border-[#f0f0f0] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-[#111111] truncate">{prod.title}</h4>
                  <div className="text-xs font-mono font-semibold text-[#111111] mt-0.5">
                    ${prod.price.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAddToCart(prod);
                      onRemoveFromWishlist(prod.id);
                    }}
                    className="p-2 bg-[#111111] hover:bg-[#333333] text-white text-xs transition"
                    title="Move to Bag"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                  <button
                    onClick={() => onRemoveFromWishlist(prod.id)}
                    className="p-2 text-[#999999] hover:text-[#111111] transition"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

