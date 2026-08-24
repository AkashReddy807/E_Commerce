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
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#999999]">
          Live Logistics Tracking
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#111111]">
          Package Tracking System
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
          Input your order reference identifier to query status live from PostgreSQL.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="flex gap-2 p-1.5 bg-[#ffffff] border border-[#e5e5e5] focus-within:border-[#111111] transition"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#999999] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              placeholder="e.g. ORD-M7X2..."
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 outline-none font-mono uppercase bg-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !searchOrderId.trim()}
            className="bg-[#111111] hover:bg-[#333333] disabled:bg-[#cccccc] text-white text-xs uppercase tracking-widest font-medium px-5 py-2.5 transition rounded-none"
          >
            {loading ? '...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="mt-3 p-3 bg-[#fafafa] border border-[#111111] text-[#111111] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Tracking Details */}
      {currentOrder && (
        <div className="bg-[#ffffff] border border-[#f0f0f0] overflow-hidden">
          {/* Top Status Banner */}
          <div className="bg-[#111111] text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#999999] block font-mono">
                Tracking ID: {currentOrder.id}
              </span>
              <h2 className="text-xl sm:text-2xl font-light tracking-tight mt-1">
                Status: <span className="text-white font-medium">{currentOrder.orderStatus}</span>
              </h2>
              <span className="text-xs text-[#999999]">
                Created on {currentOrder.createdAt ? new Date(currentOrder.createdAt).toLocaleString() : 'Recent'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-[#999999] block">Total Settled</span>
              <span className="text-2xl font-light font-mono text-white">
                ${currentOrder.totalAmount?.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="p-6 sm:p-8 border-b border-[#f0f0f0]">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#999999] mb-6">
              Milestone Progress
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
              {ORDER_STEPS.map((step, idx) => {
                const status = getStepStatus(step, currentOrder.orderStatus);
                return (
                  <div key={step} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-9 h-9 flex items-center justify-center text-xs font-mono transition ${
                        status === 'completed'
                          ? 'bg-[#111111] text-white'
                          : status === 'current'
                          ? 'bg-[#ffffff] text-[#111111] border-2 border-[#111111]'
                          : 'bg-[#fafafa] text-[#999999] border border-[#e5e5e5]'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                      ) : (
                        <span>0{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] uppercase tracking-wider ${
                        status === 'current'
                          ? 'text-[#111111] font-semibold'
                          : status === 'completed'
                          ? 'text-[#111111]'
                          : 'text-[#999999]'
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
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#fafafa]">
            {/* Customer & Shipping Details */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#999999]">
                Consignee & Destination
              </h4>
              <div className="p-4 bg-[#ffffff] border border-[#f0f0f0] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#999999]">Recipient:</span>
                  <span className="font-medium text-[#111111]">{currentOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#999999]">Email:</span>
                  <span className="text-[#111111]">{currentOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#999999]">Address:</span>
                  <span className="text-right text-[#111111] font-medium">{currentOrder.shippingAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#999999]">City / Postal:</span>
                  <span className="text-[#111111]">{currentOrder.city}, {currentOrder.postalCode}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#f0f0f0]">
                  <span className="text-[#999999]">Payment:</span>
                  <span className="font-medium text-[#111111]">{currentOrder.paymentMethod} ({currentOrder.paymentStatus})</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#999999]">
                Manifest Objects ({currentOrder.items?.length || 1})
              </h4>
              <div className="space-y-2">
                {currentOrder.items && currentOrder.items.length > 0 ? (
                  currentOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-[#f0f0f0] bg-[#ffffff]">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover bg-[#fafafa] border border-[#f0f0f0]"
                          />
                        )}
                        <div>
                          <div className="text-xs font-medium text-[#111111] line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-[#999999]">Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold text-[#111111]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-[#999999] bg-[#ffffff] border border-[#f0f0f0]">Record verified in PostgreSQL database</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders Quick Switcher */}
      {recentOrders.length > 0 && (
        <div className="bg-[#ffffff] border border-[#f0f0f0] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111]">
              Recent Orders Log ({recentOrders.length})
            </h3>
            <button
              onClick={onNavigateToShop}
              className="text-xs uppercase tracking-widest font-medium text-[#111111] border-b border-[#111111] pb-0.5 hover:text-[#666666] hover:border-[#666666] transition flex items-center gap-1"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3 h-3" />
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
                className={`p-4 border cursor-pointer transition ${
                  currentOrder?.id === order.id
                    ? 'border-[#111111] bg-[#fafafa]'
                    : 'border-[#f0f0f0] hover:border-[#cccccc] bg-[#ffffff]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-semibold text-[#111111]">{order.id}</span>
                  <span className="text-[9px] uppercase tracking-widest font-medium px-1.5 py-0.5 bg-[#111111] text-white">
                    {order.orderStatus}
                  </span>
                </div>
                <div className="text-xs text-[#666666] truncate">{order.customerName}</div>
                <div className="flex justify-between items-center mt-3 text-[11px] font-mono text-[#999999] pt-2 border-t border-[#f0f0f0]">
                  <span className="text-[#111111] font-semibold">${order.totalAmount?.toFixed(2)}</span>
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

