import { useState } from 'react';
import './OrderModal.css';
import { X, CreditCard, Banknote } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, product, onConfirm, platform }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '',
    address: '',
    paymentMethod: 'cod'
  });

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      if (platform === 'direct' && !formData.address) return;
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
      <div className="modal-content glass-panel reveal-up">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        <h3 className="modal-title">{isDirect ? 'Complete Your Order' : 'Order Details'}</h3>
        <p className="modal-subtitle">
          {isDirect ? 'Please provide your shipping and payment details.' : 'Please provide your details before we connect.'}
        </p>
        
        <form onSubmit={handleSubmit} className="order-modal-form">
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
                <div className="payment-options">
                  <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={formData.paymentMethod === 'cod'} 
                      onChange={handleChange} 
                    />
                    <Banknote size={18} />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary w-100">
            {isDirect ? `Place Order for ${product.price}` : `Proceed to ${capitalize(platform)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
