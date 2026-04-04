import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User, PackageSearch, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import "./Navigation.css";
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const cartItemCount = getCartCount();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => { setIsOpen(false); }, [location.pathname]);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const isActive = (path) => location.pathname === path ? "active-link" : "";
  return (
    <nav className={["navbar glass-panel", scrolled ? "scrolled" : ""].join(" ")}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <h1>Lumé</h1>
          <span className="nav-tagline">Where Ribbons Bloom Into Roses</span>
        </Link>
        <div className={["nav-links", isOpen ? "active" : ""].join(" ")}>
          <Link to="/about" className={isActive("/about")}>Our Story</Link>
          <Link to="/gallery" className={isActive("/gallery")}>Bouquets</Link>
          <Link to="/custom" className={isActive("/custom")}>Custom Order</Link>
          <Link to="/wedding" className={isActive("/wedding")}>Weddings</Link>
          <Link to="/testimonials" className={isActive("/testimonials")}>Love</Link>
          <Link to="/contact" className={isActive("/contact")}>Contact</Link>
          <Link to="/admin" className="nav-admin" style={{background:"var(--primary-dark)",color:"white",padding:"6px 14px",borderRadius:"6px",fontWeight:"700",fontSize:"0.85rem"}}>Admin</Link>
        </div>
        <div className="nav-actions">
          <button className="nav-icon-btn" onClick={() => navigate("/track")} title="Track My Order"><PackageSearch size={22} /></button>
          <button className="nav-icon-btn" onClick={() => navigate("/wishlist")} title="My Wishlist" style={{position:"relative"}}><Heart size={22} /></button>
          <button className="nav-icon-btn" onClick={() => navigate("/account")} title="My Account"><User size={22} /></button>
          <button className="nav-icon-btn cart-btn" onClick={() => navigate("/cart")} title="View Cart">
            <ShoppingCart size={22} />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>
          <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isOpen && <div className="nav-overlay" onClick={() => setIsOpen(false)} />}
    </nav>
  );
};
export default Navigation;
