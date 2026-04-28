import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Gallery from "../components/Gallery";
import Instagram from "../components/Instagram";
import Testimonials from "../components/Testimonials";
import { Link } from "react-router-dom";
import { Sparkles, Heart, Award, Clock, Truck, ShieldCheck, ArrowRight, Star, Timer } from "lucide-react";
import { Helmet } from "react-helmet-async";
import "./Home.css";
// eslint-disable-next-line no-unused-vars
const StatCard = ({ number, label, icon: Icon, delay }) => (
  <div className="stat-feature-card reveal-up" style={{ animationDelay: delay }}>
    <div className="stat-icon-wrap"><Icon size={24} /></div>
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);
// eslint-disable-next-line no-unused-vars
const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <div className="feature-card reveal-up" style={{ animationDelay: delay }}>
    <div className="feature-icon"><Icon size={22} /></div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);
const CountdownTimer = () => {
  const [endDate] = useState(() => {
    const stored = localStorage.getItem("lume_offer_end");
    if (stored) return new Date(stored);
    const end = new Date();
    end.setDate(end.getDate() + 7);
    localStorage.setItem("lume_offer_end", end.toISOString());
    return end;
  });
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = endDate - new Date();
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTime({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return (
    <section className="countdown-section">
      <div className="container">
        <div className="countdown-card glass-panel reveal-up">
          <div className="countdown-left">
            <div className="artisan-badge" style={{ marginBottom: "12px" }}><Timer size={14}/> Limited Time Offer</div>
            <h2>Get 15% Off Custom Orders!</h2>
            <p>Use code <strong>LUME15</strong> at checkout. Handcrafted just for you.</p>
            <Link to="/custom" className="btn-primary" style={{ marginTop: "16px" }}>Claim Offer <ArrowRight size={18}/></Link>
          </div>
          <div className="countdown-right">
            {[["days", time.days], ["hours", time.hours], ["mins", time.minutes], ["secs", time.seconds]].map(([label, val]) => (
              <div key={label} className="time-unit">
                <span className="time-value">{String(val).padStart(2, "0")}</span>
                <span className="time-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
const Home = () => (
  <div className="home-page fade-in">
    <Helmet><title>Lume | Where Ribbons Bloom Into Roses</title><meta name="description" content="Handcrafted ribbon rose bouquets from Kishanganj, Bihar. Everlasting artisan flowers."/></Helmet>
    <Hero />
    <section className="home-stats-section section" style={{ background: "var(--surface-color)" }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: "60px" }}>
          <div className="artisan-badge"><Sparkles size={14} /> Est. January 2026</div>
          <h2 className="title-secondary reveal-up">The Lume Experience</h2>
          <p className="subtitle reveal-up" style={{ maxWidth: "560px", margin: "0 auto" }}>Where delicate ribbons are transformed into everlasting blooming roses.</p>
        </div>
        <div className="stats-features-grid">
          <StatCard number="500+" label="Happy Customers" icon={Heart} delay="0.1s" />
          <StatCard number="12+" label="Folds Per Petal" icon={Award} delay="0.2s" />
          <StatCard number="3-5" label="Days Delivery" icon={Truck} delay="0.3s" />
          <StatCard number="∞" label="Everlasting Bloom" icon={Clock} delay="0.4s" />
        </div>
      </div>
    </section>
    <CountdownTimer />
    <div className="preview-gallery">
      <div className="container text-center" style={{ padding: "80px 24px 20px" }}>
        <div className="artisan-badge"><Star size={14} /> Our Collection</div>
        <h2 className="title-secondary reveal-up">Featured Creations</h2>
        <p className="subtitle reveal-up" style={{ maxWidth: "560px", margin: "0 auto 16px" }}>Handpicked masterpieces from our latest artisan journal.</p>
      </div>
      <Gallery limit={3} />
      <div className="text-center" style={{ paddingBottom: "80px", background: "var(--bg-color)" }}>
        <Link to="/gallery" className="btn-primary">View Full Collection <ArrowRight size={18} /></Link>
      </div>
    </div>
    <section className="features-section section">
      <div className="container">
        <div className="text-center" style={{ marginBottom: "60px" }}>
          <h2 className="title-secondary reveal-up">Why Choose Lume?</h2>
          <p className="subtitle reveal-up" style={{ maxWidth: "500px", margin: "0 auto" }}>Every detail is crafted with intention and care.</p>
        </div>
        <div className="features-grid">
          <FeatureCard icon={Heart} title="Made with Love" desc="Each ribbon rose is hand-folded by our master artisans in Kishanganj with 12+ individual folds per petal." delay="0.1s" />
          <FeatureCard icon={Award} title="Premium Quality" desc="Only the finest satin ribbons and premium packaging to ensure your gift arrives in pristine condition." delay="0.2s" />
          <FeatureCard icon={Truck} title="Pan-India Delivery" desc="Secure, tracked delivery across India with real-time order status updates via our tracking portal." delay="0.3s" />
          <FeatureCard icon={ShieldCheck} title="Everlasting Guarantee" desc="Ribbon roses that never wilt, never fade, and remain beautiful forever. Your satisfaction is our promise." delay="0.4s" />
        </div>
      </div>
    </section>
    <section className="cta-section">
      <div className="container">
        <div className="cta-card reveal-up">
          <div className="cta-content">
            <h2>Have a Unique Vision?</h2>
            <p>Work with our artisans to design a personalized ribbon bouquet tailored to your exact palette and occasion.</p>
            <div className="cta-buttons">
              <Link to="/custom" className="btn-primary cta-btn-white">Create Custom Bouquet <ArrowRight size={18} /></Link>
              <Link to="/wedding" className="btn-secondary cta-btn-ghost">Wedding Orders</Link>
            </div>
          </div>
          <div className="cta-visual">🌸</div>
        </div>
      </div>
    </section>
    <Testimonials />
    <Instagram />
  </div>
);
export default Home;
