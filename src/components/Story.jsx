import { useEffect, useRef } from 'react';
import './Story.css';

const Story = () => {
  const storyRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = storyRef.current.querySelectorAll('.fade-up');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section className="story section" id="story" ref={storyRef}>
      <div className="container">
        <div className="story-grid">
          
          {/* LEFT COLUMN: The Narrative */}
          <div className="story-content fade-up">
            <h2 className="title-secondary">Our Journey</h2>
            <p className="story-lead">
              Born from a passion for timeless beauty, Lumé brings elegant, handmade 
              ribbon bouquets to life, right from the heart of Kishanganj, Bihar.
            </p>

            <div className="journey-timeline">
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <span className="date">January 2026</span>
                <h4>The First Fold</h4>
                <p>Lumé was founded in a small Kishanganj workshop. We spent our first month perfecting the "Satin Bloom" technique—sculpting ribbons into roses that never wilt.</p>
              </div>
              
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <span className="date">February 2026</span>
                <h4>Local Heritage</h4>
                <p>What started as a personal craft became a local sensation. We expanded our palette to 20+ signature shades, becoming the choice for bespoke local celebrations.</p>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <span className="date">March 2026</span>
                <h4>The Digital Bloom</h4>
                <p>Today, we bring the meticulous craftsmanship of Bihar to your doorstep. Every rose tells a story of patience, precision, and everlasting love.</p>
              </div>
            </div>

            <div className="story-highlights">
              <div className="highlight">
                <span className="highlight-number">12+</span>
                <span className="highlight-text">Folds Per Petal</span>
              </div>
              <div className="highlight">
                <span className="highlight-number">∞</span>
                <span className="highlight-text">Everlasting</span>
              </div>
            </div>
          </div>
          
          {/* RIGHT COLUMN: The Visual */}
          <div className="story-image-container fade-up" style={{transitionDelay: '0.3s'}}>
            <div className="story-placeholder glass-panel align-center">
              <div className="blooming-animation">
                <div className="petal p1"></div>
                <div className="petal p2"></div>
                <div className="petal p3"></div>
                <div className="petal p4"></div>
                <div className="petal p5"></div>
              </div>
              <div className="placeholder-text">
                <p className="location-tag">Handcrafted in Kishanganj</p>
                <span className="est-tag">Est. Jan 2026</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Story;