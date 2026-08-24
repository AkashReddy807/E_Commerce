import React, { useState, useEffect } from 'react';
import { X, Star, Check, Heart, ShoppingBag, Send } from 'lucide-react';
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
      setReviewSuccessMsg('Review recorded in PostgreSQL.');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#111111]/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-[#ffffff] max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#f0f0f0] shadow-2xl">
        {/* Close Button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#999999] hover:text-[#111111] transition z-20"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-square bg-[#fafafa] border border-[#f0f0f0] overflow-hidden relative flex items-center justify-center p-6">
              <img
                src={images[selectedImageIdx] || images[0]}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-2.5 py-1 text-[9px] uppercase tracking-widest font-medium bg-[#111111] text-white">
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
                    className={`w-16 h-16 bg-[#fafafa] overflow-hidden border transition ${
                      selectedImageIdx === idx ? 'border-[#111111]' : 'border-[#f0f0f0] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Value Props Strip */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-[#666666]">
              <div className="p-3 bg-[#fafafa] border border-[#f0f0f0]">
                <div className="text-[10px] uppercase tracking-widest text-[#111111] font-semibold">Complimentary Shipping</div>
                <div className="text-[#999999] mt-0.5">Orders over $150 USD</div>
              </div>
              <div className="p-3 bg-[#fafafa] border border-[#f0f0f0]">
                <div className="text-[10px] uppercase tracking-widest text-[#111111] font-semibold">2-Year Coverage</div>
                <div className="text-[#999999] mt-0.5">Manufacturer backed</div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Purchase */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#999999]">
                  {product.brand}
                </span>
                <span className="text-[10px] font-mono text-[#999999]">SKU: {product.id}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-light tracking-tight text-[#111111] leading-tight mb-3">
                {product.title}
              </h2>

              {/* Ratings */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center text-[#111111]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating) ? 'fill-[#111111] text-[#111111]' : 'text-[#e5e5e5]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono font-medium text-[#111111]">{product.rating}</span>
                <span className="text-xs text-[#999999]">({reviews.length || product.reviewsCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 p-4 bg-[#fafafa] border border-[#f0f0f0] mb-5">
                <span className="text-2xl font-light font-mono text-[#111111]">${product.price.toFixed(2)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xs text-[#999999] line-through font-mono">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#111111] border border-[#111111] px-1.5 py-0.5">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mb-5">
                {product.description}
              </p>

              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#999999]">
                    Specifications
                  </h4>
                  <ul className="space-y-1.5">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#666666]">
                        <Check className="w-3.5 h-3.5 text-[#111111] shrink-0 mt-0.5 stroke-[2]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-5 border-t border-[#f0f0f0] space-y-4">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-[#e5e5e5] bg-[#ffffff] p-0.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 text-[#666666] hover:text-[#111111] flex items-center justify-center text-sm font-medium"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                    className="w-8 h-8 text-[#666666] hover:text-[#111111] flex items-center justify-center text-sm font-medium"
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
                  className="flex-1 bg-[#111111] hover:bg-[#333333] text-white py-3.5 px-6 text-xs uppercase tracking-widest font-medium transition flex items-center justify-center gap-2 rounded-none"
                >
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Add to Bag — ${(product.price * quantity).toFixed(2)}</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3.5 border transition ${
                    isWishlisted ? 'border-[#111111] text-[#111111]' : 'border-[#e5e5e5] text-[#999999] hover:text-[#111111]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 stroke-[1.5] ${isWishlisted ? 'fill-[#111111]' : ''}`} />
                </button>
              </div>

              <div className="text-center text-[10px] uppercase tracking-widest text-[#999999]">
                {product.stock > 0 ? `Database Status: ${product.stock} Units Available` : 'Currently Out of Stock'}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="border-t border-[#f0f0f0] p-6 sm:p-10 bg-[#fafafa]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-[#111111]">
              Verified Feedback ({reviews.length})
            </h3>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs uppercase tracking-widest font-medium text-[#111111] border-b border-[#111111] pb-0.5 hover:text-[#666666] hover:border-[#666666] transition"
            >
              {showReviewForm ? 'Close Form' : '+ Add Review'}
            </button>
          </div>

          {/* Review Submission Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="mb-8 p-6 bg-[#ffffff] border border-[#f0f0f0] space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest font-medium text-[#999999]">Write Review</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#666666] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    className="w-full text-xs p-2.5 bg-[#fafafa] border border-[#e5e5e5] focus:border-[#111111] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#666666] mb-1">Score (1 to 5 Stars)</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-[#111111] hover:opacity-75 transition"
                      >
                        <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-[#111111]' : 'text-[#e5e5e5]'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#666666] mb-1">Comment</label>
                <textarea
                  required
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details on acoustic clarity, build materials, finish..."
                  className="w-full text-xs p-2.5 bg-[#fafafa] border border-[#e5e5e5] focus:border-[#111111] outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                {reviewSuccessMsg && (
                  <span className="text-xs text-[#2ecc71] font-medium">{reviewSuccessMsg}</span>
                )}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="ml-auto inline-flex items-center gap-2 bg-[#111111] hover:bg-[#333333] text-white text-xs uppercase tracking-widest px-5 py-2.5 font-medium transition rounded-none"
                >
                  <Send className="w-3 h-3" />
                  <span>{submittingReview ? 'Saving...' : 'Submit to Postgres'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="py-6 text-center text-xs text-[#999999]">Accessing Supabase database...</div>
          ) : reviews.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#999999]">No reviews recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-[#ffffff] border border-[#f0f0f0] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#111111]">{rev.userName || rev.user_name}</span>
                    <div className="flex items-center text-[#111111]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rev.rating ? 'fill-[#111111]' : 'text-[#e5e5e5]'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#666666] leading-relaxed">{rev.comment}</p>
                  {rev.createdAt && (
                    <div className="text-[10px] font-mono text-[#999999]">
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

