import React from 'react';
import Tilt from 'react-parallax-tilt';
import { Star, Quote, Sparkles, Heart, Instagram, User } from 'lucide-react';
import './Testimonials.css';

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Sanjana Sharma",
      location: "Patna",
      text: "The Ruby Silk bouquet arrived in Kishanganj boutique packaging. It’s hard to believe these aren't real roses until you touch the silk.",
      date: "Feb 2026",
      type: "featured"
    },
    {
      id: 2,
      name: "Ishita Raj",
      location: "Kishanganj",
      text: "Every petal is unique. I ordered a custom set for my mother and she was speechless. The detail is incredible.",
      date: "Jan 2026",
      type: "standard"
    },
    {
      id: 3,
      name: "Aditi Varma",
      location: "New Delhi",
      text: "A truly premium gifting experience. The artisan craftsmanship is visible in every fold. Highly recommended!",
      date: "March 2026",
      type: "standard"
    }
  ];

  return (
    <section className="testimonials-wrapper luxe-red-white">
      <div className="container">
        {/* Editorial Header */}
        <header className="testimonials-header fade-in">
          <div className="artisan-badge">
            <Sparkles size={14} /> <span>The Everlasting Community</span>
          </div>
          <h2 className="display-title">Stories of <span className="text-crimson">Love</span></h2>
          <p className="subtitle">From our Kishanganj studio to your homes—each bouquet carries a journey.</p>
        </header>

        {/* 3D Masonry Grid */}
        <div className="masonry-grid">
          {reviews.map((rev) => (
            <Tilt
              key={rev.id}
              tiltMaxAngleX={8}
              tiltMaxAngleY={8}
              perspective={1200}
              transitionSpeed={1500}
              scale={1.03}
              gyroscope={true}
              glareEnable={true}
              glareMaxOpacity={0.15}
              glareColor="#ffffff"
              glarePosition="all"
              className={`tilt-card-wrapper ${rev.type}`}
            >
              <div className={`testimonial-card ${rev.type} glass-premium`}>
                <Quote className="quote-icon" size={48} />
                
                <div className="card-top">
                  <div className="star-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#b3002d" color="#b3002d" />
                    ))}
                  </div>
                  <span className="rev-date">{rev.date}</span>
                </div>

                <p className="rev-text">"{rev.text}"</p>

                <div className="rev-footer">
                  <div className="rev-user">
                    <div className="user-avatar">
                      <User size={18} />
                    </div>
                    <div className="user-details">
                      <strong>{rev.name}</strong>
                      <span>{rev.location}</span>
                    </div>
                  </div>
                  <Instagram size={18} className="ig-icon" />
                </div>
              </div>
            </Tilt>
          ))}

          {/* Special Artisan Signature Card with 3D Effect */}
          <Tilt 
            tiltMaxAngleX={5} 
            tiltMaxAngleY={5} 
            className="tilt-card-wrapper"
          >
            <div className="testimonial-card artisan-box">
              <Heart fill="white" size={30} className="floating-heart" />
              <h3>A Note to our Patrons</h3>
              <p>Your trust keeps the craft of ribbon-folding alive. Thank you for choosing LUMÉ.</p>
              <div className="artisan-sig">Hand-folded with Intention</div>
            </div>
          </Tilt>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;