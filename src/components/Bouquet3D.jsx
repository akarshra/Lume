import React, { useState } from 'react';
import { ShoppingCart, Heart, Eye, Sparkles, Filter } from 'lucide-react';
import './Bouquet3D.css';

const Bouquet3d = () => {
  const [filter, setFilter] = useState('All');

  const products = [
    { id: 1, name: 'The Ruby Classic', price: '₹1,999', category: 'Classic', tag: 'Bestseller' },
    { id: 2, name: 'Champagne Silk', price: '₹2,499', category: 'Premium', tag: 'Artisan Choice' },
    { id: 3, name: 'Midnight Velvet', price: '₹2,199', category: 'Luxury', tag: 'New Arrival' },
    { id: 4, name: 'Pastel Meadow', price: '₹1,799', category: 'Classic', tag: 'Trending' },
    { id: 5, name: 'Golden Aurora', price: '₹2,999', category: 'Luxury', tag: 'Limited' },
    { id: 6, name: 'Blush Whisper', price: '₹1,899', category: 'Premium', tag: 'Popular' }
  ];

  const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);

  return (
    <div className="b3d-page-root">
      <div className="b3d-container">

        <header className="b3d-header">
          <div className="b3d-badge-wrapper">
            <span className="b3d-premium-tag"><Sparkles size={14} /> Hand-Folded in Kishanganj</span>
          </div>
          <h1 className="b3d-main-title">The Ribbon Collection</h1>

          <div className="b3d-filter-wrapper">
            <div className="b3d-filter-pills">
              {['All', 'Classic', 'Premium', 'Luxury'].map(cat => (
                <button
                  key={cat}
                  className={`b3d-tab ${filter === cat ? 'is-active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="b3d-grid">
          {filteredProducts.map((p) => (
            <div className="b3d-card" key={p.id}>
              <div className="b3d-visual-area">
                {p.tag && <div className="b3d-floating-label">{p.tag}</div>}

                {/* Visual Placeholder */}
                <div className="b3d-art-content">
                  <div className="b3d-glow-effect"></div>
                </div>

                <div className="b3d-hover-overlay">
                  <button className="b3d-icon-btn"><Heart size={18} /></button>
                  <button className="b3d-icon-btn"><Eye size={18} /></button>
                </div>
              </div>

              <div className="b3d-info-area">
                <span className="b3d-cat-label">{p.category}</span>
                <h3 className="b3d-item-name">{p.name}</h3>
                <div className="b3d-card-footer">
                  <span className="b3d-item-price">{p.price}</span>
                  <button className="b3d-add-btn">
                    <ShoppingCart size={16} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bouquet3d;