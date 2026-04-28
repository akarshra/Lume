import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, UploadCloud, CreditCard, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addOrder } from '../services/api';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckoutForm from '../components/StripeCheckoutForm';
import Customizer3D from '../components/Customizer3D';
import './CustomOrderPage.css';

const stripePromise = loadStripe('pk_test_51T4bcOLkWChg5JeJdTPGkNttxonAEO6SuRYpKMuxggvRKXRXRCbaxwgp9wBwwy7anqdJrck1wPNXmXE9vekGtZk700Ob1bx4pL');

const CustomOrderPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    occasion: 'Birthday',
    colors: '',
    size: 'Medium (15-20 roses)',
    message: ''
  });
  
  const [clientSecret, setClientSecret] = useState(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const initStripePayment = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
       alert("Please fill in your name, email, and phone number first.");
       return;
    }
    
    setIsStripeLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCustom: true }),
      });
      const data = await response.json();
      if (data.error) setApiError(data.error);
      else setClientSecret(data.clientSecret);
    } catch (err) {
      console.error(err);
      setApiError('Failed to connect securely. Please try again.');
    } finally {
      setIsStripeLoading(false);
    }
  };

  const handleDepositSuccess = async (paymentIntentId) => {
    // Save to Database API upon successful payment
    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      customer: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      item: `Custom: ${formData.size}`,
      amount: 1000,
      status: "Paid",
      paymentMethod: "stripe",
      type: `Custom Request (Intent: ${paymentIntentId.slice(0, 8)})`,
      user_id: user ? user.id : null
    };
    
    try {
      await addOrder(newOrder);
      navigate('/success', { state: { order: newOrder } });
    } catch (error) {
      console.error("Failed to save custom order", error);
      alert("Payment succeeded but order saving failed. Please contact support.");
    }
  };



  return (
    <div className="page-wrapper custom-order-page">
      <div className="container">
        <div className="text-center fade-in">
          <h1 className="title-primary">Create Your Dream Bouquet</h1>
          <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Work with our artisans to design a personalized ribbon bouquet tailored to your exact vision and color palette.
          </p>
        </div>

        <div className="custom-form-container glass-panel reveal-up" style={{ animationDelay: '0.2s' }}>
          {clientSecret ? (
            <div className="stripe-embedded-container">
              <button 
                 type="button" 
                 onClick={() => setClientSecret(null)} 
                 className="back-btn" 
                 style={{ background: 'none', border: 'none', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
                <ArrowLeft size={18} /> Back to details
              </button>
              <h3 className="title-secondary" style={{ marginBottom: '8px' }}>Secure Deposit Payment</h3>
              <p className="subtitle" style={{ fontSize: '0.9rem', marginBottom: '24px' }}>Please complete the ₹1000 deposit to secure your custom order consultation.</p>
              
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm 
                   amountStr="₹1,000" 
                   onSuccess={handleDepositSuccess} 
                   onCancel={() => setClientSecret(null)}
                />
              </Elements>
            </div>
          ) : (
            <>
             <Customizer3D colors={formData.colors} />
             <form className="custom-form">
               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="name">Full Name</label>
                   <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Jane Doe"/>
                 </div>
                 <div className="form-group">
                   <label htmlFor="email">Email Address</label>
                   <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jane@example.com"/>
                 </div>
               </div>

               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="phone">WhatsApp Number</label>
                   <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210"/>
                 </div>
               </div>

               <div className="form-group">
                 <label htmlFor="address">Full Delivery Address</label>
                 <textarea id="address" name="address" value={formData.address} onChange={handleChange} required rows="2" placeholder="Street, Apartment, City, PIN Code..."></textarea>
               </div>

               <div className="form-row">
                 <div className="form-group">
                   <label htmlFor="occasion">Occasion</label>
                   <select id="occasion" name="occasion" value={formData.occasion} onChange={handleChange}>
                     <option>Birthday</option>
                     <option>Anniversary</option>
                     <option>Proposal</option>
                     <option>Wedding</option>
                     <option>Other</option>
                   </select>
                 </div>
                 <div className="form-group">
                   <label htmlFor="size">Preferred Size</label>
                   <select id="size" name="size" value={formData.size} onChange={handleChange}>
                     <option>Small (5-10 roses)</option>
                     <option>Medium (15-20 roses)</option>
                     <option>Large (25-35 roses)</option>
                     <option>Grand (50+ roses)</option>
                   </select>
                 </div>
               </div>

               <div className="form-group">
                 <label htmlFor="colors">Preferred Color Palette</label>
                 <input type="text" id="colors" name="colors" value={formData.colors} onChange={handleChange} required placeholder="e.g., Blush Pink, Cream, and Soft Gold"/>
               </div>

               <div className="form-group">
                 <label htmlFor="message">Special Instructions or Message</label>
                 <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="4" placeholder="Any specific ribbon styles, wrapping preferences, or adding a personal note card?"></textarea>
               </div>
               
               {apiError && <div style={{ color: '#d9534f', margin: '16px 0', textAlign: 'center', fontSize: '0.9rem' }}>{apiError}</div>}

               <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexDirection: 'column' }}>
                 <button 
                   type="button" 
                   className="btn-primary" 
                   onClick={initStripePayment}
                   disabled={isStripeLoading}
                   style={{ width: '100%', background: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                 >
                   <CreditCard size={18} /> 
                   {isStripeLoading ? 'Connecting Securely...' : 'Pay ₹1000 Deposit Securely with Stripe'}
                 </button>
                 
               </div>
             </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomOrderPage;
