import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Banknote, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckoutForm from '../components/StripeCheckoutForm';
import { addOrder, getPromos } from '../services/api';
import './CheckoutPage.css';

const stripePromise = loadStripe('pk_test_51T4bcOLkWChg5JeJdTPGkNttxonAEO6SuRYpKMuxggvRKXRXRCbaxwgp9wBwwy7anqdJrck1wPNXmXE9vekGtZk700Ob1bx4pL');

const CheckoutPage = () => {
  const { cartItems, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '',
    address: '',
    paymentMethod: 'stripe'
  });
  
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="container section page-enter-active text-center" style={{ paddingTop: '120px' }}>
        <h2 className="title-secondary">Your cart is empty.</h2>
        <Link to="/gallery" className="btn-primary" style={{ marginTop: '20px' }}>Return to Gallery</Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discount.includes('%')) {
      const percentage = parseInt(appliedPromo.discount.replace('%', ''), 10);
      discountAmount = Math.round((subtotal * percentage) / 100);
    } else if (appliedPromo.discount.includes('₹')) {
      discountAmount = parseInt(appliedPromo.discount.replace('₹', ''), 10);
    }
  }
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  const gstAmount = Math.round(discountedSubtotal * 0.18);
  const codCharge = formData.paymentMethod === 'cod' ? 100 : 0;
  const grandTotal = discountedSubtotal + gstAmount + codCharge;
  const totalAmountStr = `₹${grandTotal.toLocaleString('en-IN')}`;

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoCodeInput.trim()) return;
    try {
      const promos = await getPromos();
      const codeData = promos.find(p => p.code.toLowerCase() === promoCodeInput.trim().toLowerCase());
      if (codeData) {
        setAppliedPromo(codeData);
      } else {
        setPromoError('Invalid promo code');
      }
    } catch {
      setPromoError('Error verifying code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmOrder = async () => {
    const itemSummary = cartItems.map(item => `${item.quantity}x ${item.name}`).join(', ');
    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      customer: formData.name,
      phone: formData.phone,
      address: formData.address || "",
      paymentMethod: formData.paymentMethod,
      item: itemSummary,
      amount: grandTotal,
      status: "Pending",
      type: "Cart Order",
      platform: "direct",
      user_id: user ? user.id : null
    };
    
    try {
      await addOrder(newOrder);
      navigate('/success', { state: { order: newOrder } });
    } catch (error) {
      console.error("Failed to place order", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const handleInitialFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) return;
    
    if (formData.paymentMethod === 'stripe') {
      setIsLoadingSecret(true);
      setApiError(null);
      try {
        const response = await fetch('http://localhost:5001/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ name: "Cart Order", price: totalAmountStr }], isCustom: false }),
        });
        const data = await response.json();
        
        if (data?.error) {
           setApiError(data.error.message || data.error);
        } else if (data?.clientSecret) {
           setClientSecret(data.clientSecret);
        } else {
           throw new Error("Invalid response from payment server");
        }
      } catch (err) {
        console.error("Payment Error:", err);
        setApiError("Could not reach secure payment server. Please ensure the local backend server is running.");
      } finally {
        setIsLoadingSecret(false);
      }
    } else {
      handleConfirmOrder();
    }
  };

  return (
    <div className="page-wrapper page-enter-active" style={{ paddingTop: '100px', minHeight: '90vh', background: '#fafafa' }}>
      <div className="container">
        
        <Link to="/cart" className="back-link animated-link" style={{ marginBottom: '24px', display: 'inline-flex' }}>
          <ArrowLeft size={18} /> Back to Cart
        </Link>
        
        <div className="checkout-layout">
          
          <div className="glass-panel" style={{ padding: '40px', background: 'white' }}>
            <h1 className="title-secondary" style={{ marginBottom: '8px', fontSize: '2rem' }}>Complete Your Order</h1>
            <p className="subtitle" style={{ marginBottom: '32px' }}>Please provide your shipping and payment details.</p>
            
            {clientSecret ? (
              <div className="stripe-embedded-container reveal-up">
                <button 
                   type="button" 
                   onClick={() => setClientSecret(null)} 
                   className="back-btn" 
                   style={{ background: 'none', border: 'none', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '20px' }}>
                  <ArrowLeft size={18} /> Change address or payment method
                </button>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#0f172a' }}>Secure Credit Card Payment</h3>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripeCheckoutForm 
                       amountStr={totalAmountStr} 
                       onSuccess={handleConfirmOrder} 
                       onCancel={() => setClientSecret(null)}
                    />
                  </Elements>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInitialFormSubmit} className="checkout-form">
                <div className="checkout-form-grid">
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#555' }}>Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      placeholder="e.g. Jane Doe"
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#555' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      required 
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="address" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#555' }}>Complete Delivery Address</label>
                  <textarea 
                    id="address" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter full street address, apartment, and zip code..."
                    rows="3"
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', resize: 'vertical' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', color: '#555', fontWeight: 'bold' }}>Select Payment Method</label>
                  <div className="checkout-form-grid">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: formData.paymentMethod === 'stripe' ? '2px solid var(--primary-dark)' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', background: formData.paymentMethod === 'stripe' ? '#fafafa' : '#fff' }}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="stripe" 
                        checked={formData.paymentMethod === 'stripe'} 
                        onChange={handleChange} 
                        style={{ accentColor: 'var(--primary-dark)', width: '18px', height: '18px' }}
                      />
                      <CreditCard size={20} color={formData.paymentMethod === 'stripe' ? 'var(--primary-dark)' : '#666'} />
                      <span style={{ fontWeight: formData.paymentMethod === 'stripe' ? '600' : '400' }}>Pay Online</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: formData.paymentMethod === 'cod' ? '2px solid var(--primary-dark)' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', background: formData.paymentMethod === 'cod' ? '#fafafa' : '#fff' }}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod" 
                        checked={formData.paymentMethod === 'cod'} 
                        onChange={handleChange} 
                        style={{ accentColor: 'var(--primary-dark)', width: '18px', height: '18px' }}
                      />
                      <Banknote size={20} color={formData.paymentMethod === 'cod' ? 'var(--primary-dark)' : '#666'} />
                      <span style={{ fontWeight: formData.paymentMethod === 'cod' ? '600' : '400' }}>Cash on Delivery</span>
                    </label>
                  </div>
                  {formData.paymentMethod === 'cod' && (
                    <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14} /> ₹100 COD standard shipping fee applies.
                    </p>
                  )}
                </div>

                {apiError && (
                  <div style={{ color: '#d9534f', padding: '12px', background: '#ffebeb', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
                    {apiError}
                  </div>
                )}

                <button type="submit" className="btn-primary w-100" disabled={isLoadingSecret} style={{ padding: '18px', fontSize: '1.05rem', marginTop: '10px' }}>
                  {isLoadingSecret ? 'Connecting Securely...' : `Complete Order • ${totalAmountStr}`}
                </button>
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: '#888' }}>
                  <ShieldCheck size={14} style={{ inlineSize: 'auto', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  Secure SSL Checkout via Stripe
                </div>
              </form>
            )}
          </div>
          
          <div className="cart-summary glass-panel" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '24px', fontFamily: 'var(--font-heading)' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                     <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                     <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary-dark)', color: 'white', fontSize: '0.7rem', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>{item.quantity}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', margin: '0 0 4px', color: '#333' }}>{item.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }}/>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Promo code" 
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  disabled={!!appliedPromo}
                  style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
                {!appliedPromo ? (
                    <button type="button" onClick={handleApplyPromo} className="btn-secondary" style={{ padding: '10px 16px' }}>Apply</button>
                ) : (
                    <button type="button" onClick={handleRemovePromo} className="btn-outline-danger" style={{ padding: '10px 16px' }}>Remove</button>
                )}
              </div>
              {promoError && <p style={{ color: '#d9534f', fontSize: '0.8rem', marginTop: '6px' }}>{promoError}</p>}
              {appliedPromo && <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '6px' }}>Promo code applied successfully!</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: '#555' }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {appliedPromo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: '#10b981' }}>
                <span>Discount ({appliedPromo.code})</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: '#555' }}>
              <span>GST (18%)</span>
              <span>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            {formData.paymentMethod === 'cod' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: '#555' }}>
                <span>COD Charge</span>
                <span>₹100</span>
              </div>
            )}
            
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }}/>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
              <span>Total</span>
              <span>{totalAmountStr}</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
