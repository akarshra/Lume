import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Instagram, MapPin, Sparkles, Mail, Send, ChevronDown } from 'lucide-react';
import './ContactPage.css';

const faqs = [
  { q: 'How long does delivery take?', a: 'We ship pan-India within 3-5 business days. Once dispatched, you receive a tracking ID for real-time updates.' },
  { q: 'Are these flowers real?', a: 'Our roses are handcrafted from premium satin ribbons. They never wilt, never fade, and last forever — making them a timeless keepsake.' },
  { q: 'Can I customize my bouquet?', a: 'Absolutely! Visit our Custom Order page to choose your colors, size, occasion, and any special requirements.' },
  { q: 'What is the return policy?', a: 'Due to the handcrafted and perishable nature of our products, we do not offer returns. However, if your order arrives damaged, contact us within 24 hours.' },
  { q: 'Do you do bulk or wedding orders?', a: 'Yes! We love working on large events. Contact us directly via email or Instagram for bulk pricing and consultation.' },
  { q: 'How do I track my order?', a: 'Use the Track Order section in the navigation bar and enter your order Bill Number to see real-time status updates.' },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={['faq-item', open ? 'open' : ''].join(' ')} onClick={() => setOpen(!open)}>
      <div className='faq-question'>
        <span>{q}</span>
        <ChevronDown size={18} className='faq-chevron' style={{ transition: '0.3s', flexShrink: 0 }} />
      </div>
      <div className='faq-answer'>{a}</div>
    </div>
  );
};

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
    <div className='contact-page-wrapper fade-in'>
      <div className='container'>
        <div className='contact-premium-grid'>
          <div className='contact-story'>
            <div className='artisan-badge'><Sparkles size={14} /> Established Jan 2026</div>
            <h1 className='contact-main-title'>Let us Start a Conversation</h1>
            <p className='contact-description'>Whether it is a bespoke wedding bouquet or a single ribbon rose for a loved one, every piece is hand-folded in our <strong>Kishanganj studio</strong>. Reach out for collaborations or custom artisan inquiries.</p>
            <div className='social-connection'>
              <a href='https://instagram.com/l_u_m_eest._2026' className='social-link-large' target='_blank' rel='noreferrer'>
                <Instagram size={20} /> Follow our journey @l_u_m_eest._2026
              </a>
            </div>
          </div>
          <div className='contact-cards-container'>
            <div className='contact-info-subgrid'>
              <div className='info-mini-card glass-panel'>
                <Mail size={20} className='mini-icon' />
                <div><h4>Email</h4><p>lume.est2026@gmail.com</p></div>
              </div>
              <a href='https://www.google.com/maps/search/?api=1&query=Kishanganj+Bihar' target='_blank' rel='noreferrer' className='info-mini-card glass-panel map-card-link'>
                <MapPin size={20} className='mini-icon' />
                <div><h4>Location</h4><p>Kishanganj, Bihar</p><span className='map-hint'>Open in Maps</span></div>
              </a>
            </div>
            <div className='contact-form-card glass-panel'>
              <h3 className='form-title'>Send a Direct Inquiry</h3>
              <form className='mini-contact-form' onSubmit={handleSubmit}>
                <div className='form-group-row'>
                  <input type='text' placeholder='Your Name' required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  <input type='email' placeholder='Your Email' required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <textarea placeholder='Tell us about your custom bouquet idea or question...' rows='4' required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>
                {submitStatus === 'error' && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>Something went wrong. Please try again.</p>}
                <button type='submit' className='btn-send-message' disabled={submitStatus === 'loading' || submitStatus === 'done'}>
                  <span>{submitStatus === 'done' ? 'Sent! Thank you' : submitStatus === 'loading' ? 'Sending...' : 'Send Message'}</span>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <section className='faq-section'>
        <div className='container'>
          <div className='text-center'>
            <h2 className='title-secondary reveal-up'>Frequently Asked Questions</h2>
            <p className='subtitle reveal-up' style={{ maxWidth: '520px', margin: '0 auto' }}>Everything you need to know about Lume and our handcrafted bouquets.</p>
          </div>
          <div className='faq-grid reveal-up'>
            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
