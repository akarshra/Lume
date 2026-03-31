import { Instagram as InstagramIcon, Heart, MessageCircle } from 'lucide-react';
import './Instagram.css';

const Instagram = () => {
  // Real instagram posts fetched directly from @l_u_m_eest._2026
  const posts = [
    { id: 7, image: '/images/ig/7.png', caption: "Luxury wrapped in black & gold ✨", likes: 33, comments: 2, size: 'large' },
    { id: 1, image: '/images/ig/1.webp', caption: "Unwrapping joy with our signature ribbon boxes. 🎀 The perfect gift for any occasion.", likes: 234, comments: 12, size: 'medium' },
    { id: 2, image: '/images/ig/2.webp', caption: "Elegant monochrome. Black and silver ribbon roses creating a sophisticated statement. ✨", likes: 189, comments: 8, size: 'small' },
    { id: 3, image: '/images/ig/3.webp', caption: "Classic red ribbon roses under a beautiful blue sky. ❤️☁️", likes: 420, comments: 45, size: 'medium' },
    { id: 4, image: '/images/ig/4.webp', caption: "Soft pink ribbon flowers handcrafted with love. Perfect for your loved ones. 🌸", likes: 156, comments: 5, size: 'small' },
    { id: 5, image: '/images/ig/5.webp', caption: "A grand bouquet of our favorite pink ribbon roses. Blooming forever. 💕", likes: 312, comments: 18, size: 'large' },
    { id: 6, image: '/images/ig/6.webp', caption: "Sweet surprises! Ribbon roses and delicious chocolates. The ultimate combo. 🍫🌹", likes: 450, comments: 24, size: 'medium' },
  ];

  return (
    <section className="instagram-section section text-center">
      <div className="container">
        <div className="fade-in">
          <h2 className="title-secondary">Follow Our Journey</h2>
          <a 
            href="https://www.instagram.com/l_u_m_eest._2026/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="instagram-handle glow-text"
          >
            <InstagramIcon size={24} /> @l_u_m_eest._2026
          </a>
          <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
            Join our community of floral enthusiasts. We share daily inspiration, custom creations, and behind-the-scenes magic.
          </p>
        </div>
        
        <div className="instagram-masonry reveal-up">
          {posts.map(post => (
            <a 
              key={post.id} 
              href="https://www.instagram.com/l_u_m_eest._2026/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`insta-post-card ${post.size}`}
            >
              <div className="insta-image-wrapper">
                <img src={post.image} alt="Lumé Ribbon Bouquet Instagram Post" loading="lazy" />
                <div className="insta-glass-overlay">
                  <div className="insta-overlay-content">
                    <p className="insta-caption">{post.caption}</p>
                    <div className="insta-stats">
                      <span className="stat"><Heart size={20} fill="white" /> {post.likes}</span>
                      <span className="stat"><MessageCircle size={20} fill="white" /> {post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
        
        <a 
          href="https://www.instagram.com/l_u_m_eest._2026/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-primary reveal-up"
          style={{ marginTop: '50px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <InstagramIcon size={18} /> View More on Instagram
        </a>
      </div>
    </section>
  );
};

export default Instagram;
