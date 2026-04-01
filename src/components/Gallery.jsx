import { useState, useEffect } from 'react';
import { MessageCircle, Instagram, ShoppingBag, ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import OrderModal from './OrderModal';
import BillModal from './BillModal';
import { addOrder, getProducts, getWishlist, toggleWishlist } from '../services/api';
import './Gallery.css';

const Gallery = ({ limit }) => {
  const [modalState, setModalState] = useState({ isOpen: false, product: null, platform: null });
  const [billOrder, setBillOrder] = useState(null);
  const [bouquets, setBouquets] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [wishlist, setWishlist] = useState([]);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    let active = true;
    if (user) {
      getWishlist(user.id).then((data) => {
        if (active) setWishlist(data);
      });
    } else {
      Promise.resolve().then(() => {
        if (active) setWishlist([]);
      });
    }
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    const fetchBouquets = async () => {
      const manualSelection = [
        { id: '1', name: "Midnight Sparkle Rose", category: "Anniversary", price: "₹1,599", description: "Elegant dark tones intertwined with sparkly ribbons for a magical evening.", image: "/images/ig/1.webp", igId: "l_u_m_eest._2026" },
        { id: '2', name: "Crimson Delight", category: "Romantic", price: "₹1,199", description: "Vibrant crimson ribbons carefully arranged to express deep affection.", image: "/images/ig/2.webp", igId: "l_u_m_eest._2026" },
        { id: '3', name: "Classic Anniversary Rose", category: "Anniversary", price: "₹1,299", description: "Deep red and blush pink ribbons woven into 24 premium blooming roses.", image: "/images/ig/3.webp", igId: "l_u_m_eest._2026" },
        { id: '4', name: "Golden Proposal", category: "Proposal", price: "₹2,499", description: "Luxurious soft gold and cream ribbon roses, arranged in our signature premium box.", image: "/images/ig/4.webp", igId: "l_u_m_eest._2026" },
        { id: '5', name: "Lavender Dreams", category: "Birthday", price: "₹999", description: "A sweet combination of pastel lavender and white ribbons for a perfect birthday gift.", image: "/images/ig/5.webp", igId: "l_u_m_eest._2026" },
        { id: '6', name: "Soft Blush Elegance", category: "Custom", price: "From ₹1,499", description: "Customized pastel ribbons blending perfectly for weddings and special moments.", image: "/images/ig/6.webp", igId: "l_u_m_eest._2026" },
        { id: '7', name: "Bridal White Bouquet", category: "Wedding", price: "₹3,499", description: "Pristine white silk ribbons formed into an opulent bridal arrangement.", image: "/images/ig/7.png", igId: "l_u_m_eest._2026" }
      ];
      
      try {
        const data = await getProducts();
        if (data && data.length > 0) {
          setBouquets(data);
        } else {
          setBouquets(manualSelection);
        }
      } catch (error) {
        console.error("Failed to fetch products, using manual selection fallback:", error);
        setBouquets(manualSelection);
      }
    };
    fetchBouquets();
  }, []);

  const handleOpenModal = (product, platform) => {
    setModalState({ isOpen: true, product, platform });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, product: null, platform: null });
  };

  const closeBill = () => setBillOrder(null);

  const handleConfirmOrder = async (customerDetails, product) => {
    // 1. Save to Database API
    const subtotal = parseInt(product.price.replace(/[^0-9]/g, ''), 10);
    const gstAmount = Math.round(subtotal * 0.18);
    const codCharge = 100;
    const grandTotal = subtotal + gstAmount + codCharge;
    const totalAmountStr = `₹${grandTotal.toLocaleString('en-IN')}`;

    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      customer: customerDetails.name,
      phone: customerDetails.phone,
      address: customerDetails.address || "",
      paymentMethod: customerDetails.paymentMethod || "cod",
      item: product.name,
      amount: grandTotal,
      status: "Pending",
      type: "Standard",
      platform: modalState.platform
    };
    
    try {
      await addOrder(newOrder);

      // 2. Redirect to Platform
      if (modalState.platform === 'whatsapp') {
        const phone = "919000000000"; // Placeholder phone number
        const message = `Hello Lumé! I am ${customerDetails.name}. I would like to order the *${product.name}* bouquet.\n
*Price Breakdown:*
- Bouquet: ₹${subtotal.toLocaleString('en-IN')}
- GST (18%): ₹${gstAmount.toLocaleString('en-IN')}
- COD Charge: ₹${codCharge}
*Total:* ${totalAmountStr}`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        handleCloseModal();
      } else if (modalState.platform === 'instagram') {
        const url = `https://www.instagram.com/${product.igId}/`;
        window.open(url, '_blank');
        handleCloseModal();
      } else if (modalState.platform === 'direct') {
        handleCloseModal();
        setBillOrder(newOrder); // Open bill modal
      }
    } catch (error) {
      console.error("Failed to place order from gallery", error);
      alert("There was an issue saving your order. Please try again.");
    }
  };

  const handleWishlistToggle = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return alert("Please sign in to save items to your wishlist.");
    try {
      const isAdded = await toggleWishlist(productId, user.id);
      if (isAdded) {
        setWishlist([...wishlist, productId]);
      } else {
        setWishlist(wishlist.filter(id => id !== productId));
      }
    } catch (error) {
      console.error("Wishlist error", error);
    }
  };

  const categories = ['All', ...new Set(bouquets.map(b => b.category))];

  let displayBouquets = [...bouquets];
  if (!limit) {
    if (filterCategory !== 'All') {
      displayBouquets = displayBouquets.filter(b => b.category === filterCategory);
    }
    if (sortBy === 'price-asc') {
      displayBouquets.sort((a, b) => parseInt(String(a.price).replace(/[^0-9]/g, ''), 10) - parseInt(String(b.price).replace(/[^0-9]/g, ''), 10));
    } else if (sortBy === 'price-desc') {
      displayBouquets.sort((a, b) => parseInt(String(b.price).replace(/[^0-9]/g, ''), 10) - parseInt(String(a.price).replace(/[^0-9]/g, ''), 10));
    }
  }
  displayBouquets = limit ? displayBouquets.slice(0, limit) : displayBouquets;

  return (
    <section className="gallery section reveal-up" id="gallery">
      <div className="container">
        {!limit && (
          <>
            <div className="text-center" style={{ marginBottom: '60px', maxWidth: '600px', margin: '0 auto 40px' }}>
              <h2 className="title-secondary" style={{ fontSize: '2.5rem', marginBottom: '16px', letterSpacing: '1px' }}>The Signature Collection</h2>
              <p className="subtitle" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>Discover our handcrafted botanical masterpieces, featuring exclusive arrangements directly from our latest Instagram journal.</p>
            </div>
            
            <div className="gallery-filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
              <div className="filter-categories" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setFilterCategory(cat)}
                    className="btn-filter"
                    style={{ padding: '8px 20px', borderRadius: '30px', whiteSpace: 'nowrap', border: filterCategory === cat ? '2px solid var(--primary-dark)' : '1px solid #ddd', background: filterCategory === cat ? 'var(--primary-dark)' : 'transparent', color: filterCategory === cat ? '#fff' : '#444', fontWeight: filterCategory === cat ? '600' : '400', transition: '0.2s', cursor: 'pointer' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="filter-sort">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: '#fff', cursor: 'pointer', color: '#444' }}
                >
                  <option value="default">Sort Options</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="gallery-grid">
          {displayBouquets.map((item, idx) => (
            <div 
              className="product-card glass-panel group reveal-up" 
              key={item.id}
              style={{ animationDelay: `${(idx % 4) * 0.15 + 0.2}s`}}
            >
              <div className="product-image-wrapper" style={{ position: 'relative' }}>
                <button 
                  onClick={(e) => handleWishlistToggle(item.id, e)}
                  style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                  title="Add to Wishlist"
                >
                  <Heart size={20} fill={wishlist.includes(item.id) ? '#ef4444' : 'transparent'} color={wishlist.includes(item.id) ? '#ef4444' : '#666'} />
                </button>
                <img src={item.image} alt={item.name} className="product-image" loading="lazy" />
              </div>
              
              <div className="product-info">
                <span className="product-category">{item.category}</span>
                <h3 className="product-title">{item.name}</h3>
                <p className="product-desc">{item.description}</p>
                <div className="product-footer">
                  <span className="product-price">{String(item.price).includes('₹') ? item.price : `₹${Number(item.price).toLocaleString('en-IN')}`}</span>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon direct"
                      onClick={() => addToCart(item)}
                      title="Add to Cart"
                    >
                      <ShoppingCart size={18} />
                    </button>
                    <button 
                      className="btn-icon whatsapp"
                      onClick={() => handleOpenModal(item, 'whatsapp')}
                      title="Order via WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button 
                      className="btn-icon instagram"
                      onClick={() => handleOpenModal(item, 'instagram')}
                      title="Order via Instagram DM"
                    >
                      <Instagram size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <OrderModal 
        isOpen={modalState.isOpen} 
        onClose={handleCloseModal} 
        product={modalState.product}
        onConfirm={handleConfirmOrder}
        platform={modalState.platform}
      />
      
      <BillModal 
        isOpen={!!billOrder} 
        onClose={closeBill} 
        order={billOrder} 
      />
    </section>
  );
};

export default Gallery;
