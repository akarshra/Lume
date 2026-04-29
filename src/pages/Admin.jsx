import { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, Database, Tag, TrendingUp, Users, Mail,
  ChevronDown, MapPin, ExternalLink, Package, Palette, CheckCircle,
  Plus, Trash2, Send, Lock, Download, Search, X, AlertTriangle, ArrowUpRight, Gift, Sparkles
} from 'lucide-react';
import { 
  getOrders, deleteOrder as deleteOrderApi, clearAllOrders as clearAllOrdersApi, addOrder,
  getInventory, addInventory as addInventoryApi, updateInventoryStatus, deleteInventoryItem,
  getPromos, addPromo as addPromoApi, deletePromoApi,
  getProducts, addProduct, deleteProduct
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Line, BarChart, Bar } from 'recharts';
const ADMIN_EMAIL = 'akarshsrivastava322@gmail.com';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
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
  const [isIgModalOpen, setIsIgModalOpen] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', discount: '', usage: '' });
  const [newIgOrder, setNewIgOrder] = useState({ customer: '', handle: '', phone: '', address: '', item: '', amount: '', paymentMethod: 'UPI' });
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [toast, setToast] = useState(null);
  
  // AI Marketing State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiCampaignResult, setAiCampaignResult] = useState(null);

  const showToast = (msg, type) => { const t = type || 'success'; setToast({ msg, t }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchInventory();
      fetchPromos();
      fetchProducts();
      supabase.from('contacts').select('*').order('created_at',{ascending:false}).then(({data})=>setContacts(data||[]));
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

  const handleEmailNotify = async (order) => {
    if (!order.email) {
      showToast('No email for this customer.', 'error');
      return;
    }
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.email,
          subject: `Lumé Artisans - Order Update Notification`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
               <h2 style="color: #9b1b30;">Hello ${order.customer},</h2>
               <p>We are reaching out with an update regarding your recent order.</p>
               <div style="padding: 16px; background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                 <p style="margin: 0; font-size: 1.2rem;"><strong>Order Status: <span style="color: #3b82f6;">${order.status}</span></strong></p>
                 <p style="margin: 8px 0 0; color: #64748b;">Item: ${order.item}</p>
                 <p style="margin: 8px 0 0; color: #64748b;">Order ID: ${order.id}</p>
               </div>
               <p>Thank you for shopping with Lumé. We appreciate your patience!</p>
               <br/>
               <p>Best,<br/><strong>The Lumé Artisans</strong></p>
            </div>
          `
        })
      });
      if (!response.ok) {
        const errResp = await response.json();
        throw new Error(errResp.error?.message || "Failed to send email via server.");
      }
      showToast('Email sent to ' + order.email, 'success');
    } catch (error) {
      console.error(error);
      alert("Resend API Error:\n\n" + error.message);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await deleteOrderApi(id);
      setOrders(orders.filter(o => o.id !== id));
    } catch (error) {
      console.error("Error deleting order", error);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Delete this inquiry permanently?")) return;
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      setContacts(contacts.filter(c => c.id !== id));
      triggerToast('Inquiry deleted successfully', 'success');
    } catch {
      triggerToast('Failed to delete inquiry', 'error');
    }
  };

  const handleMarkInquiryRead = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Read' ? 'Unread' : 'Read';
      const { error } = await supabase.from('contacts').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setContacts(contacts.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (e) {
      console.error(e);
      triggerToast('Could not update status.', 'error');
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

  const handleStatusChange = async (id, newStatus, order) => {
    try {
      // Optimistic UI update
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      
      // Send secure backend request to update DB AND send email
      const response = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, order })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sync status");
      }
    } catch (error) {
      console.error("Error updating status", error);
      showToast('Status update failed. Check backend.', 'error');
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

  const handleAddIgOrder = async (e) => {
    e.preventDefault();
    const orderObj = {
      id: "IG-" + Date.now().toString().slice(-6),
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
      customer: `${newIgOrder.customer} (${newIgOrder.handle})`,
      email: "Instagram DM",
      phone: newIgOrder.phone,
      address: newIgOrder.address,
      paymentMethod: newIgOrder.paymentMethod,
      item: newIgOrder.item,
      amount: newIgOrder.amount,
      status: "Pending",
      type: "Instagram Manual",
      platform: "instagram"
    };
    try {
      await addOrder(orderObj);
      setOrders([orderObj, ...orders]);
      setIsIgModalOpen(false);
      setNewIgOrder({ customer: '', handle: '', phone: '', address: '', item: '', amount: '', paymentMethod: 'UPI' });
      triggerToast('Instagram order logged successfully', 'success');
    } catch {
      triggerToast('Failed to log Instagram order', 'error');
    }
  };

  const handleGenerateCampaign = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiCampaignResult(null);
    try {
      const res = await fetch('/api/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      setAiCampaignResult(data);
    } catch {
      showToast("Generation failed", "error");
    }
    setAiGenerating(false);
  };

  const handleLaunchCampaign = async () => {
     try {
       // Add promo code
       await addPromoApi({ code: aiCampaignResult.promoCode, discount: aiCampaignResult.discount + '%', usage: 100 });
       // We log the mock email sending instead of blasting users since we restricted it
       console.log("Mocking email blast with Resend to users for safety. Subject: ", aiCampaignResult.subject);
       showToast("Campaign Launched! Promo created.", "success");
       setAiCampaignResult(null);
       setAiPrompt("");
       fetchPromos();
     } catch {
       showToast("Failed to launch", "error");
     }
  };


  const exportOrdersCSV = () => {
    const headers = ["ID","Customer","Email","Phone","Item","Amount","Status","Date","Payment","Address"];
    const rows = orders.map(o => [o.id,o.customer,o.email,o.phone,o.item,o.amount,o.status,o.date,o.paymentMethod,o.address].map(v=>String(v||'').replace(/,/g,';')));
    const csv = [headers,...rows].map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url;a.download='lume-orders.csv';a.click();
    URL.revokeObjectURL(url);
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
        <div className="login-card glass-panel" style={{textAlign:'center',padding:'3rem'}}>
          <Lock size={52} style={{margin:'0 auto 1.5rem',display:'block',color:'var(--accent-gold)'}} />
          <h2 style={{marginBottom:'12px'}}>Admin Access Required</h2>
          <p style={{color:'var(--text-muted)',marginBottom:'2rem',lineHeight:'1.6'}}>This area is restricted to the store owner only. Please sign in with your admin account.</p>
          <a href="/account" className="btn-primary" style={{display:'inline-flex',textDecoration:'none'}}>Sign In to Continue</a>
        </div>
      </div>
    );
  }

  if (user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'20px',background:'var(--surface-color)',padding:'80px 24px',textAlign:'center'}}>
        <div style={{width:'80px',height:'80px',background:'#fef2f2',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}><Lock size={36} color="#ef4444" /></div>
        <h2 style={{color:'var(--text-main)'}}>Access Denied</h2>
        <p style={{color:'var(--text-muted)',maxWidth:'380px',lineHeight:'1.7'}}>You are signed in as <strong>{user.email}</strong>. This panel is for the store owner only.</p>
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center'}}><a href="/" className="btn-primary">Go Home</a><a href="/account" className="btn-secondary">Sign Out</a></div>
      </div>
    );
  }

  // --- Phase 3: Shipping Mock ---
  const handleGenerateShippingLabel = async (order) => {
    alert(`Generating Shiprocket Tracking ID for Order #${order.id.slice(-6)}...\nMock Success! Label generated. Your business account has been billed ₹80.`);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/favicon.png" alt="L" />
          <span>LUMÉ ADMIN</span>
        </div>
        <nav className="sidebar-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}><LayoutDashboard size={20}/> Overview</button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}><ShoppingBag size={20}/> Standard Orders</button>
          <button className={activeTab === 'custom-orders' ? 'active' : ''} onClick={() => setActiveTab('custom-orders')}><Palette size={20}/> Custom Orders</button>
          <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Database size={20}/> Inventory</div>
            {lowStockItems.length > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>{lowStockItems.length}</span>}
          </button>
          <button className={activeTab === 'bouquets' ? 'active' : ''} onClick={() => setActiveTab('bouquets')}><Gift size={20}/> Bouquets</button>
          <button className={activeTab === 'promos' ? 'active' : ''} onClick={() => setActiveTab('promos')}><Tag size={20}/> Manual Promos</button>
          <button className={activeTab === 'ai-marketing' ? 'active' : ''} onClick={() => setActiveTab('ai-marketing')}><Sparkles size={20}/> AI Marketing</button>
          <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}><Users size={20}/> Customers</button>
          <button className={activeTab === 'inquiries' ? 'active' : ''} onClick={() => setActiveTab('inquiries')}><Mail size={20}/> Inquiries</button>
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
                <div style={{display:'flex', gap:'8px'}}>
                  <button className="btn-primary" onClick={() => setIsIgModalOpen(true)}><Plus size={16}/> Record IG Order</button>
                  <button className="btn-outline-danger" onClick={clearAllOrders}><Trash2 size={16}/> Clear History</button>
                  <button className="btn-secondary" onClick={exportOrdersCSV} style={{display:"flex",alignItems:"center",gap:"6px"}}><Download size={16}/> Export CSV</button>
                </div>
              </div>
              <div className="content-card">
                <table className="admin-table">
                  <thead><tr><th>Customer & Connect</th><th>Item</th><th>Status</th><th>Notify</th><th>Action</th></tr></thead>
                  <tbody>
                    { orders.filter(o => !searchQuery || (o.customer && o.customer.toLowerCase().includes(searchQuery.toLowerCase())) || (o.item && o.item.toLowerCase().includes(searchQuery.toLowerCase())) || (o.id && o.id.includes(searchQuery))).map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong>{o.customer}</strong><br/>
                          <small style={{ color: '#64748b' }}>{o.email || "No Email"}</small><br/>
                          <small>{o.phone}</small><br/>
                          <div style={{ marginTop: '6px' }}>
                            <a href={`/track?id=${o.id}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#3b82f6', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span>🔍 #{o.id ? o.id.toString().slice(-6) : 'N/A'}</span>
                            </a>
                          </div>
                        </td>
                        <td>{o.item}</td>
                        <td>
                          <select className={`status-pill ${o.status.toLowerCase().replace(' ', '-')}`} value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value, o)}>
                            <option value="Pending">Pending</option>
                            <option value="Crafting">Crafting</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          {o.status === "In Transit" && (
                            <button onClick={() => handleGenerateShippingLabel(o)} style={{ marginTop: '8px', fontSize: '0.7rem', padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Package size={12}/> Generate Label
                            </button>
                          )}
                        </td>
                        <td>
                           <div style={{ display: 'flex', gap: '8px' }}>
                             <button onClick={() => handleEmailNotify(o)} className="btn-primary" style={{ padding: '6px', borderRadius: '6px', background: '#3b82f6', border: 'none' }} title="Send Email Update Notification"><Send size={16}/></button>
                           </div>
                        </td>
                        <td><button className="btn-icon-delete" onClick={() => deleteOrder(o.id)}><Trash2 size={18}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'custom-orders' && (
            <div className="admin-section fade-in">
              <div className="section-header">
                <h2>Custom Bouquet Orders</h2>
                <span style={{background:'#eff6ff',color:'#1d4ed8',padding:'4px 14px',borderRadius:'20px',fontSize:'0.85rem',fontWeight:'600'}}>{orders.filter(o => o.item?.includes('Custom:') || o.type?.includes('Custom')).length} custom requests</span>
              </div>
              <div className="content-card">
                <table className="admin-table">
                  <thead><tr><th>Customer Info & Address</th><th>Requirements</th><th>Status</th><th>Notify</th><th>Action</th></tr></thead>
                  <tbody>
                    { orders.filter(o => o.item?.includes('Custom:') || o.type?.includes('Custom')).map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong>{o.customer}</strong><br/>
                          <small style={{ color: '#64748b' }}>{o.email || "No Email"}</small><br/>
                          <small>{o.phone}</small><br/>
                          {o.address && <div style={{marginTop: '4px', fontSize: '0.8rem', background: '#f8fafc', padding: '6px', borderRadius: '4px', border: '1px solid #e2e8f0'}}><MapPin size={12} style={{marginRight: '2px', verticalAlign: 'middle'}}/>{o.address}</div>}
                        </td>
                        <td>{o.item}</td>
                        <td>
                          <select className={`status-pill ${o.status.toLowerCase().replace(' ', '-')}`} value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value, o)}>
                            <option value="Paid">Deposit Paid</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Crafting">Crafting</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          {o.status === "In Transit" && (
                            <button onClick={() => handleGenerateShippingLabel(o)} style={{ marginTop: '8px', fontSize: '0.7rem', padding: '4px 8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Package size={12}/> Generate Label
                            </button>
                          )}
                        </td>
                        <td>
                           <button onClick={() => handleEmailNotify(o)} className="btn-primary" style={{ padding: '6px', borderRadius: '6px', background: '#3b82f6', border: 'none' }} title="Send Email Update Notification"><Send size={16}/></button>
                        </td>
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

          {activeTab === 'ai-marketing' && (
            <div className="admin-section fade-in">
              <div className="section-header">
                <h2>AI Promotional Campaign Generator</h2>
              </div>
              <div className="content-card" style={{ marginBottom: '24px' }}>
                 <p style={{marginBottom: '16px', color: 'var(--text-muted)'}}>Instantly generate email copy, subject lines, and a custom promo code by providing a simple theme or topic.</p>
                 <div style={{display: 'flex', gap: '12px'}}>
                   <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g. Spring pastel sale for Mother's Day..." style={{flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}} />
                   <button className="btn-primary" onClick={handleGenerateCampaign} disabled={aiGenerating}>
                     {aiGenerating ? "Generating..." : <><Sparkles size={18}/> Generate Campaign</>}
                   </button>
                 </div>
              </div>

              {aiCampaignResult && (
                <div className="content-card fade-in" style={{background: '#f8fafc', borderLeft: '4px solid var(--primary)'}}>
                   <h3 style={{marginBottom: '16px'}}>Campaign Preview</h3>
                   <div style={{marginBottom: '12px'}}><strong>Subject:</strong> {aiCampaignResult.subject}</div>
                   <div style={{marginBottom: '12px'}}><strong>Promo Code Generated:</strong> <span className="status-pill crafting">{aiCampaignResult.promoCode}</span> ({aiCampaignResult.discount}% Off)</div>
                   <div style={{marginBottom: '24px', padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #eee'}} dangerouslySetInnerHTML={{__html: aiCampaignResult.bodyHTML}}></div>
                   
                   <p style={{fontSize: '0.8rem', color: '#666', marginBottom: '16px'}}>* Clicking Launch will create the promo code instantly and simulate sending emails to your customers.</p>
                   <button className="btn-primary" onClick={handleLaunchCampaign} style={{width: '100%'}}>Launch Campaign</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customers' && (() => {
  const gi=(s)=>{const t=(s||'').toLowerCase();return t.includes('delivered')?3:t.includes('transit')?2:t.includes('crafting')?1:0;};
  const S=['Confirmed','Crafting','In Transit','Delivered'];
  const cl=Object.values(orders.reduce((a,o)=>{const k=o.email||o.customer||'?';if(!a[k])a[k]={name:o.customer,email:o.email,phone:o.phone,n:0,t:0,os:[]};a[k].n++;a[k].t+=Number(o.amount)||0;a[k].os.push(o);return a;},{})).sort((a,b)=>b.t-a.t);
  return (
    <div className="admin-section fade-in">
      <div className="section-header">
        <div><h2>Customers & Order Tracking</h2><small style={{color:'var(--text-muted)',fontWeight:'400'}}>Click a customer to track all their orders live</small></div>
        <span style={{background:'#eff6ff',color:'#1d4ed8',padding:'4px 14px',borderRadius:'20px',fontSize:'0.85rem',fontWeight:'600'}}>{cl.length} customers</span>
      </div>
      {cl.length===0&&<div className="content-card" style={{padding:'48px',textAlign:'center',color:'var(--text-muted)'}}>No customers yet.</div>}
      {cl.map((cust,ci)=>(
        <div key={ci} className="customer-track-card">
          <div className="cust-card-header" onClick={()=>setExpandedCustomer(expandedCustomer===(cust.email||cust.name)?null:(cust.email||cust.name))}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <div className="cust-avatar">{(cust.name||'?')[0].toUpperCase()}</div>
              <div><strong style={{display:'block',fontSize:'1rem'}}>{cust.name||cust.email}</strong><small style={{color:'var(--text-muted)'}}>{cust.email||'No email'}{cust.phone?' • '+cust.phone:''}</small></div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
              <span className="status-pill crafting">{cust.n} order{cust.n!==1?'s':''}</span>
              <strong style={{color:'#10b981'}}>₹{cust.t.toLocaleString('en-IN')}</strong>
              <ChevronDown size={18} style={{color:'var(--text-muted)',transition:'0.2s',transform:expandedCustomer===(cust.email||cust.name)?'rotate(180deg)':'none'}}/>
            </div>
          </div>
          {expandedCustomer===(cust.email||cust.name)&&(
            <div className="cust-orders-expanded">
              <p className="expanded-hint"><ExternalLink size={12}/> {cust.n} order{cust.n!==1?'s':''} found — click "Full Track" to open the live map tracker</p>
              {cust.os.map((o,j)=>(
                <div key={j} className="ord-track-item">
                  <div className="ord-track-meta">
                    <div style={{flex:1}}>
                      <strong style={{fontSize:'0.95rem'}}>{o.item}</strong>
                      <p style={{margin:'3px 0 2px',fontSize:'0.78rem',color:'var(--text-muted)'}}>ID: #{o.id?o.id.slice(-8).toUpperCase():'N/A'} &bull; {o.date} &bull; ₹{Number(o.amount||0).toLocaleString('en-IN')}</p>
                      {o.address&&<p style={{margin:0,fontSize:'0.75rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:'4px'}}><MapPin size={11} color="#C62828"/> {o.address}</p>}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'6px',flexShrink:0}}>
                      <span className={'status-pill '+(o.status||'pending').toLowerCase().replace(' ','-')}>{o.status||'Pending'}</span>
                      <strong style={{color:'var(--primary-dark)',fontSize:'0.9rem'}}>₹{Number(o.amount||0).toLocaleString('en-IN')}</strong>
                      <a href={'/track?id='+o.id} target="_blank" rel="noreferrer" className="track-ext-link" onClick={e=>e.stopPropagation()}><ExternalLink size={12}/> Full Track + Map</a>
                    </div>
                  </div>
                  <div className="mini-track-timeline">
                    {S.map((label,si)=>{const idx=gi(o.status);return(<div key={si} className={'mini-step'+(si<idx?' done':'')+(si===idx?' active':'')}><div className="mini-dot">{si<idx?'✓':si+1}</div>{si<3&&<div className="mini-connector"/>}<span className="mini-label">{label}</span></div>);})}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
})()}


          {activeTab === 'inquiries' && (() => {
            const weddingInquiries = contacts.filter(c => c.message && c.message.startsWith('Wedding/Bulk Inquiry'));
            const directInquiries = contacts.filter(c => !(c.message && c.message.startsWith('Wedding/Bulk Inquiry')));
            
            return (
              <div className="admin-section fade-in">
                <div className="section-header"><h2>Wedding Inquiries</h2><span style={{background:'#eff6ff',color:'#1d4ed8',padding:'4px 14px',borderRadius:'20px',fontSize:'0.85rem',fontWeight:'600'}}>{weddingInquiries.length} inquiries</span></div>
                {weddingInquiries.length===0?(<div className="content-card" style={{padding:'48px',textAlign:'center',color:'var(--text-muted)',marginBottom: '40px'}}>No wedding inquiries yet.</div>):(
                  <div className="content-card" style={{marginBottom: '40px'}}>
                    <table className="admin-table">
                      <thead><tr><th>Name</th><th>Email / Phone</th><th>Details</th><th>Date</th><th>Action</th></tr></thead>
                      <tbody>{weddingInquiries.map((ct,i)=>(<tr key={'wed-' + (ct.id || i)} style={{ opacity: ct.status === 'Read' ? 0.6 : 1 }}><td><strong>{ct.name}</strong></td><td>{ct.email||'-'}<br/><small>{ct.phone}</small></td><td style={{maxWidth:'320px',fontSize:'0.82rem',color:'var(--text-muted)'}}>{ct.message.replace('Wedding/Bulk Inquiry | ', '')}</td><td style={{fontSize:'0.8rem',whiteSpace:'nowrap'}}>{ct.created_at?new Date(ct.created_at).toLocaleDateString('en-IN'):'-'}</td>
                        <td><div style={{display:'flex', gap:'6px'}}><button onClick={() => handleMarkInquiryRead(ct.id, ct.status)} title="Mark as Read/Unread" className="btn-secondary" style={{padding:'4px 8px'}}><CheckCircle size={14}/></button> <button onClick={() => handleDeleteInquiry(ct.id)} title="Delete Inquiry" className="btn-icon-delete"><Trash2 size={14}/></button></div></td>
                      </tr>))}</tbody>
                    </table>
                  </div>
                )}

                <div className="section-header"><h2>Direct Inquiries</h2><span style={{background:'#eff6ff',color:'#1d4ed8',padding:'4px 14px',borderRadius:'20px',fontSize:'0.85rem',fontWeight:'600'}}>{directInquiries.length} inquiries</span></div>
                {directInquiries.length===0?(<div className="content-card" style={{padding:'48px',textAlign:'center',color:'var(--text-muted)'}}>No direct inquiries yet.</div>):(
                  <div className="content-card">
                    <table className="admin-table">
                      <thead><tr><th>Name</th><th>Email / Phone</th><th>Message</th><th>Date</th><th>Action</th></tr></thead>
                      <tbody>{directInquiries.map((ct,i)=>(<tr key={'dir-' + (ct.id || i)} style={{ opacity: ct.status === 'Read' ? 0.6 : 1 }}><td><strong>{ct.name}</strong></td><td>{ct.email||'-'}<br/><small>{ct.phone}</small></td><td style={{maxWidth:'320px',fontSize:'0.82rem',color:'var(--text-muted)'}}>{ct.message}</td><td style={{fontSize:'0.8rem',whiteSpace:'nowrap'}}>{ct.created_at?new Date(ct.created_at).toLocaleDateString('en-IN'):'-'}</td>
                        <td><div style={{display:'flex', gap:'6px'}}><button onClick={() => handleMarkInquiryRead(ct.id, ct.status)} title="Mark as Read/Unread" className="btn-secondary" style={{padding:'4px 8px'}}><CheckCircle size={14}/></button> <button onClick={() => handleDeleteInquiry(ct.id)} title="Delete Inquiry" className="btn-icon-delete"><Trash2 size={14}/></button></div></td>
                      </tr>))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      {toast && (
        <div className="admin-toast" data-type={toast.t}>
          <span>{toast.t === 'success' ? '✅' : '⚠️'}</span>
          <span style={{flex:1}}>{toast.msg}</span>
          <button onClick={()=>setToast(null)} style={{background:'none',border:'none',color:'white',cursor:'pointer',fontSize:'1.2rem',lineHeight:1,padding:'0 4px'}}>x</button>
        </div>
      )}
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

      {isIgModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-panel">
            <div className="modal-header"><h3>Record Instagram Order</h3><button onClick={() => setIsIgModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleAddIgOrder}>
              <div className="form-row">
                <div className="form-group"><label>Customer Name</label><input type="text" required value={newIgOrder.customer} onChange={(e) => setNewIgOrder({...newIgOrder, customer: e.target.value})} /></div>
                <div className="form-group"><label>IG Handle</label><input type="text" required placeholder="@username" value={newIgOrder.handle} onChange={(e) => setNewIgOrder({...newIgOrder, handle: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Phone Number</label><input type="text" required value={newIgOrder.phone} onChange={(e) => setNewIgOrder({...newIgOrder, phone: e.target.value})} /></div>
              <div className="form-group"><label>Full Delivery Address</label><textarea required rows="2" value={newIgOrder.address} onChange={(e) => setNewIgOrder({...newIgOrder, address: e.target.value})} ></textarea></div>
              <div className="form-row">
                <div className="form-group"><label>Exact Item Details</label><input type="text" required placeholder="1x Crimson Delight..." value={newIgOrder.item} onChange={(e) => setNewIgOrder({...newIgOrder, item: e.target.value})} /></div>
                <div className="form-group"><label>Total Amount (₹)</label><input type="number" required value={newIgOrder.amount} onChange={(e) => setNewIgOrder({...newIgOrder, amount: e.target.value})} /></div>
              </div>
              <div className="form-group">
                <label>Payment Method Used</label>
                <select value={newIgOrder.paymentMethod} onChange={(e) => setNewIgOrder({...newIgOrder, paymentMethod: e.target.value})}>
                  <option>UPI</option>
                  <option>Cash On Delivery</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-100">Save Manual Order</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;