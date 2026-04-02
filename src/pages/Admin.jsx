import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Database, Tag, TrendingUp, Users, 
  Plus, Trash2, Send, Lock, Download, Search, X, AlertTriangle, ArrowUpRight, Gift 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  getOrders, updateOrderStatus, deleteOrder as deleteOrderApi, clearAllOrders as clearAllOrdersApi,
  getInventory, addInventory as addInventoryApi, updateInventoryStatus, deleteInventoryItem,
  getPromos, addPromo as addPromoApi, deletePromoApi,
  getProducts, addProduct, deleteProduct
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const ADMIN_EMAIL = 'akarshraj2710@gmail.com';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user !== undefined && (!user || user.email !== ADMIN_EMAIL)) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState('overview');
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  // --- STATE MANAGEMENT ---
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [newItem, setNewItem] = useState({ name: '', stock: '', unit: 'Rolls' });
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Signature Roses', price: '', description: '', image: '', color: '', igId: '' });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', discount: '', usage: '0' });
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchInventory();
      fetchPromos();
      fetchProducts();
    }
  }, [user]);

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

  const handleNotify = (order) => {
    const msg = `Hello ${order.customer}! Artisan Update: Your Lumé bouquet status is now *${order.status}*. 🌹`;
    const phoneNum = order.phone ? order.phone.replace(/\D/g, '') : '';
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

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

  const handleAddPromo = async (e) => {
    e.preventDefault();
    try {
      const added = await addPromoApi({ code: newPromo.code.toUpperCase(), discount: newPromo.discount, usage: parseInt(newPromo.usage) || 0 });
      setPromoCodes([...promoCodes, added]);
      setNewPromo({ code: '', discount: '', usage: '0' });
      setIsPromoModalOpen(false);
    } catch (error) { console.error('Error adding promo', error); }
  };

  const deletePromo = async (code) => {
    try {
      await deletePromoApi(code);
      setPromoCodes(promoCodes.filter(p => p.code !== code));
    } catch (error) {
      console.error("Error deleting promo", error);
    }
  };

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

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      setNewProduct({...newProduct, image: publicUrlData.publicUrl});
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const processRevenueData = (allOrders) => {
    const grouped = {};
    allOrders.forEach(o => {
      let dateKey = 'Unknown';
      if (o.created_at) {
        dateKey = new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      } else if (o.date) {
        dateKey = String(o.date).split(',')[0].trim();
      }
      if (!grouped[dateKey]) grouped[dateKey] = 0;
      
      let amount = 0;
      if (typeof o.amount === 'string') {
        const parsed = Number(o.amount.replace(/[^0-9.-]+/g, ''));
        amount = isNaN(parsed) ? 0 : parsed;
      } else {
        amount = Number(o.amount) || 0;
      }
      grouped[dateKey] += amount;
    });

    return Object.entries(grouped).map(([date, revenue]) => ({
      name: date,
      revenue
    })).slice(-7).reverse(); // Last 7 days
  };

  const revenueData = processRevenueData(orders);

  const statusData = [
    { name: 'Pending', count: orders.filter(o => o.status === 'Pending').length },
    { name: 'Crafting', count: orders.filter(o => o.status === 'Crafting').length },
    { name: 'In Transit', count: orders.filter(o => o.status === 'In Transit').length },
    { name: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
  ];

  const lowStockItems = inventory.filter(i => !i.inStock || Number(i.stock) < 5);

  if (!user) {
    return (
      <div className="admin-login-screen">
        <div className="login-card glass-panel" style={{textAlign: 'center', padding: '3rem'}}>
          <Lock size={48} className="lock-icon" style={{margin: '0 auto 1rem'}} />
          <h2>Admin Restricted</h2>
          <p style={{marginBottom: '2rem'}}>Please log in from the Account page to access the admin dashboard.</p>
          <a href="/account" className="btn-primary" style={{display: 'inline-block', textDecoration: 'none'}}>Go to Login</a>
        </div>
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Lock size={48} color="#9b1b30" />
        <h2 style={{ color: '#9b1b30' }}>Access Restricted</h2>
        <p style={{ color: '#64748b' }}>You do not have permission to view this page.</p>
        <a href="/" className="btn-secondary">Go Home</a>
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
          <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Database size={20}/> Inventory</div>
            {lowStockItems.length > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>{lowStockItems.length}</span>}
          </button>
          <button className={activeTab === 'bouquets' ? 'active' : ''} onClick={() => setActiveTab('bouquets')}><Gift size={20}/> Bouquets</button>
          <button className={activeTab === 'promos' ? 'active' : ''} onClick={() => setActiveTab('promos')}><Tag size={20}/> Marketing</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="main-header">
          <div className="search-bar"><Search size={18} /><input type="text" placeholder="Search orders, products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
          <div className="admin-avatar">A</div>
        </header>

        <div className="admin-scroll-content">
          {activeTab === 'overview' && (
            <div className="admin-section fade-in">
              {lowStockItems.length > 0 && (
                <div className="alert-banner" style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertTriangle size={24} color="#ef4444" />
                  <div>
                    <strong>Inventory Alert:</strong> {lowStockItems.length} {lowStockItems.length === 1 ? 'item requires' : 'items require'} your attention.
                    <button onClick={() => setActiveTab('inventory')} style={{ background: 'none', border: 'none', color: '#ef4444', textDecoration: 'underline', cursor: 'pointer', marginLeft: '8px', fontWeight: 'bold' }}>View Inventory</button>
                  </div>
                </div>
              )}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-icon rev"><TrendingUp color="#10b981"/></div></div>
                  <h3>₹{orders.reduce((acc, o) => acc + (Number(o.amount) || 0), 0).toLocaleString('en-IN')}</h3><p>Total Revenue</p>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-icon orders"><ShoppingBag color="#3b82f6"/></div></div>
                  <h3>{orders.length}</h3><p>Active Orders</p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                <div className="content-card">
                  <h3 style={{ marginBottom: '1rem' }}>Revenue Over Time</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e1e24', border: 'none', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="revenue" stroke="#ff4757" strokeWidth={3} dot={{ fill: '#ff4757', r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="content-card">
                  <h3 style={{ marginBottom: '1rem' }}>Orders By Status</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e1e24', border: 'none', borderRadius: '8px' }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
                    { orders.filter(o => !searchQuery || (o.customer && o.customer.toLowerCase().includes(searchQuery.toLowerCase())) || (o.item && o.item.toLowerCase().includes(searchQuery.toLowerCase())) || (o.id && o.id.includes(searchQuery))).map(o => (
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
                      <tr key={item.id} style={{ background: (!item.inStock || Number(item.stock) < 5) ? '#fff5f5' : 'transparent' }}>
                        <td>
                          <strong>{item.name}</strong>
                          {(!item.inStock || Number(item.stock) < 5) && <AlertTriangle size={14} color="#ef4444" style={{ marginLeft: '8px', verticalAlign: 'middle' }} title="Low stock or Out of stock" />}
                        </td>
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
                    { products.filter(p => !searchQuery || (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) || (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))).map(p => (
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
              <div className="section-header"><h2>Promo Codes</h2><button className="btn-primary" onClick={() => setIsPromoModalOpen(true)}><Plus size={18}/> Add Promo</button></div>
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

      {isPromoModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-panel">
            <div className="modal-header"><h3>New Promo Code</h3><button onClick={() => setIsPromoModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleAddPromo}>
              <div className="form-group"><label>Code</label><input type="text" required placeholder="e.g. LUME20" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value})} /></div>
              <div className="form-group"><label>Discount</label><input type="text" required placeholder="e.g. 20% or ₹200" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: e.target.value})} /></div>
              <div className="form-group"><label>Max Uses</label><input type="number" placeholder="0 = unlimited" value={newPromo.usage} onChange={e => setNewPromo({...newPromo, usage: e.target.value})} /></div>
              <button type="submit" className="btn-primary w-100">Save Promo Code</button>
            </form>
          </div>
        </div>
      )}

      {isInventoryModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-panel">
            <div className="modal-header"><h3>New Material</h3><button onClick={() => setIsInventoryModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleAddMaterial}>
              <div className="form-group"><label>Name</label><input type="text" required value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Qty</label><input type="number" required value={newItem.stock} onChange={(e) => setNewItem({...newItem, stock: e.target.value})} /></div>
                <div className="form-group">
                  <label>Unit</label>
                  <select value={newItem.unit} onChange={(e) => setNewItem({...newItem, unit: e.target.value})}>
                    <option>Rolls</option>
                    <option>Units</option>
                  </select>
                </div>
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
              <div className="form-group"><label>Name</label><input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Price (₹)</label><input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} /></div>
                <div className="form-group"><label>Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}>
                    <option>Signature Roses</option>
                    <option>Luxury Boxes</option>
                    <option>Custom Ribbon</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Color Scheme Hex</label><input type="text" required placeholder="var(--primary)" value={newProduct.color} onChange={(e) => setNewProduct({...newProduct, color: e.target.value})} /></div>
                <div className="form-group">
                  <label>Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                  {uploading && <small>Uploading...</small>}
                </div>
              </div>
              {newProduct.image && <img src={newProduct.image} style={{width: '60px', height: '60px', borderRadius: '8px', marginBottom: '1rem', objectFit: 'cover'}} alt="preview" />}
              <div className="form-group"><label>Description</label><input type="text" required value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} /></div>
              <button type="submit" className="btn-primary w-100" disabled={uploading}>Save Bouquet</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;