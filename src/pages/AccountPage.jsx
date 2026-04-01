import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../services/api';
import './Admin.css'; // Reusing admin styles for simplicity

const AccountPage = () => {
  const { user, signIn, signUp, signOut } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchMyOrders = async () => {
        try {
          const orders = await getOrders();
          setMyOrders(orders.filter(o => o.user_id === user.id));
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
        <button onClick={signOut} className="btn-outline-danger">Sign Out</button>
      </div>

      <div className="content-card glass-panel" style={{ padding: '2rem' }}>
        <h3>Order History</h3>
        {myOrders.length === 0 ? (
          <p>You haven't placed any orders yet.</p>
        ) : (
          <table className="admin-table" style={{ width: '100%', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Item</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id.slice(0, 8)}...</td>
                  <td>{order.item}</td>
                  <td>
                    <span className={`status-pill ${order.status.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>₹{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
