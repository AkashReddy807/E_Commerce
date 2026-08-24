import React, { useState } from 'react';
import { X, Trash2, ArrowRight, Tag, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { CartItem, Coupon } from '../types';
import { api } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenCheckout: (appliedCoupon?: { coupon: Coupon; discount: number }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ coupon: Coupon; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setValidatingCoupon(true);
      setCouponError('');
      const res = await api.validateCoupon(couponCode.trim(), subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon({ coupon: res.coupon, discount: res.discount });
        setCouponError('');
      } else {
        setCouponError(res.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/60 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-base text-zinc-900">Your Shopping Cart</h2>
              <span className="bg-zinc-100 text-zinc-700 text-xs px-2 py-0.5 rounded-full font-mono font-semibold">
                {cartItems.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              id="cart-drawer-close-btn"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-indigo-50/70 p-3.5 border-b border-indigo-100">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 mb-1.5">
              <span>
                {amountToFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Unlocked FREE Express Shipping!
                  </span>
                ) : (
                  `Add $${amountToFreeShipping.toFixed(2)} more for FREE Shipping`
                )}
              </span>
              <span className="text-[10px] text-indigo-700">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full h-1.5 bg-indigo-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-zinc-800 text-sm">Your cart is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Browse our catalog and discover premium audio gear, laptops, and smart tech essentials.
                </p>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3.5 p-3 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition"
                >
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-18 h-18 rounded-xl object-cover bg-zinc-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          {product.brand}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-900 line-clamp-1">
                          {product.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="text-zinc-400 hover:text-rose-500 transition p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 rounded text-zinc-600 hover:bg-white flex items-center justify-center font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-semibold">{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, Math.min(product.stock || 10, quantity + 1))}
                          className="w-6 h-6 rounded text-zinc-600 hover:bg-white flex items-center justify-center font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-zinc-900">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coupon Code Section */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-zinc-200 bg-zinc-50/50 space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Promo code: SAVE20"
                    className="w-full text-xs bg-white border border-zinc-200 rounded-xl pl-8.5 pr-3 py-2 uppercase font-mono tracking-wider focus:border-indigo-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="bg-zinc-900 hover:bg-indigo-600 disabled:bg-zinc-300 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition"
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span className="font-semibold">
                    ✓ Code {appliedCoupon.coupon.code} ({appliedCoupon.coupon.discountPercent}% OFF)
                  </span>
                  <button onClick={handleRemoveCoupon} className="text-emerald-700 hover:text-emerald-900 font-bold ml-2">
                    ✕
                  </button>
                </div>
              )}
              {couponError && <p className="text-[11px] text-rose-500">{couponError}</p>}
            </div>
          )}

          {/* Order Summary & Checkout Footer */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-zinc-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon.coupon.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-emerald-600 font-semibold">FREE</span> : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-100 text-sm font-bold text-zinc-900">
                  <span>Total</span>
                  <span className="text-indigo-600 text-base">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="cart-proceed-checkout-btn"
                onClick={() => {
                  onOpenCheckout(appliedCoupon || undefined);
                  onClose();
                }}
                className="w-full bg-zinc-900 hover:bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10"
              >
                <span>Proceed to Checkout (${finalTotal.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Encrypted 256-Bit Secure Supabase Transaction</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
