import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircle2, Download, ShieldCheck, ArrowLeft, Home, Search, ShoppingBag } from 'lucide-react';
import '../components/BillModal.css';

const SuccessPage = () => {
  const location = useLocation();
  const [order] = useState(() => {
    if (location.state?.order) {
      localStorage.setItem('lume_last_order', JSON.stringify(location.state.order));
      return location.state.order;
    }
    try { return JSON.parse(localStorage.getItem('lume_last_order')); } catch { return null; }
  });
  const { clearCart } = useCart();
  useEffect(() => { clearCart(); }, [clearCart]);

  if (!order) {
    return (
      <div className="container text-center page-enter-active" style={{ paddingTop: '120px', minHeight: '80vh' }}>
        <h2 className="title-secondary" style={{ marginBottom: '20px' }}>No recent order found.</h2>
        <Link to="/gallery" className="btn-primary">Return to Gallery</Link>
      </div>
    );
  }

  const grandTotal = parseInt(String(order.amount).replace(/[^0-9]/g, '')) || 0;
  const isCustomDeposit = grandTotal === 1000 && order.paymentMethod === 'stripe';
  const delivery = isCustomDeposit ? 0 : 100;
  const gstRate = 0.18;
  const subtotal = grandTotal > (delivery + 10) ? Math.round((grandTotal - delivery) / (1 + gstRate)) : grandTotal;
  const gstAmount = grandTotal > (delivery + 10) ? grandTotal - delivery - subtotal : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-wrapper page-enter-active" style={{ minHeight: '80vh', padding: '120px 0 60px' }}>
      <div className="container">

        <Link to="/gallery" className="back-link animated-link no-print" style={{ marginBottom: '20px', display: 'inline-flex' }}>
          <ArrowLeft size={18} /> Continue Shopping
        </Link>

        <div className="bill-content glass-panel reveal-up" id="bill-receipt" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>

          <div className="bill-brand-header">
            <div className="bill-logo-container">
              <img src="/favicon.png" alt="Lumé Logo" className="bill-logo-img" />
              <div className="bill-logo-text">
                <span className="brand-name">Lumé</span>
                <span className="brand-tagline">Where Ribbons Bloom Into Roses.</span>
              </div>
            </div>
            <div className="bill-brand-details">
              <p>Kishanganj, Bihar</p>
              <p>India, 855107</p>
              <p>lume.est2026@gmail.com</p>
            </div>
          </div>

          <div className="bill-status-banner">
            <div className="status-left">
              <CheckCircle2 size={32} className="success-icon" />
              <div className="status-text">
                <h2>Payment Confirmed</h2>
                <p>Invoice No: #LME-{order.id.slice(-6).toUpperCase()}</p>
              <p style={{marginTop:"6px",fontWeight:"700",fontSize:"0.95rem",color:"#166534",letterSpacing:"1px",background:"#dcfce7",padding:"4px 10px",borderRadius:"6px",display:"inline-block"}}>🔍 Tracking ID: {order.id}</p>
              </div>
            </div>
            <div className="status-meta">
              <p><strong>Date & Time:</strong> {order.date}</p>
              <p style={{ margin: 0 }}><strong>Method:</strong> {order.paymentMethod === 'stripe' ? 'Online Payment' : 'Cash on Delivery'}</p>
            </div>
          </div>

          <div className="bill-body">
            <div className="bill-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
              <div className="info-block">
                <span className="label">Billed To (Customer)</span>
                <p className="value"><strong>{order.customer}</strong></p>
                <p className="value">{order.phone}</p>
                <p className="value address-small">{order.address}</p>
              </div>
              <div className="info-block text-right">
                <span className="label" style={{ textAlign: 'right' }}>Shipped From (Sender)</span>
                <p className="value"><strong>Lumé Studio</strong></p>
                <p className="value">Kishanganj, Bihar</p>
                <p className="value">India, 855107</p>
              </div>
            </div>

            <div className="bill-table">
              <div className="table-row head">
                <span>Item Description</span>
                <span>Qty</span>
                <span>Amount</span>
              </div>
              <div className="table-row">
                <span className="item-title">{order.item} <br /><small>Artisan-Folded Ribbon Bouquet</small></span>
                <span>1</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bill-financials">
              <div className="f-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="f-row">
                <span>GST (18%)</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="f-row">
                <span>Shipping & Handling</span>
                <span>₹{delivery.toLocaleString('en-IN')}</span>
              </div>
              <div className="f-total">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="bill-guarantee">
            <ShieldCheck size={20} />
            <p>This is a 100% handcrafted product. No two roses are exactly alike. Thank you for supporting artisan craft in Bihar.</p>
          </div>

          <div className="bill-footer no-print">
            <button className="btn-download" onClick={handlePrint}>
              <Download size={18} /> Print & Save Receipt
            </button>
          </div>
        </div>

        <div className="no-print" style={{ display: "flex", gap: "12px", marginTop: "24px", maxWidth: "800px", margin: "24px auto 0", flexWrap: "wrap" }}>
          <a href="/" style={{ flex: 1, minWidth: "140px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 20px", background: "white", border: "2px solid #e2e8f0", borderRadius: "12px", color: "#334155", fontWeight: "600", textDecoration: "none", transition: "0.2s" }}>
            <Home size={18} /> Go to Home
          </a>
          <a href="/track" style={{ flex: 1, minWidth: "140px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 20px", background: "white", border: "2px solid #e2e8f0", borderRadius: "12px", color: "#334155", fontWeight: "600", textDecoration: "none", transition: "0.2s" }}>
            <Search size={18} /> Track My Order
          </a>
          <a href="/gallery" style={{ flex: 2, minWidth: "180px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 20px", background: "var(--primary-dark)", borderRadius: "12px", color: "white", fontWeight: "600", textDecoration: "none", transition: "0.2s" }}>
            <ShoppingBag size={18} /> Continue Shopping
          </a>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
