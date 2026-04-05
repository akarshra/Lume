import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Gallery from '../components/Gallery';
import { Sparkles, ArrowLeft } from 'lucide-react';

const PromoLandingPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="page-enter-active" style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <Helmet>
        <title>Special Offer | Lumé</title>
      </Helmet>
      
      <div style={{ background: 'var(--primary-dark)', padding: '16px', textAlign: 'center', color: 'white' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          Welcome from the Campaign Email! <span style={{ opacity: 0.8 }}>(ID: {campaignId})</span>
        </p>
      </div>

      <div className="container text-center" style={{ padding: '60px 24px 20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto 24px' }}>
          <ArrowLeft size={16} /> Continue Shopping
        </button>
        <div className="artisan-badge">
          <Sparkles size={14} /> Curated Specially For You
        </div>
        <h1 className="title-primary reveal-up">Exclusive Campaign Selection</h1>
        <p className="subtitle reveal-up" style={{ maxWidth: '520px', margin: '0 auto', animationDelay: '0.2s' }}>
          Shop the trending artisan pieces selected specifically for your exclusive offer.
        </p>
      </div>
      
      {/* We reuse Gallery which now uses Trending products algorithm! */}
      <Gallery />
    </div>
  );
};

export default PromoLandingPage;
