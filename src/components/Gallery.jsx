import { useState, useEffect } from 'react';
import { MessageCircle, Instagram, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import OrderModal from './OrderModal';
import BillModal from './BillModal';
import { addOrder, getProducts } from '../services/api';
import './Gallery.css';

const Gallery = ({ limit }) => {
  const [modalState, setModalState] = useState({ isOpen: false, product: null, platform: null });
  const [billOrder, setBillOrder] = useState(null);
  const [bouquets, setBouquets] = useState([]);
  const { addToCart } = useCart();

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

  const displayBouquets = limit ? bouquets.slice(0, limit) : bouquets;

  return (
    <section className="gallery section reveal-up" id="gallery">
      <div className="container">
        {!limit && (
          <div className="text-center" style={{ marginBottom: '80px', maxWidth: '600px', margin: '0 auto 80px' }}>
            <h2 className="title-secondary" style={{ fontSize: '2.5rem', marginBottom: '16px', letterSpacing: '1px' }}>The Signature Collection</h2>
            <p className="subtitle" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>Discover our handcrafted botanical masterpieces, featuring exclusive arrangements directly from our latest Instagram journal.</p>
          </div>
        )}

        <div className="gallery-grid">
          {displayBouquets.map((item, idx) => (
            <div 
              className="product-card glass-panel group reveal-up" 
              key={item.id}
              style={{ animationDelay: `${(idx % 4) * 0.15 + 0.2}s`}}
            >
              <div className="product-image-wrapper">
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
