import RibbonRose3D from './RibbonRose3D';
import { ChevronDown } from 'lucide-react';
import './Hero.css';

const Hero = () => (
  <section className='hero' id='home'>
    <div className='hero-bg-aurora'></div>
    <div className='hero-bg-flare flare-1'></div>
    <div className='hero-bg-flare flare-2'></div>
    <div className='container hero-container glass-container'>
      <div className='hero-content fade-in'>
        <div className='hero-badge'>Artisan Handcrafted &#10024;</div>
        <h1 className='title-primary glowing-title'>Lumé</h1>
        <p className='hero-tagline'>Where Ribbons Bloom Into Roses.</p>
        <div className='hero-cta'>
          <a href='/gallery' className='btn-primary hover-glow'>Explore Bouquets</a>
          <a href='/custom' className='btn-secondary hover-float'>Custom Order</a>
        </div>
        <div className='hero-trust' style={{marginTop:'32px',display:'flex',gap:'24px',flexWrap:'wrap',justifyContent:'center'}}>
          <span className='trust-item'>&#10003; 500+ Happy Customers</span>
          <span className='trust-item'>&#10003; Pan-India Delivery</span>
          <span className='trust-item'>&#10003; Everlasting Blooms</span>
        </div>
      </div>
      <div className='hero-visual'>
        <RibbonRose3D />
      </div>
    </div>
    <a href='#story' className='hero-scroll-hint' style={{textDecoration:'none'}}>
      <ChevronDown size={20} />
    </a>
  </section>
);

export default Hero;
