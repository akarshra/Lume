import { useState } from 'react';
import { Send, UploadCloud } from 'lucide-react';
import { addOrder } from '../services/api';
import './CustomOrderPage.css';

const CustomOrderPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    occasion: 'Birthday',
    colors: '',
    size: 'Medium (15-20 roses)',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Save to Database API
    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      customer: formData.name,
      phone: formData.phone,
      item: `Custom: ${formData.size}`,
      amount: "TBD",
      status: "Pending",
      type: "Custom Request"
    };
    
    try {
      await addOrder(newOrder);
      
      // 2. Redirect to WhatsApp
      const phone = "919000000000"; // Placeholder phone number
      const text = `Hello Lumé! I would like a custom bouquet.
      
Name: ${formData.name}
Occasion: ${formData.occasion}
Colors: ${formData.colors}
Size: ${formData.size}
Message: ${formData.message}`;

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error("Failed to save custom order", error);
      alert("There was an issue saving your request. Please try again.");
    }
  };

  return (
    <div className="page-wrapper custom-order-page">
      <div className="container">
        <div className="text-center fade-in">
          <h1 className="title-primary">Create Your Dream Bouquet</h1>
          <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Work with our artisans to design a personalized ribbon bouquet tailored to your exact vision and color palette.
          </p>
        </div>

        <div className="custom-form-container glass-panel reveal-up" style={{ animationDelay: '0.2s' }}>
          <form className="custom-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Jane Doe"/>
              </div>
              <div className="form-group">
                <label htmlFor="phone">WhatsApp Number</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210"/>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="occasion">Occasion</label>
                <select id="occasion" name="occasion" value={formData.occasion} onChange={handleChange}>
                  <option>Birthday</option>
                  <option>Anniversary</option>
                  <option>Proposal</option>
                  <option>Wedding</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="size">Preferred Size</label>
                <select id="size" name="size" value={formData.size} onChange={handleChange}>
                  <option>Small (5-10 roses)</option>
                  <option>Medium (15-20 roses)</option>
                  <option>Large (25-35 roses)</option>
                  <option>Grand (50+ roses)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="colors">Preferred Color Palette</label>
              <input type="text" id="colors" name="colors" value={formData.colors} onChange={handleChange} required placeholder="e.g., Blush Pink, Cream, and Soft Gold"/>
            </div>

            <div className="form-group">
              <label htmlFor="message">Special Instructions or Message</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows="4" placeholder="Any specific ribbon styles, wrapping preferences, or adding a personal note card?"></textarea>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
              <Send size={18} /> Submit Custom Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomOrderPage;
