import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, Package, CheckCircle, Truck, Clock, AlertCircle, ArrowLeft, MapPin, Navigation, Store } from "lucide-react";
import { getOrderByTrackId } from "../services/api";
import { Helmet } from "react-helmet-async";
import "./OrderTrackingPage.css";
const steps = [
  { index: 1, title: "Order Confirmed", sub: "Your order has been received and is queued for crafting.", Icon: Clock },
  { index: 2, title: "Artisan Crafting", sub: "Our florists are carefully hand-folding your bouquet.", Icon: Package },
  { index: 3, title: "In Transit", sub: "Your arrangement is on its way to you.", Icon: Truck },
  { index: 4, title: "Delivered", sub: "Successfully delivered to your doorstep.", Icon: CheckCircle },
];
const DeliveryMap = ({ address }) => {
  if (!address || address.trim() === "") return null;
  const fullAddress = encodeURIComponent(address + ", India");
  const storeQuery = encodeURIComponent("Kishanganj, Bihar, India");
  return (
    <div className="tracking-map-section">
      <div className="map-section-header">
        <MapPin size={20} color="var(--primary-dark)" />
        <h3>Delivery Location</h3>
      </div>
      <div className="map-grid">
        <div className="map-card">
          <div className="map-card-label origin-label"><Store size={14}/> Origin — Lumé Studio</div>
          <iframe
            title="Origin Map"
            src={"https://maps.google.com/maps?q=" + storeQuery + "&output=embed&t=&z=13&ie=UTF8&iwloc=&output=embed"}
            className="map-iframe"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="map-address"><strong>Kishanganj, Bihar — 855107</strong></p>
        </div>
        <div className="map-card">
          <div className="map-card-label dest-label"><Navigation size={14}/> Destination — Your Address</div>
          <iframe
            title="Delivery Map"
            src={"https://maps.google.com/maps?q=" + fullAddress + "&output=embed&t=&z=13&ie=UTF8&iwloc=&output=embed"}
            className="map-iframe"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="map-address">{address}</p>
        </div>
      </div>
      <div className="map-journey-bar">
        <div className="journey-point"><span className="journey-dot origin-dot" /><span>Kishanganj, Bihar</span></div>
        <div className="journey-line"><Truck size={16} color="var(--primary-dark)"/></div>
        <div className="journey-point"><span className="journey-dot dest-dot" /><span>{address.split(",")[0] || "Your Address"}</span></div>
      </div>
    </div>
  );
};
export default function OrderTrackingPage() {
  const location = useLocation();
  const [trackId, setTrackId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const getStatusIndex = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("delivered")) return 4;
    if (s.includes("transit")) return 3;
    if (s.includes("crafting")) return 2;
    return 1;
  };
  const doSearch = async (id) => {
    if (!id.trim()) return;
    setLoading(true); setError(""); setOrder(null);
    try {
      const found = await getOrderByTrackId(id.trim());
      if (found) setOrder(found);
      else setError("No order found. Please check your Bill Number.");
    } catch { setError("An error occurred. Please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const id = p.get("id");
    if (id) { setTrackId(id); doSearch(id); }
  }, [location.search]);
  return (
    <div className="tracking-page">
      <Helmet><title>Track Order | Lumé</title></Helmet>
      <div className="container" style={{ maxWidth: "820px" }}>
        <Link to="/" className="back-link animated-link" style={{ marginBottom: "24px", display: "inline-flex" }}><ArrowLeft size={18} /> Back to Home</Link>
        <div className="tracking-search-card glass-panel">
          <div className="artisan-badge" style={{ margin: "0 auto 20px" }}><MapPin size={14} /> Order Tracker</div>
          <h1 className="title-secondary text-center">Track Your Order</h1>
          <p className="subtitle text-center" style={{ marginBottom: "32px", maxWidth: "460px", margin: "0 auto 32px" }}>Enter your Bill Number from your receipt to see real-time production updates.</p>
          <form className="tracking-form" onSubmit={e => { e.preventDefault(); doSearch(trackId); }}>
            <div className="tracking-input-wrap">
              <Search size={20} />
              <input
                type="text"
                placeholder="e.g. 1748765432100"
                value={trackId}
                onChange={e => setTrackId(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "14px 28px", whiteSpace: "nowrap" }}>
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>
        </div>
        {error && (
          <div className="tracking-error glass-panel" style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", background: "#fff5f5", border: "1px solid #fee2e2" }}>
            <AlertCircle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
            <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
          </div>
        )}
        {order && (
          <div className="tracking-result-card glass-panel reveal-up">
            <div className="order-summary-bar">
              <div>
                <h2 className="order-ref">Order #{order.id ? order.id.slice(-8).toUpperCase() : "N/A"}</h2>
                <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>{order.item}</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "2px" }}>{order.date}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={"status-pill " + (order.status || "").toLowerCase().replace(" ", "-")} style={{ fontSize: "0.85rem", padding: "6px 14px" }}>{order.status}</span>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "8px" }}>{order.customer}</p>
              </div>
            </div>
            <div className="tracking-timeline">
              {steps.map(step => {
                const statusIdx = getStatusIndex(order.status);
                const isDone = step.index < statusIdx;
                const isActive = step.index === statusIdx;
                return (
                  <div key={step.index} className={"timeline-step" + (isDone ? " done" : "") + (isActive ? " active" : "")}>
                    <div className="step-left">
                      <div className="step-icon-wrap"><step.Icon size={20} /></div>
                      {step.index < 4 && <div className="step-line" />}
                    </div>
                    <div className="step-content">
                      <h4 className="step-title">{step.title}{isActive && <span className="active-pulse" />}</h4>
                      <p className="step-sub">{step.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <DeliveryMap address={order.address} />
          </div>
        )}
      </div>
    </div>
  );
}
