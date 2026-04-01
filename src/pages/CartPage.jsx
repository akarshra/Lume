import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import OrderModal from '../components/OrderModal';
import { addOrder } from '../services/api';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [modalState, setModalState] = useState({ isOpen: false, platform: null });
  const navigate = useNavigate();

  const handleOpenModal = (platform) => {
    setModalState({ isOpen: true, platform });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, platform: null });
  };

  const handleConfirmOrder = async (customerDetails) => {
    const itemSummary = cartItems.map(item => `${item.quantity}x ${item.name}`).join(', ');
    
    const subtotal = getCartTotal();
    const gstAmount = Math.round(subtotal * 0.18);
    const codCharge = 100;
    const grandTotal = subtotal + gstAmount + codCharge;
    const totalAmountStr = `₹${grandTotal.toLocaleString('en-IN')}`;

    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      customer: customerDetails.name,
      phone: customerDetails.phone,
      address: customerDetails.address || "",
      paymentMethod: customerDetails.paymentMethod || "cod",
      item: itemSummary,
      amount: grandTotal,
      status: "Pending",
      type: "Cart Order",
      platform: modalState.platform
    };
    
    try {
      await addOrder(newOrder);

      if (modalState.platform === 'whatsapp') {
        const phone = "919000000000"; 
        let message = `Hello Lumé! I am ${customerDetails.name}.\n\nI would like to place an order from my cart:\n`;
        cartItems.forEach(item => {
          message += `- ${item.quantity}x ${item.name} (${item.price})\n`;
        });
        message += `\n*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
        message += `*GST (18%):* ₹${gstAmount.toLocaleString('en-IN')}\n`;
        message += `*COD Charge:* ₹${codCharge}\n`;
        message += `*Grand Total:* ${totalAmountStr}\n`;
        if (customerDetails.address) message += `\n*Address:* ${customerDetails.address}\n`;
        
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        handleCloseModal();
        clearCart();
      } else if (modalState.platform === 'direct') {
        handleCloseModal();
        navigate('/success', { state: { order: newOrder } });
      }
    } catch (error) {
      console.error("Failed to place cart order", error);
      alert("Failed to place order. Please try again.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page container section page-enter-active">
        <div className="empty-cart glass-panel text-center">
          <ShoppingBag size={64} style={{ color: 'var(--accent)', margin: '0 auto 24px' }}/>
          <h2 className="title-secondary" style={{ marginBottom: '16px' }}>Your Cart is Empty</h2>
          <p className="subtitle" style={{ marginBottom: '32px' }}>Looks like you haven't added any beautiful blooms yet.</p>
          <Link to="/gallery" className="btn-primary">Explore Bouquets</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container section page-enter-active">
      <Link to="/gallery" className="back-link animated-link">
        <ArrowLeft size={18} /> Continue Shopping
      </Link>
      
      <h2 className="title-primary" style={{ marginTop: '24px' }}>Your Shopping Cart</h2>
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item glass-panel">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <span className="cart-item-category">{item.category}</span>
                <h3 className="cart-item-title">{item.name}</h3>
                <p className="cart-item-price">{String(item.price).includes('₹') ? item.price : `₹${Number(item.price).toLocaleString('en-IN')}`}</p>
              </div>
              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}>
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)} title="Remove Item">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary glass-panel">
          <h3 style={{ marginBottom: '24px', fontFamily: 'var(--font-heading)' }}>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row">
            <span>GST (18%)</span>
            <span>₹{Math.round(getCartTotal() * 0.18).toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row">
            <span>COD Charge</span>
            <span>₹100</span>
          </div>
          <hr className="summary-divider"/>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{(getCartTotal() + Math.round(getCartTotal() * 0.18) + 100).toLocaleString('en-IN')}</span>
          </div>
          
          <div className="checkout-actions">
            <button className="btn-primary w-100" onClick={() => navigate('/checkout')} style={{ marginBottom: '12px' }}>
              Checkout Securely
            </button>
            <button className="btn-secondary w-100" onClick={() => handleOpenModal('whatsapp')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              Order via WhatsApp
            </button>
          </div>
        </div>
      </div>

      <OrderModal 
        isOpen={modalState.isOpen} 
        onClose={handleCloseModal} 
        product={{ name: "Cart Order", price: `₹${(getCartTotal() + Math.round(getCartTotal() * 0.18) + 100).toLocaleString('en-IN')}` }}
        onConfirm={handleConfirmOrder}
        platform={modalState.platform}
      />
    </div>
  );
};

export default CartPage;
