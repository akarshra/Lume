import Hero from '../components/Hero';
import Gallery from '../components/Gallery';
import Instagram from '../components/Instagram';
import Testimonials from '../components/Testimonials';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Award, Clock, Truck, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import './Home.css';

const StatCard = ({ number, label, icon: Icon, delay }) => (
  <div className='stat-feature-card reveal-up' style={{ animationDelay: delay }}>
    <div className='stat-icon-wrap'><Icon size={24} /></div>
    <div className='stat-number'>{number}</div>
    <div className='stat-label'>{label}</div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <div className='feature-card reveal-up' style={{ animationDelay: delay }}>
    <div className='feature-icon'><Icon size={22} /></div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const Home = () => (
  <div className='home-page fade-in'>
    <Hero />
    <section className='home-stats-section section' style={{ background: 'var(--surface-color)' }}>
      <div className='container'>
        <div className='text-center' style={{ marginBottom: '60px' }}>
          <div className='artisan-badge'><Sparkles size={14} /> Est. January 2026</div>
          <h2 className='title-secondary reveal-up'>The Lumé Experience</h2>
          <p className='subtitle reveal-up' style={{ maxWidth: '560px', margin: '0 auto' }}>Where delicate ribbons are transformed into everlasting blooming roses.</p>
        </div>
        <div className='stats-features-grid'>
          <StatCard number='500+' label='Happy Customers' icon={Heart} delay='0.1s' />
          <StatCard number='12+' label='Folds Per Petal' icon={Award} delay='0.2s' />
          <StatCard number='3-5' label='Days Delivery' icon={Truck} delay='0.3s' />
          <StatCard number='∞' label='Everlasting Bloom' icon={Clock} delay='0.4s' />
        </div>
      </div>
    </section>
    <div className='preview-gallery'>
      <div className='container text-center' style={{ padding: '80px 24px 20px' }}>
        <div className='artisan-badge'><Star size={14} /> Our Collection</div>
        <h2 className='title-secondary reveal-up'>Featured Creations</h2>
        <p className='subtitle reveal-up' style={{ maxWidth: '560px', margin: '0 auto 16px' }}>Handpicked masterpieces from our latest artisan journal.</p>
      </div>
      <Gallery limit={3} />
      <div className='text-center' style={{ paddingBottom: '80px', background: 'var(--bg-color)' }}>
        <Link to='/gallery' className='btn-primary'>View Full Collection <ArrowRight size={18} /></Link>
      </div>
    </div>
    <section className='features-section section'>
      <div className='container'>
        <div className='text-center' style={{ marginBottom: '60px' }}>
          <h2 className='title-secondary reveal-up'>Why Choose Lumé?</h2>
          <p className='subtitle reveal-up' style={{ maxWidth: '500px', margin: '0 auto' }}>Every detail is crafted with intention and care.</p>
        </div>
        <div className='features-grid'>
          <FeatureCard icon={Heart} title='Made with Love' desc='Each ribbon rose is hand-folded by our master artisans in Kishanganj with 12+ individual folds per petal.' delay='0.1s' />
          <FeatureCard icon={Award} title='Premium Quality' desc='Only the finest satin ribbons and premium packaging to ensure your gift arrives in pristine condition.' delay='0.2s' />
          <FeatureCard icon={Truck} title='Pan-India Delivery' desc='Secure, tracked delivery across India with real-time order status updates via our tracking portal.' delay='0.3s' />
          <FeatureCard icon={ShieldCheck} title='Everlasting Guarantee' desc='Ribbon roses that never wilt, never fade, and remain beautiful forever. Your satisfaction is our promise.' delay='0.4s' />
        </div>
      </div>
    </section>
    <section className='cta-section'>
      <div className='container'>
        <div className='cta-card reveal-up'>
          <div className='cta-content'>
            <h2>Have a Unique Vision?</h2>
            <p>Work with our artisans to design a personalized ribbon bouquet tailored to your exact palette and occasion.</p>
            <div className='cta-buttons'>
              <Link to='/custom' className='btn-primary cta-btn-white'>Create Custom Bouquet <ArrowRight size={18} /></Link>
              <Link to='/contact' className='btn-secondary cta-btn-ghost'>Talk to Us</Link>
            </div>
          </div>
          <div className='cta-visual'>🌸</div>
        </div>
      </div>
    </section>
    <Testimonials />
    <Instagram />
  </div>
);

export default Home;
