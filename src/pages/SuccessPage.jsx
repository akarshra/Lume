import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircle2, Download, ShieldCheck, ArrowLeft } from 'lucide-react';
import '../components/BillModal.css';

const SuccessPage = () => {
  const location = useLocation();
  const [order] = useState(location.state?.order);
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  if (!order) {
    return (
      <div className="container text-center page-enter-active" style={{ paddingTop: '120px', minHeight: '80vh' }}>
        <h2 className="title-secondary" style={{ marginBottom: '20px' }}>No recent order found.</h2>
        <Link to="/gallery" className="btn-primary">Return to Gallery</Link>
      </div>
    );
  }

  const grandTotal = parseInt(String(order.amount).replace(/[^0-9]/g, '')) || 0;
  const delivery = 100;
  const gstRate = 0.18;
  const subtotal = Math.round((grandTotal - delivery) / (1 + gstRate));
  const gstAmount = grandTotal - delivery - subtotal;

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
      </div>
    </div>
  );
};

export default SuccessPage;
