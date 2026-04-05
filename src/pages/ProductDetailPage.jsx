import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Heart, Star, Share2, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getProducts, getWishlist, toggleWishlist, getComplementaryItems } from "../services/api";
import ReviewSection from "../components/ReviewSection";
import { Helmet } from "react-helmet-async";
import "./ProductDetailPage.css";
const MANUAL=[{id:'1',name:"Midnight Sparkle Rose",category:"Anniversary",price:"₹1,599",description:"Elegant dark tones intertwined with sparkly ribbons for a magical evening.",image:"/images/ig/1.webp",color:"Dark Red"},{id:'2',name:"Crimson Delight",category:"Romantic",price:"₹1,199",description:"Vibrant crimson ribbons carefully arranged to express deep affection.",image:"/images/ig/2.webp",color:"Red"},{id:'3',name:"Classic Anniversary Rose",category:"Anniversary",price:"₹1,299",description:"Deep red and blush pink ribbons woven into 24 premium blooming roses.",image:"/images/ig/3.webp",color:"Red & Pink"},{id:'4',name:"Golden Proposal",category:"Proposal",price:"₹2,499",description:"Luxurious soft gold and cream ribbon roses in our signature premium box.",image:"/images/ig/4.webp",color:"Gold"},{id:'5',name:"Lavender Dreams",category:"Birthday",price:"₹999",description:"Sweet lavender and white ribbons for a perfect birthday gift.",image:"/images/ig/5.webp",color:"Lavender"},{id:'6',name:"Soft Blush Elegance",category:"Custom",price:"From ₹1,499",description:"Customized pastel ribbons for weddings and special moments.",image:"/images/ig/6.webp",color:"Blush"},{id:'7',name:"Bridal White Bouquet",category:"Wedding",price:"₹3,499",description:"Pristine white silk ribbons formed into an opulent bridal arrangement.",image:"/images/ig/7.png",color:"White"}];
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [complementary, setComplementary] = useState([]);
  useEffect(() => {
    getProducts().then(prods=>{
      const all=prods&&prods.length>0?prods:MANUAL;
      const found=all.find(p=>String(p.id)===String(id))||MANUAL.find(p=>String(p.id)===String(id));
      setProduct(found||null);setLoading(false);
      if(found) getComplementaryItems(found.name).then(items => setComplementary(items));
    }).catch(()=>{
      const found = MANUAL.find(p=>String(p.id)===String(id));
      setProduct(found||null);setLoading(false);
      if(found) getComplementaryItems(found.name).then(items => setComplementary(items));
    });
    if(user) getWishlist(user.id).then(ids=>setWishlisted(ids.includes(id))).catch(()=>{});
  },[id,user]);
  const handleAddToCart=()=>{
    if(!product)return;addToCart(product);setAdded(true);setTimeout(()=>setAdded(false),2000);
  };
  const handleWishlist=async()=>{
    if(!user){alert("Please sign in to save items.");return;}
    try{const isAdded=await toggleWishlist(id,user.id);setWishlisted(isAdded);}catch(err){console.error(err);}
  };
  const handleShare=()=>{
    if(navigator.share){navigator.share({title:product.name,url:window.location.href}).catch(()=>{});
    }else{navigator.clipboard.writeText(window.location.href);alert("Link copied!");}
  };
  if(loading) return(<div style={{paddingTop:'140px',textAlign:'center'}}><div className="spinner"/></div>);
  if(!product) return(<div style={{paddingTop:'140px',textAlign:'center'}}><h2>Product not found</h2><Link to="/gallery" className="btn-primary">Back to Gallery</Link></div>);
  const priceNum=parseInt(String(product.price).replace(/[^0-9]/g,''),10)||0;
  const gst=Math.round(priceNum*0.18);
  return (
    <div className="product-detail-page page-enter-active">
      <Helmet><title>{product.name} | Lumé</title><meta name="description" content={product.description}/></Helmet>
      <div className="container" style={{paddingTop:'100px'}}>
        <Link to="/gallery" className="back-link animated-link" style={{marginBottom:'32px',display:'inline-flex'}}><ArrowLeft size={18}/> Back to Gallery</Link>
        <div className="product-detail-grid">
          <div className="product-detail-image-wrap">
            <img src={product.image} alt={product.name} className="product-detail-img"/>
            <div className="image-badges">
              <span className="badge-item">✦ Handcrafted</span>
              <span className="badge-item">✦ Everlasting</span>
              <span className="badge-item">✦ Pan-India Delivery</span>
            </div>
          </div>
          <div className="product-detail-info">
            <span className="product-category">{product.category}</span>
            <h1 className="product-detail-title">{product.name}</h1>
            {product.color&&<p className="product-color">Colour: <strong>{product.color}</strong></p>}
            <div className="product-detail-stars">{[...Array(5)].map((_,i)=><Star key={i} size={18} fill="#C62828" color="#C62828"/>)}<span style={{marginLeft:'8px',color:'#666',fontSize:'0.9rem'}}>(Artisan Grade)</span></div>
            <div className="product-detail-price">{String(product.price).includes('₹')?product.price:'₹'+Number(product.price).toLocaleString('en-IN')}</div>
            {priceNum>0&&<p className="price-breakdown">Inclusive of all taxes • Subtotal ₹{Math.round(priceNum/1.18).toLocaleString('en-IN')} + GST ₹{gst.toLocaleString('en-IN')}</p>}
            <p className="product-detail-desc">{product.description}</p>
            <div className="detail-perks">
              {/* eslint-disable-next-line no-unused-vars */}
              {[[CheckCircle,"12+ folds per petal"],[CheckCircle,"Premium satin ribbons"],[CheckCircle,"3-5 day delivery"],[CheckCircle,"Everlasting bloom"]].map(([Icon,txt],i)=>(
                <div key={i} className="perk-item"><Icon size={16} color="#16a34a"/><span>{txt}</span></div>
              ))}
            </div>
            <div className="detail-actions">
              <button className="btn-primary" style={{flex:2,padding:'16px',fontSize:'1rem'}} onClick={handleAddToCart}>
                {added?<><CheckCircle size={18}/> Added!</>:<><ShoppingCart size={18}/> Add to Cart</>}
              </button>
              <button className={"btn-wishlist"+(wishlisted?" active":"")} onClick={handleWishlist} title="Save to Wishlist"><Heart size={20} fill={wishlisted?"#C62828":"transparent"} color={wishlisted?"#C62828":"#666"}/></button>
              <button className="btn-share" onClick={handleShare} title="Share"><Share2 size={20}/></button>
            </div>
            <button className="btn-secondary w-100" style={{marginTop:'12px'}} onClick={()=>navigate('/custom')}>Can’t find what you need? Request Custom Bouquet</button>
          </div>
        </div>
        <ReviewSection productId={id} productName={product.name}/>

        {complementary.length > 0 && (
          <div className="complementary-items" style={{marginTop: '48px', paddingTop: '48px', borderTop: '1px solid #eee'}}>
            <h2 className="title-secondary text-center" style={{marginBottom: '32px'}}>Frequently Bought Together</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px'}}>
              {complementary.map(comp => (
                <div key={comp.id} className="glass-panel" style={{padding: '16px', borderRadius: '12px', cursor: 'pointer'}} onClick={() => navigate(`/product/${comp.id}`)}>
                  <img src={comp.image} alt={comp.name} style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px'}}/>
                  <div style={{fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold'}}>{comp.category}</div>
                  <div style={{fontWeight: '500', fontSize: '1.1rem'}}>{comp.name}</div>
                  <div style={{color: '#666', marginTop: '4px'}}>{String(comp.price).includes('₹') ? comp.price : `₹${Number(comp.price).toLocaleString('en-IN')}`}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductDetailPage;
