import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, QrCode, Banknote, CheckCircle, PackageCheck, Copy, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Coupon, Order } from '../types';
import { api } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  appliedCoupon?: { coupon: Coupon; discount: number } | null;
  onOrderSuccess: (order: Order) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  appliedCoupon,
  onOrderSuccess,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('Alex Morgan');
  const [customerEmail, setCustomerEmail] = useState('alex.morgan@example.com');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 234-5678');
  const [shippingAddress, setShippingAddress] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('San Francisco, CA');
  const [postalCode, setPostalCode] = useState('94107');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'UPI / QR' | 'Cash on Delivery' | 'PayPal'>('Credit Card');

  // Card details mock fields
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('321');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingFee = subtotal >= 150 || subtotal === 0 ? 0 : 15;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const orderPayload: Partial<Order> = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        postalCode,
        totalAmount,
        discountAmount,
        shippingFee,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        orderStatus: 'Processing',
        items: cartItems.map((item) => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.images?.[0],
        })),
      };

      const placedOrder = await api.createOrder(orderPayload);
      setCompletedOrder(placedOrder);
      onOrderSuccess(placedOrder);
      onClearCart();

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderId = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {completedOrder ? (
          /* Order Confirmation View */
          <div className="p-6 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5" />
                Saved to Supabase PostgreSQL
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                Order Confirmed!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
                Thank you, <span className="font-semibold text-zinc-800">{completedOrder.customerName}</span>. Your order has been placed and inventory deducted from the database.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Order ID Reference</span>
                  <div className="font-mono font-bold text-sm text-zinc-900">{completedOrder.id}</div>
                </div>
                <button
                  onClick={copyOrderId}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-400 block text-[11px]">Shipping To</span>
                  <span className="font-medium text-zinc-800">{completedOrder.shippingAddress}, {completedOrder.city}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">Payment</span>
                  <span className="font-medium text-zinc-800">{completedOrder.paymentMethod} ({completedOrder.paymentStatus})</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">Items Ordered</span>
                  <span className="font-medium text-zinc-800">{completedOrder.items?.length || 1} Products</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px]">Total Paid</span>
                  <span className="font-bold text-indigo-600">${completedOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={onClose}
                className="bg-zinc-900 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-xl transition shadow-md"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-zinc-200 pb-4">
              <h2 className="text-xl font-bold text-zinc-900">Secure Checkout</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Complete your details to place the order in Supabase PostgreSQL
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {errorMessage}
              </div>
            )}

            {/* Step 1: Customer & Shipping Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-indigo-600" />
                Shipping & Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">City, State / Region</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-3 pt-2 border-t border-zinc-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Payment Method
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit Card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'Credit Card'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI / QR')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'UPI / QR'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>COD</span>
                </button>
              </div>

              {paymentMethod === 'Credit Card' && (
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <label className="block text-[11px] text-zinc-500 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-zinc-200 font-mono outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] text-zinc-500 mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-zinc-200 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg bg-white border border-zinc-200 font-mono outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order Total & Submit */}
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-zinc-500">
                  {cartItems.length} items • Free warranty included
                </span>
                <div className="text-right">
                  <span className="text-xs text-zinc-400 mr-2">Grand Total:</span>
                  <span className="text-xl font-extrabold text-indigo-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="checkout-confirm-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-zinc-900 hover:bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing in Supabase PostgreSQL...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order (${totalAmount.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Spring Boot REST Controller executes transaction on PostgreSQL database</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
