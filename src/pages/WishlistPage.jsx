import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getWishlist, getProducts, toggleWishlist } from "../services/api";
import { Helmet } from "react-helmet-async";
import "./WishlistPage.css";
const WishlistPage = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if(!user){setLoading(false);return;}
    Promise.all([getWishlist(user.id),getProducts()]).then(([ids,prods])=>{
      setWishlistIds(ids);
      const manual=[{id:'1',name:"Midnight Sparkle Rose",category:"Anniversary",price:"₹1,599",image:"/images/ig/1.webp"},{id:'2',name:"Crimson Delight",category:"Romantic",price:"₹1,199",image:"/images/ig/2.webp"},{id:'3',name:"Classic Anniversary Rose",category:"Anniversary",price:"₹1,299",image:"/images/ig/3.webp"},{id:'4',name:"Golden Proposal",category:"Proposal",price:"₹2,499",image:"/images/ig/4.webp"},{id:'5',name:"Lavender Dreams",category:"Birthday",price:"₹999",image:"/images/ig/5.webp"},{id:'6',name:"Soft Blush Elegance",category:"Custom",price:"From ₹1,499",image:"/images/ig/6.webp"},{id:'7',name:"Bridal White Bouquet",category:"Wedding",price:"₹3,499",image:"/images/ig/7.png"}];
      const all=prods&&prods.length>0?prods:manual;
      setProducts(all.filter(p=>ids.includes(p.id)));
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[user]);
  const handleRemove = async(productId)=>{
    try{await toggleWishlist(productId,user.id);setWishlistIds(w=>w.filter(i=>i!==productId));setProducts(p=>p.filter(i=>i.id!==productId));}catch{}
  };
  if(!user) return(<div className="wishlist-page page-enter-active"><Helmet><title>My Wishlist | Lumé</title></Helmet><div className="container text-center" style={{paddingTop:'120px',minHeight:'60vh'}}><Heart size={56} color="#C62828" style={{marginBottom:'16px'}}/><h2 className="title-secondary">Sign in to view your wishlist</h2><Link to="/account" className="btn-primary" style={{marginTop:'20px'}}>Sign In</Link></div></div>);
  return (
    <div className="wishlist-page page-enter-active">
      <Helmet><title>My Wishlist | Lumé</title><meta name="description" content="Your saved Lumé bouquets"/></Helmet>
      <div className="container" style={{paddingTop:'100px',minHeight:'80vh'}}>
        <Link to="/gallery" className="back-link animated-link" style={{marginBottom:'24px',display:'inline-flex'}}><ArrowLeft size={18}/> Back to Gallery</Link>
        <div className="wishlist-header">
          <h1 className="title-secondary">My Wishlist <Heart size={28} fill="#C62828" color="#C62828"/></h1>
          <p className="subtitle">{products.length} saved item{products.length!==1?"s":""}</p>
        </div>
        {loading?(
          <div className="text-center" style={{padding:'60px 0'}}><div className="spinner"/></div>
        ):products.length===0?(
          <div className="wishlist-empty glass-panel">
            <Heart size={56} color="#e2e8f0"/>
            <h3>Your wishlist is empty</h3>
            <p>Browse our collection and save your favourites!</p>
            <Link to="/gallery" className="btn-primary">Explore Bouquets</Link>
          </div>
        ):(
          <div className="wishlist-grid">
            {products.map(item=>(
              <div key={item.id} className="wishlist-card glass-panel">
                <div className="wishlist-img-wrap" onClick={()=>navigate('/product/'+item.id)} style={{cursor:'pointer'}}>
                  <img src={item.image} alt={item.name} className="wishlist-img"/>
                </div>
                <div className="wishlist-info">
                  <span className="product-category">{item.category}</span>
                  <h3 className="product-title" onClick={()=>navigate('/product/'+item.id)} style={{cursor:'pointer'}}>{item.name}</h3>
                  <p className="wishlist-price">{String(item.price).includes('₹')?item.price:'₹'+Number(item.price).toLocaleString('en-IN')}</p>
                  <div className="wishlist-actions">
                    <button className="btn-primary" style={{flex:1,padding:'10px'}} onClick={()=>{addToCart(item);handleRemove(item.id);}}><ShoppingCart size={16}/> Add to Cart</button>
                    <button className="btn-outline-danger" onClick={()=>handleRemove(item.id)} title="Remove from wishlist"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default WishlistPage;
