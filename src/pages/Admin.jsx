import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Database, Tag, TrendingUp, Users, 
  Plus, Trash2, Send, Lock, Download, Search, X, AlertTriangle, ArrowUpRight, Gift 
} from 'lucide-react';
import { 
  getOrders, updateOrderStatus, deleteOrder as deleteOrderApi, clearAllOrders as clearAllOrdersApi,
  getInventory, addInventory as addInventoryApi, updateInventoryStatus, deleteInventoryItem,
  getPromos, addPromo as addPromoApi, deletePromoApi,
  getProducts, addProduct, deleteProduct
} from '../services/api';
import './Admin.css';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  // --- STATE MANAGEMENT ---
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [newItem, setNewItem] = useState({ name: '', stock: '', unit: 'Rolls' });
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Signature Roses', price: '', description: '', image: '', color: '', igId: '' });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchInventory();
      fetchPromos();
      fetchProducts();
    }
  }, [isAuthenticated]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    }
  };

  const fetchPromos = async () => {
    try {
      const data = await getPromos();
      setPromoCodes(data);
    } catch (error) {
      console.error("Failed to fetch promos", error);
    }
  };

  // --- ACTIONS: AUTH & NOTIFY ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'lume2026') setIsAuthenticated(true);
  };

  const handleNotify = (order) => {
    const msg = `Hello ${order.customer}! Artisan Update: Your Lumé bouquet status is now *${order.status}*. 🌹`;
    window.open(`https://wa.me/${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- ACTIONS: ORDERS ---
  const deleteOrder = async (id) => {
    try {
      await deleteOrderApi(id);
      setOrders(orders.filter(o => o.id !== id));
    } catch (error) {
      console.error("Error deleting order", error);
    }
  };

  const clearAllOrders = async () => {
    if (window.confirm("Are you sure you want to delete ALL order history? This cannot be undone.")) {
      try {
        await clearAllOrdersApi();
        setOrders([]);
      } catch (error) {
        console.error("Error clearing orders", error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  // --- ACTIONS: INVENTORY ---
  const toggleStock = async (id) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    try {
      await updateInventoryStatus(id, !item.inStock);
      setInventory(inventory.map(i => i.id === id ? { ...i, inStock: !item.inStock } : i));
    } catch (error) {
      console.error("Error updating stock", error);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const addedItem = await addInventoryApi({ ...newItem, inStock: true });
      setInventory([...inventory, addedItem]);
      setNewItem({ name: '', stock: '', unit: 'Rolls' });
      setIsInventoryModalOpen(false);
    } catch (error) {
      console.error("Error adding material", error);
    }
  };

  const deleteInventory = async (id) => {
    try {
      await deleteInventoryItem(id);
      setInventory(inventory.filter(i => i.id !== id));
    } catch (error) {
      console.error("Error deleting material", error);
    }
  };

  // --- ACTIONS: PROMOS ---
  const deletePromo = async (code) => {
    try {
      await deletePromoApi(code);
      setPromoCodes(promoCodes.filter(p => p.code !== code));
    } catch (error) {
      console.error("Error deleting promo", error);
    }
  };

  // --- ACTIONS: PRODUCTS (BOUQUETS) ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newProduct, price: parseFloat(newProduct.price) };
      const addedItem = await addProduct(payload);
      setProducts([...products, addedItem]);
      setNewProduct({ name: '', category: 'Signature Roses', price: '', description: '', image: '', color: '', igId: '' });
      setIsProductModalOpen(false);
    } catch (error) {
      console.error("Error adding product", error);
    }
  };

  const deleteProductObj = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="login-card glass-panel">
          <Lock size={48} className="lock-icon" />
          <h2>Lumé Command</h2>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Passkey" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="btn-primary">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/favicon.png" alt="L" />
          <span>LUMÉ ADMIN</span>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><LayoutDashboard size={20}/> Overview</button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}><ShoppingBag size={20}/> Orders</button>
          <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}><Database size={20}/> Inventory</button>
          <button className={activeTab === 'bouquets' ? 'active' : ''} onClick={() => setActiveTab('bouquets')}><Gift size={20}/> Bouquets</button>
          <button className={activeTab === 'promos' ? 'active' : ''} onClick={() => setActiveTab('promos')}><Tag size={20}/> Marketing</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="main-header">
          <div className="search-bar"><Search size={18} /><input type="text" placeholder="Search records..." /></div>
          <div className="admin-avatar">AR</div>
        </header>

        <div className="admin-scroll-content">
          {activeTab === 'overview' && (
            <div className="admin-section fade-in">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-icon rev"><TrendingUp color="#10b981"/></div><span className="stat-grow">+12% <ArrowUpRight size={14}/></span></div>
                  <h3>₹42,850</h3><p>Revenue</p>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-icon orders"><ShoppingBag color="#3b82f6"/></div></div>
                  <h3>{orders.length}</h3><p>Active Orders</p>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-icon user"><Users color="#8b5cf6"/></div></div>
                  <h3>124</h3><p>Total Customers</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="admin-section fade-in">
              <div className="section-header">
                <h2>Order Management</h2>
                <button className="btn-outline-danger" onClick={clearAllOrders}><Trash2 size={16}/> Clear History</button>
              </div>
              <div className="content-card">
                <table className="admin-table">
                  <thead><tr><th>Customer</th><th>Item</th><th>Status</th><th>Notify</th><th>Action</th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.customer}</strong><br/><small>{o.phone}</small></td>
                        <td>{o.item}</td>
                        <td>
                          <select className={`status-pill ${o.status.toLowerCase().replace(' ', '-')}`} value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                            <option value="Pending">Pending</option>
                            <option value="Crafting">Crafting</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                        <td><button onClick={() => handleNotify(o)} className="btn-whatsapp"><Send size={16}/></button></td>
                        <td><button className="btn-icon-delete" onClick={() => deleteOrder(o.id)}><Trash2 size={18}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="admin-section fade-in">
              <div className="section-header">
                <h2>Material Stock</h2>
                <button className="btn-primary" onClick={() => setIsInventoryModalOpen(true)}><Plus size={18}/> Add Material</button>
              </div>
              <div className="content-card">
                <table className="admin-table">
                  <thead><tr><th>Material</th><th>Stock</th><th>Availability</th><th>Actions</th></tr></thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.stock} {item.unit}</td>
                        <td>
                          <button onClick={() => toggleStock(item.id)} className={`stock-toggle ${item.inStock ? 'is-in' : 'is-out'}`}>
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>
                        <td><button className="btn-icon-delete" onClick={() => deleteInventory(item.id)}><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bouquets' && (
            <div className="admin-section fade-in">
              <div className="section-header">
                <h2>Bouquets Catalog</h2>
                <button className="btn-primary" onClick={() => setIsProductModalOpen(true)}><Plus size={18}/> Add Bouquet</button>
              </div>
              <div className="content-card">
                <table className="admin-table">
                  <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Actions</th></tr></thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td><img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                        <td><strong>{p.name}</strong><br/><small>{p.color}</small></td>
                        <td>{p.category}</td>
                        <td>{String(p.price).includes('₹') ? p.price : `₹${Number(p.price).toLocaleString('en-IN')}`}</td>
                        <td><button className="btn-icon-delete" onClick={() => deleteProductObj(p.id)}><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'promos' && (
            <div className="admin-section fade-in">
              <div className="section-header"><h2>Promo Codes</h2></div>
              <div className="promo-grid">
                {promoCodes.map((p, i) => (
                  <div className="promo-card" key={i}>
                    <div className="promo-card-header"><Tag size={20} color="#b3002d"/><Trash2 size={18} className="btn-icon-delete pointer" onClick={() => deletePromo(p.code)}/></div>
                    <h3>{p.code}</h3>
                    <div className="promo-meta"><span>{p.discount} Off</span> <span>{p.usage} Uses</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {isInventoryModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-panel">
            <div className="modal-header"><h3>New Material</h3><button onClick={() => setIsInventoryModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleAddMaterial}>
              <div className="form-group"><label>Name</label><input type="text" required onChange={(e) => setNewItem({...newItem, name: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Qty</label><input type="number" required onChange={(e) => setNewItem({...newItem, stock: e.target.value})} /></div>
                <div className="form-group"><label>Unit</label><select onChange={(e) => setNewItem({...newItem, unit: e.target.value})}><option>Rolls</option><option>Units</option></select></div>
              </div>
              <button type="submit" className="btn-primary w-100">Save Material</button>
            </form>
          </div>
        </div>
      )}

      {isProductModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-panel">
            <div className="modal-header"><h3>New Bouquet</h3><button onClick={() => setIsProductModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group"><label>Name</label><input type="text" required onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Price (₹)</label><input type="number" required onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} /></div>
                <div className="form-group"><label>Category</label>
                  <select onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                    <option>Signature Roses</option>
                    <option>Luxury Boxes</option>
                    <option>Custom Ribbon</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Color</label><input type="text" required onChange={(e) => setNewProduct({...newProduct, color: e.target.value})} /></div>
                <div className="form-group"><label>Image URL</label><input type="text" required placeholder="/images/ig/7.png" onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Description</label><input type="text" required onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} /></div>
              <button type="submit" className="btn-primary w-100">Save Bouquet</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;