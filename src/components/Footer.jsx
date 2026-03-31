import React from 'react';
import { Instagram, MessageCircle, MapPin, Mail, Sparkles, MoveRight } from 'lucide-react';
import './Footer.css';

const Footer = () => {
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
            <li><a href="/bouquets">The Collection</a></li>
            <li><a href="/custom">Bespoke Orders</a></li>
            <li><a href="/love">The Love Section</a></li>
            <li><a href="/admin">Artisan Portal</a></li>
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
          <form className="footer-form">
            <input type="email" placeholder="Email Address" />
            <button type="submit"><MoveRight size={18} /></button>
          </form>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container bottom-flex">
          <p>&copy; 2026 LUMÉ. Designed by Akarsh Raj.</p>
          <div className="policy-links">
            <a href="/terms">Artisan Policy</a>
            <span className="separator">•</span>
            <a href="/privacy">No-Return Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;