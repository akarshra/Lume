import { useState } from 'react';
import { Search, Package, CheckCircle, Truck, Clock, AlertCircle } from 'lucide-react';
import { getOrderByTrackId } from '../services/api';

const OrderTrackingPage = () => {
  const [trackId, setTrackId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    
    try {
      const foundOrder = await getOrderByTrackId(trackId.trim());
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('No order found with that ID. Please check your bill number and try again.');
      }
    } catch (err) {
      setError('An error occurred while tracking your order. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) return 4;
    if (s.includes('transit')) return 3;
    if (s.includes('crafting')) return 2;
    if (s.includes('pending')) return 1;
    return 1;
  };

  const renderTimelineItem = (stepIndex, title, subtitle, Icon, currentStatusIndex) => {
    const isCompleted = currentStatusIndex >= stepIndex;
    const isActive = currentStatusIndex === stepIndex;
    
    return (
      <div className={`timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`} style={{ display: 'flex', gap: '20px', marginBottom: '30px', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isActive ? 'var(--primary-dark)' : isCompleted ? '#10b981' : '#f1f5f9',
            color: (isActive || isCompleted) ? 'white' : '#94a3b8',
            transition: '0.3s'
          }}>
            <Icon size={20} />
          </div>
          {stepIndex < 4 && (
            <div style={{
              position: 'absolute', top: '40px', bottom: '-30px', left: '19px', width: '2px',
              background: isCompleted ? '#10b981' : '#e2e8f0', zIndex: 1
            }} />
          )}
        </div>
        <div style={{ paddingBottom: '10px' }}>
          <h4 style={{ margin: '0 0 4px', color: (isActive || isCompleted) ? '#1e293b' : '#94a3b8', fontSize: '1.05rem' }}>{title}</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{subtitle}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="page-wrapper page-enter-active" style={{ paddingTop: '100px', minHeight: '90vh', background: '#fafafa' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        <div className="glass-panel text-center reveal-up" style={{ padding: '60px 40px', background: 'white' }}>
          <h1 className="title-secondary" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Track Your Order</h1>
          <p className="subtitle" style={{ marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>Enter the unique Bill Number provided on your receipt to view real-time production updates.</p>
          
          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', color: '#94a3b8' }}>
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="e.g. 1711204812345" 
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                style={{ width: '100%', padding: '16px. 16px 16px 48px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', outline: 'none', transition: '0.2s' }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0 30px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
          
          {error && (
            <div style={{ marginTop: '24px', padding: '16px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} /> {error}
            </div>
          )}
        </div>

        {order && (
          <div className="glass-panel reveal-up" style={{ padding: '40px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#0f172a' }}>Order #{order.id.slice(0, 10)}</h2>
                <p style={{ margin: 0, color: '#64748b' }}>Placed on: {order.date}</p>
                <div style={{ marginTop: '16px' }}>
                  <span style={{ fontWeight: '600', color: '#0f172a', marginRight: '8px' }}>Item:</span> {order.item}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '8px' }}>
                  {String(order.amount).includes('₹') ? order.amount : `₹${Number(order.amount).toLocaleString('en-IN')}`}
                </div>
                <div className="status-pill" style={{ display: 'inline-block', background: '#f1f5f9', color: '#475569', fontWeight: '600' }}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                </div>
              </div>
            </div>

            <div style={{ paddingLeft: '20px' }}>
              {renderTimelineItem(1, 'Order Confirmed', 'Your order has been received and is pending allocation.', Clock, getStatusIndex(order.status))}
              {renderTimelineItem(2, 'Artisan Crafting', 'Our florists are carefully arranging your bouquet.', Package, getStatusIndex(order.status))}
              {renderTimelineItem(3, 'In Transit', 'Your arrangement is securely on its way to you.', Truck, getStatusIndex(order.status))}
              {renderTimelineItem(4, 'Delivered', 'The bouquet has been successfully delivered.', CheckCircle, getStatusIndex(order.status))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderTrackingPage;
