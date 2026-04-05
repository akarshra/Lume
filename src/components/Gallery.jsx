import { useState, useEffect } from "react";
import { Instagram, ShoppingCart, Heart, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import OrderModal from "./OrderModal";
import BillModal from "./BillModal";
import SkeletonCard from "./SkeletonCard";
import { addOrder, getTrendingProducts, getWishlist, toggleWishlist } from "../services/api";
import "./Gallery.css";
const COLOR_SWATCHES = [
  { label: "All", color: null },
  { label: "Red", color: "#C62828" },
  { label: "Pink", color: "#F48FB1" },
  { label: "Gold", color: "#D4AF37" },
  { label: "White", color: "#f8f8f8", border: "#ccc" },
  { label: "Purple", color: "#7B1FA2" },
  { label: "Lavender", color: "#CE93D8" },
  { label: "Blush", color: "#F8BBD0" },
];
const Gallery = ({ limit }) => {
  const [modalState, setModalState] = useState({ isOpen: false, product: null, platform: null });
  const [billOrder, setBillOrder] = useState(null);
  const [bouquets, setBouquets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterColor, setFilterColor] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lume_recently_viewed") || "[]");
    } catch {
      return [];
    }
  });
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    if (user) { getWishlist(user.id).then(data => { if(active) setWishlist(data); }); }
    else { Promise.resolve().then(() => { if(active) setWishlist([]); }); }
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    const manualSelection = [
      { id: "1", name: "Midnight Sparkle Rose", category: "Anniversary", price: "₹1,599", description: "Elegant dark tones intertwined with sparkly ribbons for a magical evening.", image: "/images/ig/1.webp", igId: "l_u_m_eest._2026", color: "Dark Red" },
      { id: "2", name: "Crimson Delight", category: "Romantic", price: "₹1,199", description: "Vibrant crimson ribbons carefully arranged to express deep affection.", image: "/images/ig/2.webp", igId: "l_u_m_eest._2026", color: "Red" },
      { id: "3", name: "Classic Anniversary Rose", category: "Anniversary", price: "₹1,299", description: "Deep red and blush pink ribbons woven into 24 premium blooming roses.", image: "/images/ig/3.webp", igId: "l_u_m_eest._2026", color: "Red" },
      { id: "4", name: "Golden Proposal", category: "Proposal", price: "₹2,499", description: "Luxurious soft gold and cream ribbon roses in our signature premium box.", image: "/images/ig/4.webp", igId: "l_u_m_eest._2026", color: "Gold" },
      { id: "5", name: "Lavender Dreams", category: "Birthday", price: "₹999", description: "Sweet lavender and white ribbons for a perfect birthday gift.", image: "/images/ig/5.webp", igId: "l_u_m_eest._2026", color: "Lavender" },
      { id: "6", name: "Soft Blush Elegance", category: "Custom", price: "From ₹1,499", description: "Customized pastel ribbons blending for weddings and special moments.", image: "/images/ig/6.webp", igId: "l_u_m_eest._2026", color: "Blush" },
      { id: "7", name: "Bridal White Bouquet", category: "Wedding", price: "₹3,499", description: "Pristine white silk ribbons formed into an opulent bridal arrangement.", image: "/images/ig/7.png", igId: "l_u_m_eest._2026", color: "White" },
    ];
    getTrendingProducts().then(data => { setBouquets(data && data.length > 0 ? data : manualSelection); }).catch(() => setBouquets(manualSelection)).finally(() => setIsLoading(false));
  }, []);
  const trackRecentlyViewed = (item) => {
    try {
      const rv = JSON.parse(localStorage.getItem("lume_recently_viewed") || "[]");
      const updated = [item, ...rv.filter(i => i.id !== item.id)].slice(0, 4);
      localStorage.setItem("lume_recently_viewed", JSON.stringify(updated));
      setRecentlyViewed(updated);
    } catch (e) { console.error(e); }
  };
  const handleProductClick = (item) => { trackRecentlyViewed(item); navigate("/product/" + item.id); };
  const handleOpenModal = (product, platform) => setModalState({ isOpen: true, product, platform });
  const handleCloseModal = () => setModalState({ isOpen: false, product: null, platform: null });
  const closeBill = () => setBillOrder(null);
  const handleConfirmOrder = async (customerDetails, product) => {
    const subtotal = parseInt(product.price.replace(/[^0-9]/g, ""), 10);
    const gstAmount = Math.round(subtotal * 0.18);
    const codCharge = 100;
    const grandTotal = subtotal + gstAmount + codCharge;
    const newOrder = { id: Date.now().toString(), date: new Date().toLocaleDateString(), customer: customerDetails.name, email: customerDetails.email, phone: customerDetails.phone, address: customerDetails.address || "", paymentMethod: customerDetails.paymentMethod || "cod", item: product.name, amount: grandTotal, status: "Pending", type: "Standard", platform: modalState.platform };
    try {
      await addOrder(newOrder);
      if (modalState.platform === "instagram") { window.open("https://www.instagram.com/" + product.igId + "/", "_blank"); handleCloseModal(); }
      else if (modalState.platform === "direct") { handleCloseModal(); setBillOrder(newOrder); }
    } catch { alert("There was an issue saving your order. Please try again."); }
  };
  const handleWishlistToggle = async (productId, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return alert("Please sign in to save items to your wishlist.");
    try {
      const isAdded = await toggleWishlist(productId, user.id);
      if (isAdded) setWishlist([...wishlist, productId]);
      else setWishlist(wishlist.filter(id => id !== productId));
    } catch (e) { console.error(e); }
  };
  const categories = ["All", ...new Set(bouquets.map(b => b.category))];
  let displayBouquets = [...bouquets];
  if (!limit) {
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); displayBouquets = displayBouquets.filter(b => b.name.toLowerCase().includes(q) || (b.category && b.category.toLowerCase().includes(q)) || (b.description && b.description.toLowerCase().includes(q))); }
    if (filterCategory !== "All") displayBouquets = displayBouquets.filter(b => b.category === filterCategory);
    if (filterColor) displayBouquets = displayBouquets.filter(b => b.color && b.color.toLowerCase().includes(filterColor.toLowerCase()));
    if (sortBy === "price-asc") displayBouquets.sort((a, b) => parseInt(String(a.price).replace(/[^0-9]/g, ""), 10) - parseInt(String(b.price).replace(/[^0-9]/g, ""), 10));
    else if (sortBy === "price-desc") displayBouquets.sort((a, b) => parseInt(String(b.price).replace(/[^0-9]/g, ""), 10) - parseInt(String(a.price).replace(/[^0-9]/g, ""), 10));
  }
  displayBouquets = limit ? displayBouquets.slice(0, limit) : displayBouquets;
  const skeletonCount = limit || 6;
  return (
    <section className="gallery section reveal-up" id="gallery">
      <div className="container">
        {!limit && (
          <>
            <div className="text-center" style={{ marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>
              <h2 className="title-secondary" style={{ fontSize: "2.5rem", marginBottom: "16px" }}>The Signature Collection</h2>
              <p className="subtitle">Discover our handcrafted botanical masterpieces.</p>
            </div>
            <div style={{ marginBottom: "20px", position: "relative", maxWidth: "420px" }}>
              <input type="text" placeholder="Search bouquets by name or occasion..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: "100%", padding: "12px 20px 12px 44px", border: "1.5px solid #e2e8f0", borderRadius: "30px", fontSize: "0.95rem", outline: "none", background: "#fff", boxSizing: "border-box" }} />
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>✕</button>}
            </div>
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "10px", fontWeight: "600" }}>Filter by Colour:</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                {COLOR_SWATCHES.map(sw => (
                  <button key={sw.label} onClick={() => setFilterColor(filterColor === sw.label && sw.color ? null : sw.color ? sw.label : null)} title={sw.label}
                    style={{ width: "32px", height: "32px", borderRadius: "50%", border: filterColor === sw.label ? "3px solid var(--primary-dark)" : sw.border ? "1.5px solid " + sw.border : "2px solid transparent", background: sw.color || "linear-gradient(135deg,#C62828,#F48FB1,#D4AF37)", cursor: "pointer", outline: filterColor === sw.label ? "2px solid var(--primary-dark)" : "none", outlineOffset: "2px", transition: "all 0.2s", boxShadow: filterColor === sw.label ? "0 0 0 2px white, 0 0 0 4px var(--primary-dark)" : "none" }}
                  />
                ))}
                {filterColor && <button onClick={() => setFilterColor(null)} style={{ padding: "4px 12px", borderRadius: "20px", border: "1px solid #ddd", background: "none", cursor: "pointer", fontSize: "0.8rem", color: "#666" }}>Clear ✕</button>}
              </div>
            </div>
            <div className="gallery-filters" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
              <div className="filter-categories" style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "none" }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)} className="btn-filter" style={{ padding: "8px 20px", borderRadius: "30px", whiteSpace: "nowrap", border: filterCategory === cat ? "2px solid var(--primary-dark)" : "1px solid #ddd", background: filterCategory === cat ? "var(--primary-dark)" : "transparent", color: filterCategory === cat ? "#fff" : "#444", fontWeight: filterCategory === cat ? "600" : "400", transition: "0.2s", cursor: "pointer" }}>{cat}</button>
                ))}
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #ddd", outline: "none", background: "#fff", cursor: "pointer" }}>
                <option value="default">Trending First (AI)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </>
        )}
        <div className="gallery-grid">
          {isLoading ? [...Array(skeletonCount)].map((_,i) => <SkeletonCard key={i}/>) : displayBouquets.map((item, idx) => (
            <div className="product-card glass-panel group reveal-up" key={item.id} style={{ animationDelay: (idx % 4 * 0.15 + 0.2) + "s" }}>
              <div className="product-image-wrapper" style={{ position: "relative", cursor: "pointer" }} onClick={() => handleProductClick(item)}>
                <button onClick={(e) => handleWishlistToggle(item.id, e)} style={{ position: "absolute", top: "12px", right: "12px", zIndex: 10, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}><Heart size={20} fill={wishlist.includes(item.id) ? "#ef4444" : "transparent"} color={wishlist.includes(item.id) ? "#ef4444" : "#666"} /></button>
                <img src={item.image} alt={item.name} className="product-image" loading="lazy" />
                <div className="product-hover-overlay"><Eye size={20}/> Quick View</div>
              </div>
              <div className="product-info">
                <span className="product-category">{item.category}</span>
                <h3 className="product-title" onClick={() => handleProductClick(item)} style={{ cursor: "pointer" }}>{item.name}</h3>
                <p className="product-desc">{item.description}</p>
                <div className="product-footer">
                  <span className="product-price">{String(item.price).includes("₹") ? item.price : "₹" + Number(item.price).toLocaleString("en-IN")}</span>
                  <div className="action-buttons">
                    <button className="btn-icon direct" onClick={(e)=>{e.stopPropagation();addToCart(item);}} title="Add to Cart"><ShoppingCart size={18}/></button>
                    <button className="btn-icon instagram" onClick={(e)=>{e.stopPropagation();handleOpenModal(item,"instagram");}} title="Order via Instagram DM"><Instagram size={18}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!limit && !isLoading && recentlyViewed.length > 0 && (
          <div className="recently-viewed-section">
            <h3 className="recently-viewed-title">Recently Viewed</h3>
            <div className="recently-viewed-grid">
              {recentlyViewed.map(item => (
                <div key={item.id} className="rv-card" onClick={() => handleProductClick(item)}>
                  <img src={item.image} alt={item.name}/>
                  <div className="rv-info"><p className="rv-name">{item.name}</p><p className="rv-price">{item.price}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <OrderModal isOpen={modalState.isOpen} onClose={handleCloseModal} product={modalState.product} onConfirm={handleConfirmOrder} platform={modalState.platform}/>
      <BillModal isOpen={!!billOrder} onClose={closeBill} order={billOrder}/>
    </section>
  );
};
export default Gallery;
