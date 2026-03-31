import Hero from '../components/Hero';
import Gallery from '../components/Gallery';
import Instagram from '../components/Instagram';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page fade-in page-enter-active">
      <Hero />
      
      {/* Short Preview Section */}
      <section className="section text-center" style={{ background: 'var(--surface-color)' }}>
        <div className="container">
          <h2 className="title-secondary reveal-up">The Lumé Experience</h2>
          <p className="subtitle reveal-up" style={{ maxWidth: '600px', margin: '0 auto 40px', animationDelay: '0.2s' }}>
            Where delicate ribbons are transformed into everlasting blooming roses. Experience true craftsmanship.
          </p>
          <Link to="/about" className="btn-secondary reveal-up" style={{ animationDelay: '0.3s' }}>
            Discover Our Story
          </Link>
        </div>
      </section>

      {/* Featured Gallery Snippet */}
      <div className="preview-gallery">
        <Gallery limit={3} />
        <div className="text-center" style={{ paddingBottom: '80px', background: 'var(--bg-color)' }}>
          <Link to="/gallery" className="btn-primary">View Full Collection</Link>
        </div>
      </div>

      <Instagram />
    </div>
  );
};

export default Home;
