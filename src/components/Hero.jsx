import { useEffect, useRef, useState } from 'react';
import Bouquet3D from './Bouquet3D';
import './Hero.css';

const Hero = () => {
  const visualRef = useRef(null);

  const [particles] = useState(() => {
    return [...Array(15)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${6 + Math.random() * 4}s`
    }));
  });

  useEffect(() => {
    // Scroll Parallax
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const parallaxElements = document.querySelectorAll('.parallax');
      parallaxElements.forEach((el) => {
        const speed = el.getAttribute('data-speed');
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };
    
    // Mouse Parallax for 3D effect
    const handleMouseMove = (e) => {
      if (!visualRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 40; // Max rotation X
      const y = (e.clientY / innerHeight - 0.5) * -40; // Max rotation Y
      visualRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="hero" id="home">
      {/* Floating Particles Background */}
      <div className="particles-container">
        {particles.map((style, i) => (
          <div 
            key={i} 
            className="particle" 
            style={style}
          />
        ))}
      </div>

      <div className="container hero-container">
        <div className="hero-content fade-in">
          <h1 className="title-primary">
            Lumé
          </h1>
          <p className="hero-tagline">
            Where Ribbons Bloom Into Roses.
          </p>
          
          <div className="hero-cta">
            <a href="/gallery" className="btn-primary">Explore Bouquets</a>
            <a href="/custom" className="btn-secondary">Order Now</a>
          </div>
        </div>

        {/* 3D Bouquet Container */}
        <div className="hero-visual parallax" data-speed="-0.2">
          <div className="interactive-3d-wrapper" ref={visualRef}>
            <div className="rose-image-container animate-float-slow">
              <img 
                src="/hero-rose-2.png" 
                alt="Premium 3D Ribbon Rose" 
                className="hero-3d-rose"
              />
              <div className="rose-glow"></div>
            </div>
            {/* Keeping the CSS bouquet as a decorative background element */}
            <div style={{ position: 'absolute', zIndex: -1, opacity: 0.5, transform: 'scale(0.8) translateY(50px)' }}>
              <Bouquet3D />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
