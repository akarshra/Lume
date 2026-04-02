import RibbonRose3D from './RibbonRose3D';
import './Hero.css';

const Hero = () => {
  return (
    <section className='hero' id='home'>
      <div className='container hero-container'>
        <div className='hero-content fade-in'>
          <h1 className='title-primary'>Lumé</h1>
          <p className='hero-tagline'>Where Ribbons Bloom Into Roses.</p>
          <div className='hero-cta'>
            <a href='/gallery' className='btn-primary'>Explore Bouquets</a>
            <a href='/custom' className='btn-secondary'>Order Now</a>
          </div>
        </div>
        <div className='hero-visual'>
          <RibbonRose3D />
        </div>
      </div>
    </section>
  );
};

export default Hero;