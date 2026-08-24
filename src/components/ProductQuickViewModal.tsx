import React, { useState, useEffect } from 'react';
import { X, Star, Check, Truck, ShieldCheck, Heart, ShoppingBag, Send, MessageSquare } from 'lucide-react';
import { Product, Review } from '../types';
import { api } from '../services/api';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Review form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedImageIdx(0);
      setQuantity(1);
      setShowReviewForm(false);
      setReviewSuccessMsg('');
      loadReviews(product.id);
    }
  }, [product]);

  const loadReviews = async (productId: string) => {
    try {
      setLoadingReviews(true);
      const data = await api.getProductById(productId);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewerName || !reviewComment) return;

    try {
      setSubmittingReview(true);
      const newReview = await api.addReview(product.id, reviewerName, reviewRating, reviewComment);
      setReviews((prev) => [newReview, ...prev]);
      setReviewSuccessMsg('Your verified review was saved directly to PostgreSQL!');
      setReviewerName('');
      setReviewComment('');
      setTimeout(() => setShowReviewForm(false), 2000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
        {/* Close Button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-square rounded-2xl bg-zinc-100 overflow-hidden border border-zinc-200 relative">
              <img
                src={images[selectedImageIdx] || images[0]}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white shadow-xs">
                  {product.badge}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      selectedImageIdx === idx ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Value Props */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Fast Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2-Year Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Purchase */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  {product.brand}
                </span>
                <span className="text-xs font-mono text-zinc-400">SKU: {product.id}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-snug mb-2">
                {product.title}
              </h2>

              {/* Ratings */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-amber-400' : 'text-zinc-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-zinc-800">{product.rating}</span>
                <span className="text-xs text-zinc-400">({reviews.length || product.reviewsCount} customer reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 mb-4">
                <span className="text-2xl font-extrabold text-zinc-900">${product.price.toFixed(2)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-sm text-zinc-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2 mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Key Features
                  </h4>
                  <ul className="space-y-1.5">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-zinc-200 rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg text-zinc-600 hover:bg-zinc-100 flex items-center justify-center font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                    className="w-8 h-8 rounded-lg text-zinc-600 hover:bg-zinc-100 flex items-center justify-center font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  id="modal-add-to-cart-btn"
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  disabled={product.stock === 0}
                  className="flex-1 bg-zinc-900 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart (${(product.price * quantity).toFixed(2)})</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3 rounded-xl border transition ${
                    isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              <div className="text-center">
                <span className={`text-xs ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-500'} font-medium`}>
                  {product.stock > 0 ? `✓ In Stock (${product.stock} units available in PostgreSQL)` : 'Currently out of stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Feedback Section */}
        <div className="border-t border-zinc-200 p-6 sm:p-8 bg-zinc-50/50 rounded-b-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-zinc-900 text-base">
                Verified Customer Reviews ({reviews.length})
              </h3>
            </div>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
            >
              {showReviewForm ? 'Cancel Review' : '+ Write a Review'}
            </button>
          </div>

          {/* Review Submission Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="mb-6 p-4 rounded-2xl bg-white border border-zinc-200 space-y-3">
              <h4 className="text-xs font-bold uppercase text-zinc-500">Post Review to PostgreSQL</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">Rating (1 to 5 Stars)</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400' : 'text-zinc-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Your Review</label>
                <textarea
                  required
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with build quality, battery life, sound..."
                  className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                {reviewSuccessMsg && (
                  <span className="text-xs text-emerald-600 font-semibold">{reviewSuccessMsg}</span>
                )}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="ml-auto inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Submitting...' : 'Submit to Database'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="py-4 text-center text-xs text-zinc-400">Loading reviews from Supabase...</div>
          ) : reviews.length === 0 ? (
            <div className="py-4 text-center text-xs text-zinc-500">No reviews yet. Be the first to review this product!</div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3.5 rounded-xl bg-white border border-zinc-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900">{rev.userName || rev.user_name}</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-zinc-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
                  {rev.createdAt && (
                    <div className="text-[10px] text-zinc-400">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
