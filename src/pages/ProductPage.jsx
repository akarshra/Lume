import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, ArrowLeft, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { addReview, getProductById, getReviews, getWishlist, toggleWishlist } from '../services/api';
import './ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [p, r] = await Promise.all([getProductById(id), getReviews(id)]);
        if (!active) return;
        setProduct(p);
        setReviews(r || []);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setWishlist([]);
      return;
    }
    getWishlist(user.id).then((data) => {
      if (active) setWishlist(data);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const isWishlisted = !!(user && product && wishlist.includes(product.id));

  const handleToggleWishlist = async () => {
    if (!user) return alert('Please sign in to save items to your wishlist.');
    if (!product) return;
    const added = await toggleWishlist(product.id, user.id);
    setWishlist((prev) => (added ? [...prev, product.id] : prev.filter((x) => x !== product.id)));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please sign in to leave a review.');
    if (!product) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      const created = await addReview({
        product_id: product.id,
        user_id: user.id,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        body: reviewForm.body,
      });
      setReviews((prev) => [created, ...prev]);
      setReviewForm({ rating: 5, title: '', body: '' });
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container section" style={{ paddingTop: '120px' }}>
        <p className="subtitle">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section" style={{ paddingTop: '120px' }}>
        <h2 className="title-secondary">Product not found</h2>
        <Link to="/gallery" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
          <ArrowLeft size={18} /> Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper page-enter-active product-page" style={{ paddingTop: '100px', minHeight: '90vh', background: '#fafafa' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <Link to="/gallery" className="back-link animated-link" style={{ marginBottom: '24px', display: 'inline-flex' }}>
          <ArrowLeft size={18} /> Back to Gallery
        </Link>

        <div className="product-hero glass-panel" style={{ background: 'white', padding: '28px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '28px', alignItems: 'start' }}>
          <div style={{ position: 'relative' }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '16px', objectFit: 'cover', aspectRatio: '4 / 3' }} />
            <button
              type="button"
              onClick={handleToggleWishlist}
              title="Wishlist"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(255,255,255,0.92)',
                border: 'none',
                borderRadius: 999,
                padding: '10px',
                cursor: 'pointer',
              }}
            >
              <Heart size={18} color={isWishlisted ? '#ef4444' : '#64748b'} fill={isWishlisted ? '#ef4444' : 'none'} />
            </button>
          </div>

          <div>
            <h1 className="title-secondary" style={{ marginBottom: '8px' }}>{product.name}</h1>
            <p className="subtitle" style={{ marginTop: 0, marginBottom: '14px' }}>{product.category}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '999px' }}>
                <Star size={16} color="#f59e0b" fill="#f59e0b" />
                <strong>{avgRating || '—'}</strong>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>({reviews.length} reviews)</span>
              </div>
              {product.inStock === false && (
                <span style={{ color: '#b91c1c', fontWeight: 700, background: '#fef2f2', border: '1px solid #fee2e2', padding: '8px 12px', borderRadius: 999 }}>
                  Out of stock
                </span>
              )}
            </div>

            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '10px' }}>
              {String(product.price).includes('₹') ? product.price : `₹${Number(product.price).toLocaleString('en-IN')}`}
            </div>

            <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '18px' }}>{product.description}</p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                type="button"
                disabled={product.inStock === false}
                onClick={() => addToCart({ ...product, price: String(product.price).includes('₹') ? product.price : `₹${Number(product.price).toLocaleString('en-IN')}` })}
                style={{ padding: '14px 18px' }}
              >
                Add to Cart
              </button>
              <Link to="/checkout" className="btn-secondary" style={{ padding: '14px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                Go to Checkout
              </Link>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ background: 'white', padding: '28px', marginTop: '22px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '14px' }}>Reviews</h3>

          <form onSubmit={handleSubmitReview} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, marginBottom: 18, background: '#fafafa' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'center' }}>
              <label style={{ fontWeight: 700, color: '#334155' }}>Rating</label>
              <select value={reviewForm.rating} onChange={(e) => setReviewForm((p) => ({ ...p, rating: e.target.value }))} style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }}>
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>

              <label style={{ fontWeight: 700, color: '#334155' }}>Title</label>
              <input value={reviewForm.title} onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))} placeholder="Short headline" style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1' }} />

              <label style={{ fontWeight: 700, color: '#334155' }}>Review</label>
              <textarea value={reviewForm.body} onChange={(e) => setReviewForm((p) => ({ ...p, body: e.target.value }))} placeholder="What did you like?" rows={3} style={{ padding: 10, borderRadius: 10, border: '1px solid #cbd5e1', resize: 'vertical' }} />
            </div>
            {reviewError && <p style={{ marginTop: 10, color: '#b91c1c' }}>{reviewError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn-primary" type="submit" disabled={submittingReview}>
                {submittingReview ? 'Submitting…' : 'Submit review'}
              </button>
            </div>
          </form>

          {reviews.length === 0 ? (
            <p className="subtitle" style={{ margin: 0 }}>No reviews yet. Be the first.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <strong style={{ color: '#0f172a' }}>{r.title || 'Review'}</strong>
                    <span style={{ color: '#64748b' }}>
                      {Array.from({ length: Number(r.rating) || 0 }).map((_, i) => (
                        <Star key={i} size={14} color="#f59e0b" fill="#f59e0b" style={{ marginRight: 2 }} />
                      ))}
                    </span>
                  </div>
                  {r.body && <p style={{ margin: '8px 0 0', color: '#334155', lineHeight: 1.6 }}>{r.body}</p>}
                  <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    {r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

