import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, MapPin, Mail, Sparkles, MoveRight, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle');

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus('loading');
    try {
      await supabase.from('newsletter').upsert([{ email }], { onConflict: 'email' });
      setSubStatus('done');
      setEmail('');
    } catch {
      setSubStatus('done');
    }
  };

  return (
    <footer className="lume-footer">
      <div className="container footer-grid">
        
        {/* Brand Column */}
        <div className="footer-column brand-info">
          <h2 className="footer-logo">Lumé</h2>
          <p className="artisan-bio">
            Hand-folding silk into everlasting memories. Every petal is a testament 
            to the slow, intentional craft of our Kishanganj studio.
          </p>
          <div className="social-links">
            <a href="https://instagram.com" className="social-icon"><Instagram size={20} /></a>
            <a href="https://wa.me/910000000000" className="social-icon"><MessageCircle size={20} /></a>
          </div>
        </div>

        {/* Navigation Column */}
        <div className="footer-column">
          <h4 className="footer-heading">Boutique</h4>
          <ul className="footer-links">
            <li><Link to="/gallery">The Collection</Link></li>
            <li><Link to="/custom">Bespoke Orders</Link></li>
            <li><Link to="/testimonials">The Love Section</Link></li>
            <li><Link to="/admin">Artisan Portal</Link></li>
          </ul>
        </div>

        {/* Contact & Studio Info */}
        <div className="footer-column">
          <h4 className="footer-heading">The Studio</h4>
          <div className="studio-details">
            <p><MapPin size={16} /> Kishanganj, Bihar, India</p>
            <p><Mail size={16} /> hello@lumeboutique.com</p>
            <p className="studio-hours">
              <Sparkles size={14} /> 
              <span>Crafting Hours: Mon - Sat</span>
            </p>
          </div>
        </div>

        {/* Newsletter / Hook Column */}
        <div className="footer-column newsletter">
          <h4 className="footer-heading">Everlasting Updates</h4>
          <p>Join our list for first access to seasonal blooms.</p>
          <form className="footer-form" onSubmit={handleNewsletter}>
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required disabled={subStatus==='done'} />
            <button type="submit" disabled={subStatus==='loading' || subStatus==='done'}>
              {subStatus==='done' ? <CheckCircle size={18} /> : <MoveRight size={18} />}
            </button>
          </form>
          {subStatus==='done' && <p style={{color:'#10b981',fontSize:'0.8rem',marginTop:'8px'}}>Subscribed! Thank you 🌸</p>}
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container bottom-flex">
          <p>&copy; 2026 LUMÉ. Designed by Akarsh Raj.</p>
          <div className="policy-links">
            <Link to="/">Artisan Policy</Link>
            <span className="separator">•</span>
            <Link to="/">No-Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;