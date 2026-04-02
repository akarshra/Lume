import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Instagram, MapPin, Sparkles, Mail, Send } from 'lucide-react';
import './ContactPage.css';

const ContactPage = () => {
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    try {
      await supabase.from('contacts').insert([{ name: formData.name, email: formData.email, message: formData.message }]);
      setSubmitStatus('done');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="contact-page-wrapper fade-in">
      <div className="container">
        <div className="contact-premium-grid">
          
          {/* Left Side: The Narrative */}
          <div className="contact-story">
            <div className="artisan-badge">
              <Sparkles size={14} /> Established Jan 2026
            </div>
            <h1 className="contact-main-title">Let’s Start <br/>A Conversation</h1>
            <p className="contact-description">
              Whether it’s a bespoke wedding bouquet or a single ribbon rose for a loved one, 
              every piece is hand-folded in our <strong>Kishanganj studio</strong>. Reach out to us for 
              collaborations or custom artisan inquiries.
            </p>
            
            <div className="social-connection">
              <a 
                href="https://instagram.com/l_u_m_eest._2026" 
                className="social-link-large" 
                target="_blank" 
                rel="noreferrer"
              >
                <Instagram size={20} /> 
                <span>Follow our journey @lume_est2026</span>
              </a>
            </div>
          </div>

          {/* Right Side: Interactive Cards & Email Form */}
          <div className="contact-cards-container">
            

            {/* Email & Location Mini-Grid */}
            <div className="contact-info-subgrid">
              <div className="info-mini-card glass-panel">
                <Mail size={20} className="mini-icon" />
                <div>
                  <h4>Email</h4>
                  <p>lume.est2026@gmail.com</p>
                </div>
              </div>

              {/* FIXED: Location card now opens Google Maps */}
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Kishanganj+Bihar" 
                target="_blank" 
                rel="noreferrer" 
                className="info-mini-card glass-panel map-card-link"
              >
                <MapPin size={20} className="mini-icon" />
                <div>
                  <h4>Location</h4>
                  <p>Kishanganj, Bihar</p>
                  <span className="map-hint">Open in Maps →</span>
                </div>
              </a>
            </div>

            {/* Email Inquiry Form */}
            <div className="contact-form-card glass-panel">
              <h3 className="form-title">Direct Inquiry</h3>
              <form className="mini-contact-form" onSubmit={handleSubmit}>
                <div className="form-group-row">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <textarea 
                  placeholder="Tell us about your custom bouquet idea..." 
                  rows="3"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
                <button type="submit" className="btn-send-message" disabled={submitStatus==='loading' || submitStatus==='done'}>
                  <span>{submitStatus==='done' ? 'Sent! Thank you ✓' : submitStatus==='loading' ? 'Sending...' : 'Send Message'}</span>
                  <Send size={16} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;