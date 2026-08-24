import React, { useState } from 'react';
import { X, Trash2, ArrowRight, Tag, ShieldCheck, ShoppingBag } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#111111]/70 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#ffffff] border-l border-[#f0f0f0] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#f0f0f0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-[#111111] stroke-[1.75]" />
              <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111]">
                Shopping Bag
              </h2>
              <span className="text-xs font-mono text-[#999999]">
                ({cartItems.reduce((s, i) => s + i.quantity, 0)})
              </span>
            </div>
            <button
              id="cart-drawer-close-btn"
              onClick={onClose}
              className="p-1 text-[#999999] hover:text-[#111111] transition"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-[#fafafa] p-4 border-b border-[#f0f0f0]">
            <div className="flex items-center justify-between text-[11px] text-[#111111] mb-2">
              <span className="uppercase tracking-widest font-medium">
                {amountToFreeShipping === 0
                  ? 'Complimentary Delivery Qualified'
                  : `Add $${amountToFreeShipping.toFixed(2)} for Complimentary Delivery`}
              </span>
              <span className="font-mono text-[#999999]">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full h-1 bg-[#e5e5e5]">
              <div
                className="h-full bg-[#111111] transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <div className="text-xs uppercase tracking-widest text-[#999999]">
                  Bag is currently empty
                </div>
                <p className="text-xs text-[#666666] max-w-xs mx-auto">
                  Explore our curated audio instruments, workstation gear, and developer hardware.
                </p>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-[#fafafa] border border-[#f0f0f0]"
                >
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover bg-[#ffffff] shrink-0 border border-[#f0f0f0]"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-[#999999] block">
                          {product.brand}
                        </span>
                        <h4 className="text-xs font-medium text-[#111111] line-clamp-1">
                          {product.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="text-[#999999] hover:text-[#111111] transition p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#e5e5e5] bg-[#ffffff] p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 text-[#666666] hover:text-[#111111] flex items-center justify-center text-xs font-medium"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-medium">{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, Math.min(product.stock || 10, quantity + 1))}
                          className="w-6 h-6 text-[#666666] hover:text-[#111111] flex items-center justify-center text-xs font-medium"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-mono font-semibold text-[#111111]">
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
            <div className="p-4 border-t border-[#f0f0f0] bg-[#fafafa] space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE (e.g. SAVE20)"
                    className="w-full text-xs bg-[#ffffff] border border-[#e5e5e5] pl-8.5 pr-3 py-2 uppercase font-mono tracking-wider focus:border-[#111111] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="bg-[#111111] hover:bg-[#333333] disabled:bg-[#cccccc] text-white text-xs uppercase tracking-widest px-4 py-2 font-medium transition rounded-none"
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-[#ffffff] text-[#111111] px-3 py-1.5 border border-[#111111]">
                  <span className="font-mono font-semibold">
                    Code {appliedCoupon.coupon.code} (-{appliedCoupon.coupon.discountPercent}%)
                  </span>
                  <button onClick={handleRemoveCoupon} className="text-[#111111] font-bold ml-2">
                    ✕
                  </button>
                </div>
              )}
              {couponError && <p className="text-[11px] text-[#111111]">{couponError}</p>}
            </div>
          )}

          {/* Order Summary & Checkout Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[#f0f0f0] bg-[#ffffff] space-y-4">
              <div className="space-y-2 text-xs text-[#666666]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-[#111111]">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#111111] font-medium">
                    <span>Discount ({appliedCoupon.coupon.code})</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <span className="font-medium text-[#111111]">FREE</span> : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#f0f0f0] text-sm font-semibold text-[#111111]">
                  <span className="uppercase tracking-widest text-xs">Total</span>
                  <span className="font-mono text-base text-[#111111]">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="cart-proceed-checkout-btn"
                onClick={() => {
                  onOpenCheckout(appliedCoupon || undefined);
                  onClose();
                }}
                className="w-full bg-[#111111] hover:bg-[#333333] text-white py-3.5 px-4 text-xs uppercase tracking-widest font-medium transition flex items-center justify-center gap-2 rounded-none"
              >
                <span>Proceed to Checkout — ${finalTotal.toFixed(2)}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-[#999999] text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
                <span>Supabase PostgreSQL Encrypted</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

