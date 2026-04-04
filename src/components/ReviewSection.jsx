import { useState, useEffect } from "react";
import { Star, User, Send } from "lucide-react";
import { getReviews, addReview } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./ReviewSection.css";
const StarRating = ({ rating, setRating, readonly }) => (
  <div className="star-row">
    {[1,2,3,4,5].map(s => (
      <button key={s} type="button" onClick={() => !readonly && setRating && setRating(s)} className={"star-btn"+(s<=rating?" filled":"")} disabled={readonly}>
        <Star size={18} fill={s<=rating?"#C62828":"transparent"} color={s<=rating?"#C62828":"#ccc"} />
      </button>
    ))}
  </div>
);
const ReviewSection = ({ productId, productName }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { if(productId) getReviews(productId).then(setReviews).catch(()=>{}); }, [productId]);
  const avg = reviews.length ? (reviews.reduce((a,r)=>a+(r.rating||5),0)/reviews.length).toFixed(1) : null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!user){alert("Please sign in to leave a review.");return;}
    setLoading(true);
    try{
      const rev = await addReview({product_id:productId,product_name:productName,user_id:user.id,user_email:user.email,rating,comment,created_at:new Date().toISOString()});
      setReviews([rev,...reviews]);setComment("");setRating(5);setSubmitted(true);
    }catch{alert("Failed to submit review.");}finally{setLoading(false);}
  };
  return (
    <div className="review-section">
      <div className="review-header"><h3>Customer Reviews</h3>{avg&&<div className="avg-rating"><Star size={16} fill="#C62828" color="#C62828"/><span>{avg}/5</span><span className="rev-count">({reviews.length} review{reviews.length!==1?"s":""})</span></div>}</div>
      {!submitted?(
        <form className="review-form glass-panel" onSubmit={handleSubmit}>
          <h4>Write a Review</h4>
          <StarRating rating={rating} setRating={setRating}/>
          <textarea className="review-textarea" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Share your experience with this bouquet..." rows={3} required/>
          <button type="submit" className="btn-primary" disabled={loading} style={{fontSize:"0.9rem",padding:"10px 24px"}}><Send size={16}/> {loading?"Submitting...":"Submit Review"}</button>
        </form>
      ):(
        <div className="review-success glass-panel"><Star size={24} fill="#C62828" color="#C62828"/><p>Thank you for your review!</p></div>
      )}
      <div className="reviews-list">
        {reviews.length===0?<p className="no-reviews">No reviews yet. Be the first to share your experience!</p>:reviews.map((rev,i)=>(
          <div key={rev.id||i} className="review-card glass-panel">
            <div className="rev-card-header">
              <div className="rev-avatar"><User size={16}/></div>
              <div><strong>{rev.user_email?rev.user_email.split("@")[0]:"Customer"}</strong><StarRating rating={rev.rating||5} readonly/></div>
              <span className="rev-date">{rev.created_at?new Date(rev.created_at).toLocaleDateString("en-IN"):""}</span>
            </div>
            <p className="rev-comment">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ReviewSection;
