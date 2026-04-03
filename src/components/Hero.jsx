import RibbonRose3D from './RibbonRose3D';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="home">
      {/* Animated Aurora Background Layers */}
      <div className="hero-bg-aurora"></div>
      <div className="hero-bg-flare flare-1"></div>
      <div className="hero-bg-flare flare-2"></div>
      
      {/* Glassmorphism Foreground Container */}
      <div className="container hero-container glass-container">
        <div className="hero-content fade-in">
          <div className="hero-badge">Artisan Handcrafted</div>
          <h1 className="title-primary glowing-title">Lumé</h1>
          <p className="hero-tagline">Where Ribbons Bloom Into Roses.</p>
          <div className="hero-cta">
            <a href="/gallery" className="btn-primary hover-glow">Explore Bouquets</a>
            <a href="/custom" className="btn-secondary hover-float">Order Now</a>
          </div>
        </div>
        <div className="hero-visual">
          <RibbonRose3D />
        </div>
      </div>
    </section>
  );
};

export default Hero;