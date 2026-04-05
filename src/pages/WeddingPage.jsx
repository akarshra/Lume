import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, Users, Mail, Send, ArrowLeft, Heart, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Helmet } from "react-helmet-async";
import "./WeddingPage.css";
const WeddingPage = () => {
  const [form, setForm] = useState({name:"",email:"",phone:"",eventDate:"",venue:"",qty:"",budget:"",message:""});
  const [status, setStatus] = useState("idle");
  const handleChange=e=>setForm({...form,[e.target.name]:e.target.value});
  const handleSubmit=async(e)=>{
    e.preventDefault();setStatus("loading");
    try{
      await supabase.from("contacts").insert([{name:form.name,email:form.email,message:'Wedding/Bulk Inquiry | Phone:'+form.phone+' | Event:'+form.eventDate+' | Venue:'+form.venue+' | Qty:'+form.qty+' | Budget:'+form.budget+' | Notes:'+form.message}]);
      try{await fetch('/api/send-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:'akarshsrivastava322@gmail.com',subject:'New Wedding/Bulk Inquiry from '+form.name,html:'<h2>Wedding Inquiry</h2><p>Name: '+form.name+'</p><p>Email: '+form.email+'</p><p>Phone: '+form.phone+'</p><p>Event Date: '+form.eventDate+'</p><p>Venue: '+form.venue+'</p><p>Quantity: '+form.qty+'</p><p>Budget: '+form.budget+'</p><p>Message: '+form.message+'</p>'})});}catch(e){console.error(e);}
      setStatus("done");setForm({name:"",email:"",phone:"",eventDate:"",venue:"",qty:"",budget:"",message:""});
    }catch{setStatus("error");}
  };
  return (
    <div className="wedding-page page-enter-active">
      <Helmet><title>Wedding & Bulk Orders | Lumé</title><meta name="description" content="Bespoke ribbon rose arrangements for weddings, corporate events and bulk orders."/></Helmet>
      <div className="wedding-hero">
        <div className="container text-center">
          <div className="artisan-badge"><Sparkles size={14}/> Special Events</div>
          <h1 className="display-title">Weddings & <span className="text-crimson">Bulk Orders</span></h1>
          <p className="subtitle" style={{maxWidth:'600px',margin:'0 auto'}}>Transform your special occasions with our bespoke ribbon rose arrangements. From intimate ceremonies to grand receptions — every petal crafted with intention.</p>
        </div>
      </div>
      <div className="container">
        <div className="wedding-features">
          {/* eslint-disable-next-line no-unused-vars */}
          {[[Heart,"Bridal Bouquets","Custom bridal arrangements with your chosen colour palette"],[Users,"Table Centrepieces","Stunning ribbon rose centrepieces for every table"],[Calendar,"Event Planning","We coordinate with your event timeline for on-time delivery"],[CheckCircle,"Bulk Discounts","Special pricing for orders of 10+ bouquets"]].map(([Icon,title,desc],i)=>(
            <div key={i} className="wedding-feature-card glass-panel">
              <div className="feature-icon"><Icon size={24} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <div className="wedding-form-section">
          <div className="wedding-form-intro">
            <h2 className="title-secondary">Request a Quote</h2>
            <p className="subtitle">Tell us about your event and we will get back to you within 24 hours with a personalised proposal.</p>
            <div className="wedding-contact-pills">
              <a href="mailto:lume.est2026@gmail.com" className="pill"><Mail size={16}/> lume.est2026@gmail.com</a>
              <a href="https://instagram.com/l_u_m_eest._2026" target="_blank" rel="noreferrer" className="pill">@ l_u_m_eest._2026</a>
            </div>
          </div>
          {status==="done"?(
            <div className="wedding-success glass-panel">
              <CheckCircle size={48} color="#16a34a"/>
              <h3>Inquiry Received!</h3>
              <p>Thank you! We will contact you within 24 hours with a personalised proposal.</p>
              <Link to="/" className="btn-primary">Back to Home</Link>
            </div>
          ):(
            <form className="wedding-form glass-panel" onSubmit={handleSubmit}>
              <div className="wedding-form-grid">
                <div className="form-group"><label>Full Name</label><input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required/></div>
                <div className="form-group"><label>Email</label><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required/></div>
                <div className="form-group"><label>Phone / WhatsApp</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" required/></div>
                <div className="form-group"><label>Event Date</label><input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} required/></div>
                <div className="form-group"><label>Venue / Location</label><input name="venue" value={form.venue} onChange={handleChange} placeholder="Wedding venue or city" required/></div>
                <div className="form-group"><label>Number of Bouquets</label><input type="number" name="qty" value={form.qty} onChange={handleChange} placeholder="e.g. 25" min="1" required/></div>
              </div>
              <div className="form-group"><label>Approximate Budget (₹)</label><input name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. ₹25,000" required/></div>
              <div className="form-group"><label>Additional Requirements</label><textarea name="message" value={form.message} onChange={handleChange} placeholder="Colour preferences, special arrangements, delivery requirements..." rows={4}/></div>
              {status==="error"&&<p style={{color:"#ef4444"}}>Something went wrong. Please try again.</p>}
              <button type="submit" className="btn-primary" disabled={status==="loading"} style={{padding:"16px 32px"}}><Send size={18}/> {status==="loading"?"Sending...":"Submit Inquiry"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default WeddingPage;
