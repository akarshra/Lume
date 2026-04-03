import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../services/api';
import { Package, Clock, Truck, CheckCircle, SearchX } from 'lucide-react';
import './Admin.css';

const AccountPage = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('akarshsrivastava322@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchMyOrders = async () => {
        try {
          const orders = await getUserOrders(user.id);
          setMyOrders(orders);
        } catch (err) {
          console.error("Error fetching user orders:", err);
        }
      };
      fetchMyOrders();
    }
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        alert("Check your email for the login link!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setEmail('');
    setPassword('');
    setError('');
    setIsLogin(true);
  };

  if (!user) {
    return (
      <div className="admin-login-screen" style={{ paddingTop: '100px' }}>
        <div className="login-card glass-panel">
          <h2>{isLogin ? 'Sign In to Lumé' : 'Create Account'}</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleAuth}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <p style={{ marginTop: '1rem', cursor: 'pointer', textAlign: 'center' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '100px 5%', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Account</h2>
        <button onClick={handleSignOut} className="btn-outline-danger">Sign Out</button>
      </div>

      <div className="content-card glass-panel" style={{ padding: '3rem', minHeight: '400px' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}><Package color="var(--primary-dark)" /> My Order History</h3>
        
        {myOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#666' }}>
            <SearchX size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem' }}>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="order-history-grid" style={{ display: 'grid', gap: '1.5rem' }}>
            {myOrders.map(order => (
              <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', background: '#fff', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>Order #{order.id.slice(0, 8)}</span>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>• {order.date}</span>
                  </div>
                  <p style={{ margin: 0, color: '#555' }}>{order.item}</p>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: 'var(--primary-dark)' }}>
                    {String(order.amount).includes('₹') ? order.amount : `₹${Number(order.amount).toLocaleString('en-IN')}`}
                  </p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div className={`status-pill ${order.status?.toLowerCase().replace(' ', '-') || 'pending'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.9rem' }}>
                    {order.status === 'Pending' && <Clock size={16} />}
                    {order.status === 'Crafting' && <Package size={16} />}
                    {order.status === 'In Transit' && <Truck size={16} />}
                    {order.status === 'Delivered' && <CheckCircle size={16} />}
                    {order.status || 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
