import React from 'react';
import { Sparkles, Send, Ruler, Palette, Heart } from 'lucide-react';
import './CustomOrder.css';

const CustomOrder = () => {
  return (
    <div className="custom-order-wrapper fade-in">
      <div className="container">
        <div className="custom-grid">
          
          {/* Left Side: The Inspiration */}
          <div className="custom-info-side">
            <div className="premium-tag">
              <Sparkles size={14} /> Bespoke Service
            </div>
            <h1 className="display-title">Design Your <br/>Unique <span className="text-crimson">Masterpiece</span></h1>
            <p className="subtitle">
              From wedding bouquets to personalized gifts, share your vision and let our artisans 
              hand-fold a creation that lasts forever.
            </p>
            
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon"><Palette size={20}/></div>
                <div><h4>Custom Palette</h4><p>Choose from over 50 silk ribbon shades.</p></div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Ruler size={20}/></div>
                <div><h4>Bespoke Sizing</h4><p>From single stems to grand bridal sets.</p></div>
              </div>
            </div>
          </div>

          {/* Right Side: The Premium Form */}
          <div className="custom-form-side">
            <div className="glass-form-card">
              <h3 className="form-header">Consultation Request</h3>
              <form className="lume-custom-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Akarsh Raj" />
                  </div>
                  <div className="form-group">
                    <label>Occasion</label>
                    <input type="text" placeholder="Wedding, Anniversary..." />
                  </div>
                </div>

                <div className="form-group">
                  <label>Color Preferences</label>
                  <input type="text" placeholder="e.g. Crimson Red & Bone White" />
                </div>

                <div className="form-group">
                  <label>Describe Your Vision</label>
                  <textarea rows="4" placeholder="Tell us about the style, ribbon material, and specific details you'd like..."></textarea>
                </div>

                <button type="submit" className="btn-luxe-submit">
                  <span>Send Inquiry</span>
                  <Send size={18} />
                </button>
                <p className="form-note">Our lead artisan will respond within 24 hours.</p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomOrder;