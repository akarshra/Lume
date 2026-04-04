import { supabase } from '../lib/supabase';

export const getOrders = async () => {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('API Error:', error);
    return [];
  }
  return data;
};

export const getUserOrders = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) {
    console.error('API Error:', error);
    return [];
  }
  return data;
};

export const getOrderByTrackId = async (trackId) => {
  if (!trackId) return null;
  const { data, error } = await supabase.from('orders').select('*').eq('id', trackId).single();
  if (error) {
    console.error('API Error:', error);
    return null; // Might not exist
  }
  return data;
};

export const addOrder = async (orderData) => {
  const { type: _type, platform: _platform, ...cleanOrderData } = orderData;
  const { data, error } = await supabase.from('orders').insert([cleanOrderData]).select();
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return data[0];
};

export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select();
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return data[0];
};

export const deleteOrder = async (id) => {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return { message: 'Order deleted' };
};

export const clearAllOrders = async () => {
  // Supabase requires a filter for deletes, so we delete where id is not null
  const { error } = await supabase.from('orders').delete().neq('id', 'clear_all');
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return { message: 'All orders deleted' };
};

// --- Inventory API ---
export const getInventory = async () => {
  const { data, error } = await supabase.from('inventory').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('API Error:', error);
    return [];
  }
  return data;
};

export const addInventory = async (dataInput) => {
  const { data, error } = await supabase.from('inventory').insert([dataInput]).select();
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return data[0];
};

export const updateInventoryStatus = async (id, inStock) => {
  const { data, error } = await supabase.from('inventory').update({ inStock }).eq('id', id).select();
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return data[0];
};

export const deleteInventoryItem = async (id) => {
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return { message: 'Inventory deleted' };
};

// --- Promo Codes API ---
export const getPromos = async () => {
  const { data, error } = await supabase.from('promocodes').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('API Error:', error);
    return [];
  }
  return data;
};

export const addPromo = async (dataInput) => {
  const { data, error } = await supabase.from('promocodes').insert([dataInput]).select();
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return data[0];
};

export const deletePromoApi = async (code) => {
  const { error } = await supabase.from('promocodes').delete().eq('code', code);
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return { message: 'Promo deleted' };
};

// --- Products API ---
export const getProducts = async () => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('API Error:', error);
    return [];
  }
  return data;
};

export const addProduct = async (dataInput) => {
  const { data, error } = await supabase.from('products').insert([dataInput]).select();
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return data[0];
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return { message: 'Product deleted' };
};

// --- Wishlist API ---
export const getWishlist = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase.from('wishlist').select('product_id').eq('user_id', userId);
  if (error) {
    console.warn('Wishlist table may not exist yet or API error:', error);
    return [];
  }
  return data.map(d => d.product_id);
};

export const toggleWishlist = async (productId, userId) => {
  if (!userId) throw new Error("Must be logged in to wishlist items");
  // Check if exists
  const { data: existing } = await supabase.from('wishlist').select('id').eq('product_id', productId).eq('user_id', userId).single();
  if (existing) {
    const { error: delError } = await supabase.from('wishlist').delete().eq('id', existing.id);
    if (delError) throw delError;
    return false; // Removed
  } else {
    const { error: insError } = await supabase.from('wishlist').insert([{ product_id: productId, user_id: userId }]);
    if (insError) throw insError;
    return true; // Added
  }
};

// --- Reviews API ---
export const getReviews = async (productId) => {
  const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
  if (error) {
    console.warn('Reviews table may not exist yet or API error.', error);
    return [];
  }
  return data;
};

export const addReview = async (reviewInput) => {
  const { data, error } = await supabase.from('reviews').insert([reviewInput]).select();
  if (error) {
    console.error('API Error:', error);
    throw error;
  }
  return data[0];
};

// --- All Reviews (for testimonials) ---
export const getAllReviews = async () => {
  const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(20);
  if (error) { console.warn('getAllReviews error:', error); return []; }
  return data;
};
