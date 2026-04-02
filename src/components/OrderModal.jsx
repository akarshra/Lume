import { useState } from 'react';
import './OrderModal.css';
import { X, CreditCard, Banknote } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';

const stripePromise = loadStripe('pk_test_51T4bcOLkWChg5JeJdTPGkNttxonAEO6SuRYpKMuxggvRKXRXRCbaxwgp9wBwwy7anqdJrck1wPNXmXE9vekGtZk700Ob1bx4pL');

const OrderModal = ({ isOpen, onClose, product, onConfirm, platform, isCustomRequest }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '',
    address: '',
    paymentMethod: 'cod'
  });
  
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoadingSecret, setIsLoadingSecret] = useState(false);
  const [apiError, setApiError] = useState(null);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInitialFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    if (platform === 'direct' && !formData.address) return;
    
    if (formData.paymentMethod === 'stripe') {
      setIsLoadingSecret(true);
      setApiError(null);
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ name: product.name, price: product.price }], isCustom: isCustomRequest }),
        });
        const data = await response.json();
        if (data.error) {
           setApiError(data.error);
        } else {
           setClientSecret(data.clientSecret);
        }
      } catch {
        setApiError("Could not reach secure payment server. Please try again.");
      } finally {
        setIsLoadingSecret(false);
      }
    } else {
      onConfirm(formData, product);
    }
  };

  const capitalize = (str) => {
    if (str === 'direct') return 'Checkout';
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : 'Application';
  };

  const isDirect = platform === 'direct';

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel reveal-up" style={{ minWidth: clientSecret ? '450px' : 'auto' }}>
        <button className="modal-close" onClick={onClose} disabled={isLoadingSecret || !!clientSecret}>
          <X size={24} />
        </button>
        
        {clientSecret ? (
          <>
             <h3 className="modal-title">Secure Payment</h3>
             <p className="modal-subtitle">Enter your card details to complete your order automatically.</p>
             <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm 
                   amountStr={product.price} 
                   onSuccess={() => onConfirm(formData, product)} 
                   onCancel={() => setClientSecret(null)}
                />
             </Elements>
          </>
        ) : (
          <>
            <h3 className="modal-title">{isDirect ? 'Complete Your Order' : 'Order Details'}</h3>
            <p className="modal-subtitle">
              {isDirect ? 'Please provide your shipping and payment details.' : 'Please provide your details before we connect.'}
            </p>
            
            <form onSubmit={handleInitialFormSubmit} className="order-modal-form">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              {isDirect && (
                <>
                  <div className="form-group">
                    <label htmlFor="address">Delivery Address</label>
                    <textarea 
                      id="address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      required 
                      placeholder="Complete shipping address..."
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Method</label>
                    <div className="payment-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <label className={`payment-option ${formData.paymentMethod === 'stripe' ? 'selected' : ''}`} style={{ margin: 0, padding: '12px' }}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="stripe" 
                          checked={formData.paymentMethod === 'stripe'} 
                          onChange={handleChange} 
                        />
                        <CreditCard size={18} />
                        <span style={{ fontSize: '0.9rem' }}>Pay Online</span>
                      </label>
                      <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`} style={{ margin: 0, padding: '12px' }}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="cod" 
                          checked={formData.paymentMethod === 'cod'} 
                          onChange={handleChange} 
                        />
                        <Banknote size={18} />
                        <span style={{ fontSize: '0.9rem' }}>Cash on Delivery</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {apiError && (
                <div style={{ color: '#d9534f', padding: '8px 0', fontSize: '0.9rem', textAlign: 'center' }}>
                  {apiError}
                </div>
              )}

              <button type="submit" className="btn-primary w-100" disabled={isLoadingSecret}>
                {isLoadingSecret ? 'Connecting Securely...' : (isDirect ? `Continue to Payment` : `Proceed to ${capitalize(platform)}`)}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
