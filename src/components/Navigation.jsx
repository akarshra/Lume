import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import './Navigation.css';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const cartItemCount = getCartCount();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => {
    return location.pathname === path ? 'active-link' : '';
  };

  return (
    <nav className="navbar glass-panel">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h1>Lumé</h1>
          <span className="nav-tagline">Where Ribbons Bloom Into Roses</span>
        </Link>
        
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link to="/about" className={isActive('/about')} onClick={() => setIsOpen(false)}>Our Story</Link>
          <Link to="/gallery" className={isActive('/gallery')} onClick={() => setIsOpen(false)}>Bouquets</Link>
          <Link to="/custom" className={isActive('/custom')} onClick={() => setIsOpen(false)}>Custom Order</Link>
          <Link to="/testimonials" className={isActive('/testimonials')} onClick={() => setIsOpen(false)}>Love</Link>
          <Link to="/contact" className={isActive('/contact')} onClick={() => setIsOpen(false)}>Contact</Link>
          <Link to="/admin" className="nav-admin" onClick={() => setIsOpen(false)}>Admin</Link>
        </div>

        <div className="nav-actions">
          <button className="nav-cart-btn" onClick={() => { setIsOpen(false); navigate('/account'); }} title="My Account">
            <User size={22} />
          </button>
          
          <button className="nav-cart-btn" onClick={() => { setIsOpen(false); navigate('/cart'); }} title="View Cart">
            <ShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </button>
          
          <button className="nav-toggle" onClick={toggleMenu}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
