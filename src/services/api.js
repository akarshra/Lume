import { supabase } from '../lib/supabase';

// --- Orders API ---
export const getOrders = async () => {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('API Error:', error);
    return [];
  }
  return data;
};

export const addOrder = async (orderData) => {
  const { type, platform, ...cleanOrderData } = orderData;
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
