import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, QrCode, Banknote, CheckCircle, PackageCheck, Copy, Loader2, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-[#ffffff] max-w-2xl w-full border border-[#f0f0f0] shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#999999] hover:text-[#111111] transition z-20"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {completedOrder ? (
          /* Order Confirmation View */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-14 h-14 border border-[#111111] text-[#111111] flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#999999]">
                POSTGRES TRANSACTION SUCCESSFUL
              </div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
                Order Confirmed.
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
                Thank you, <span className="font-medium text-[#111111]">{completedOrder.customerName}</span>. Your record is committed to PostgreSQL and inventory deducted.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="p-6 bg-[#fafafa] border border-[#f0f0f0] text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#999999]">Order Reference</span>
                  <div className="font-mono text-xs font-semibold text-[#111111]">{completedOrder.id}</div>
                </div>
                <button
                  onClick={copyOrderId}
                  className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-medium text-[#111111] bg-[#ffffff] px-3 py-1.5 border border-[#e5e5e5] hover:border-[#111111] transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#999999] block text-[10px] uppercase tracking-widest">Shipping To</span>
                  <span className="font-medium text-[#111111]">{completedOrder.shippingAddress}, {completedOrder.city}</span>
                </div>
                <div>
                  <span className="text-[#999999] block text-[10px] uppercase tracking-widest">Payment</span>
                  <span className="font-medium text-[#111111]">{completedOrder.paymentMethod} ({completedOrder.paymentStatus})</span>
                </div>
                <div>
                  <span className="text-[#999999] block text-[10px] uppercase tracking-widest">Objects</span>
                  <span className="font-medium text-[#111111]">{completedOrder.items?.length || 1} Items</span>
                </div>
                <div>
                  <span className="text-[#999999] block text-[10px] uppercase tracking-widest">Total Settled</span>
                  <span className="font-mono font-semibold text-[#111111]">${completedOrder.totalAmount?.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="bg-[#111111] hover:bg-[#333333] text-white text-xs uppercase tracking-widest px-8 py-3.5 font-medium transition rounded-none"
              >
                Return to Collection
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-10 space-y-6">
            <div className="border-b border-[#f0f0f0] pb-4">
              <h2 className="text-xl font-light tracking-tight text-[#111111]">Checkout Verification</h2>
              <p className="text-xs text-[#999999] mt-0.5 uppercase tracking-wider">
                Direct write to Supabase PostgreSQL schema
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-[#fafafa] text-[#111111] text-xs border border-[#111111]">
                {errorMessage}
              </div>
            )}

            {/* Step 1: Customer & Shipping Information */}
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#999999] flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-[#111111]" />
                Shipping Destination & Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#666666] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#fafafa] border border-[#e5e5e5] focus:border-[#111111] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#666666] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#fafafa] border border-[#e5e5e5] focus:border-[#111111] outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-[#666666] mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#fafafa] border border-[#e5e5e5] focus:border-[#111111] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#666666] mb-1">City, State / Region</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#fafafa] border border-[#e5e5e5] focus:border-[#111111] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#666666] mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#fafafa] border border-[#e5e5e5] focus:border-[#111111] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-3 pt-4 border-t border-[#f0f0f0]">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#999999] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#111111]" />
                Payment Instrument
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit Card')}
                  className={`p-3 border text-xs uppercase tracking-widest font-medium flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'Credit Card'
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#e5e5e5] bg-[#ffffff] text-[#666666] hover:border-[#111111]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 stroke-[1.5]" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI / QR')}
                  className={`p-3 border text-xs uppercase tracking-widest font-medium flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'UPI / QR'
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#e5e5e5] bg-[#ffffff] text-[#666666] hover:border-[#111111]'
                  }`}
                >
                  <QrCode className="w-4 h-4 stroke-[1.5]" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-3 border text-xs uppercase tracking-widest font-medium flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#e5e5e5] bg-[#ffffff] text-[#666666] hover:border-[#111111]'
                  }`}
                >
                  <Banknote className="w-4 h-4 stroke-[1.5]" />
                  <span>COD</span>
                </button>
              </div>

              {paymentMethod === 'Credit Card' && (
                <div className="p-4 bg-[#fafafa] border border-[#f0f0f0] grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <label className="block text-[10px] uppercase tracking-widest text-[#999999] mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs p-2 bg-[#ffffff] border border-[#e5e5e5] font-mono outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-[#999999] mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs p-2 bg-[#ffffff] border border-[#e5e5e5] font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#999999] mb-1">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full text-xs p-2 bg-[#ffffff] border border-[#e5e5e5] font-mono outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order Total & Submit */}
            <div className="pt-4 border-t border-[#f0f0f0] space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#999999]">
                  {cartItems.length} objects • 2-year warranty included
                </span>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-[#999999] mr-2">Total Amount:</span>
                  <span className="text-xl font-light font-mono text-[#111111]">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="checkout-confirm-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#111111] hover:bg-[#333333] text-white py-3.5 px-4 text-xs uppercase tracking-widest font-medium transition flex items-center justify-center gap-2 rounded-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing to Postgres...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order (${totalAmount.toFixed(2)} USD)</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.75]" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-[#999999]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
                <span>Spring Boot JPA executes commit to Supabase</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

