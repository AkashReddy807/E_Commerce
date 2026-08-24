import React, { useState, useEffect } from 'react';
import { PackageCheck, Search, Clock, CheckCircle2, Truck, Box, MapPin, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';

interface OrderTrackerViewProps {
  initialOrderId?: string;
  onNavigateToShop: () => void;
}

const ORDER_STEPS = ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export const OrderTrackerView: React.FC<OrderTrackerViewProps> = ({ initialOrderId, onNavigateToShop }) => {
  const [searchOrderId, setSearchOrderId] = useState(initialOrderId || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecentOrders();
    if (initialOrderId) {
      handleLookup(initialOrderId);
    }
  }, [initialOrderId]);

  const loadRecentOrders = async () => {
    try {
      const orders = await api.getAllOrders();
      setRecentOrders(orders);
      if (!currentOrder && orders.length > 0 && !initialOrderId) {
        setCurrentOrder(orders[0]);
      }
    } catch (err) {
      console.error('Failed to load recent orders:', err);
    }
  };

  const handleLookup = async (idToSearch?: string) => {
    const id = (idToSearch || searchOrderId).trim();
    if (!id) return;

    try {
      setLoading(true);
      setError('');
      const order = await api.getOrderById(id);
      setCurrentOrder(order);
    } catch (err: any) {
      setError(err.message || `No order found with ID: ${id}`);
      setCurrentOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepName: string, currentStatus: string) => {
    const currentIndex = ORDER_STEPS.indexOf(currentStatus) !== -1 ? ORDER_STEPS.indexOf(currentStatus) : 0;
    const stepIndex = ORDER_STEPS.indexOf(stepName);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Real-Time Logistics & PostgreSQL Tracking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
          Track Your Package
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          Enter your order reference ID to query the status live from the database
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="flex gap-2 p-1.5 bg-white rounded-2xl border border-zinc-300 shadow-sm focus-within:border-indigo-500 transition"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              placeholder="e.g. ORD-M7X2..."
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchOrderId.trim()}
            className="bg-zinc-900 hover:bg-indigo-600 disabled:bg-zinc-300 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs"
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Tracking Details */}
      {currentOrder && (
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-md overflow-hidden">
          {/* Top Status Banner */}
          <div className="bg-zinc-900 text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 block font-mono">
                Order Tracking ID: {currentOrder.id}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-0.5">
                Status: <span className="text-emerald-400">{currentOrder.orderStatus}</span>
              </h2>
              <span className="text-xs text-zinc-400">
                Placed on {currentOrder.createdAt ? new Date(currentOrder.createdAt).toLocaleString() : 'Just now'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Total Amount</span>
              <span className="text-2xl font-extrabold text-white">
                ${currentOrder.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="p-6 sm:p-8 border-b border-zinc-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">
              Shipment Progress
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
              {ORDER_STEPS.map((step, idx) => {
                const status = getStepStatus(step, currentOrder.orderStatus);
                return (
                  <div key={step} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition ${
                        status === 'completed'
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : status === 'current'
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        status === 'current'
                          ? 'text-indigo-600 font-bold'
                          : status === 'completed'
                          ? 'text-zinc-900'
                          : 'text-zinc-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer & Shipping Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Delivery Details
              </h4>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Recipient:</span>
                  <span className="font-semibold text-zinc-800">{currentOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Email:</span>
                  <span className="text-zinc-800">{currentOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Address:</span>
                  <span className="text-right text-zinc-800 font-medium">{currentOrder.shippingAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">City / Postal:</span>
                  <span className="text-zinc-800">{currentOrder.city}, {currentOrder.postalCode}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-200">
                  <span className="text-zinc-400">Payment:</span>
                  <span className="font-semibold text-emerald-700">{currentOrder.paymentMethod} ({currentOrder.paymentStatus})</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Items in Package ({currentOrder.items?.length || 1})
              </h4>
              <div className="space-y-2">
                {currentOrder.items && currentOrder.items.length > 0 ? (
                  currentOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-100"
                          />
                        )}
                        <div>
                          <div className="text-xs font-bold text-zinc-900 line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-zinc-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-zinc-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-zinc-500 bg-zinc-50 rounded-xl">Hardware item verified in database</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders Quick Switcher */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-900">
              Recent Orders in PostgreSQL ({recentOrders.length})
            </h3>
            <button
              onClick={onNavigateToShop}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Back to Shop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => {
                  setCurrentOrder(order);
                  setSearchOrderId(order.id);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  currentOrder?.id === order.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-zinc-900">{order.id}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-900 text-white">
                    {order.orderStatus}
                  </span>
                </div>
                <div className="text-xs text-zinc-600 font-medium">{order.customerName}</div>
                <div className="flex justify-between items-center mt-2 text-[11px] text-zinc-400">
                  <span>${order.totalAmount?.toFixed(2)}</span>
                  <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
