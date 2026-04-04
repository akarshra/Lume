import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MapPin, Mail, Sparkles, MoveRight, CheckCircle, Phone } from 'lucide-react';
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
    } catch { setSubStatus('done'); }
  };

  return (
    <footer className='lume-footer'>
      <div className='container footer-grid'>
        <div className='footer-column brand-info'>
          <span className='footer-logo'>Lumé</span>
          <p className='artisan-bio'>Hand-folding satin into everlasting memories. Every petal is a testament to the slow, intentional craft of our Kishanganj studio.</p>
          <div className='social-links'>
            <a href='https://www.instagram.com/l_u_m_eest._2026/' target='_blank' rel='noreferrer' className='social-icon' title='Instagram'><Instagram size={18}/></a>
          </div>
        </div>
        <div className='footer-column'>
          <h4 className='footer-heading'>Boutique</h4>
          <ul className='footer-links'>
            <li><Link to='/gallery'>The Collection</Link></li>
            <li><Link to='/custom'>Bespoke Orders</Link></li>
            <li><Link to='/testimonials'>Customer Love</Link></li>
            <li><Link to='/track'>Track My Order</Link></li>
            <li><Link to='/admin'>Artisan Portal</Link></li>
          </ul>
        </div>
        <div className='footer-column'>
          <h4 className='footer-heading'>The Studio</h4>
          <div className='studio-details'>
            <p><MapPin size={15}/> Kishanganj, Bihar, India</p>
            <p><Mail size={15}/> lume.est2026@gmail.com</p>
            <p className='studio-hours'><Sparkles size={13}/> Crafting Hours: Mon - Sat</p>
          </div>
        </div>
        <div className='footer-column newsletter'>
          <h4 className='footer-heading'>Everlasting Updates</h4>
          <p>Join our list for first access to seasonal collections and exclusive offers.</p>
          <form className='footer-form' onSubmit={handleNewsletter}>
            <input type='email' placeholder='Your email address' value={email} onChange={e => setEmail(e.target.value)} required disabled={subStatus === 'done'} />
            <button type='submit' disabled={subStatus === 'loading' || subStatus === 'done'}>
              {subStatus === 'done' ? <CheckCircle size={18}/> : <MoveRight size={18}/>}
            </button>
          </form>
          {subStatus === 'done' && <p style={{color:'#10b981',fontSize:'0.82rem',marginTop:'10px'}}>Subscribed! Thank you &#127800;</p>}
        </div>
      </div>
      <div className='footer-bottom'>
        <div className='container bottom-flex'>
          <p>&copy; 2026 LUMÉ. Designed with love by Akarsh Raj.</p>
          <div className='policy-links'>
            <Link to='/'>Artisan Policy</Link>
            <span className='separator'>&bull;</span>
            <Link to='/'>No-Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
