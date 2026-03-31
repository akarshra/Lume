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
      try {
        const data = await getProducts();
        setBouquets(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
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
      amount: totalAmountStr,
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
          <div className="text-center" style={{ marginBottom: '60px' }}>
            <h2 className="title-secondary">Bouquet Collection</h2>
            <p className="subtitle">Discover our handcrafted masterpieces</p>
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
                  <span className="product-price">{item.price}</span>
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
