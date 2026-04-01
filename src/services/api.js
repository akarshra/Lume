const API_URL = 'http://localhost:5001/api';

export const getOrders = async () => {
  try {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const addOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Failed to add order');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order status');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete order');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const clearAllOrders = async () => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear orders');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// --- Inventory API ---
export const getInventory = async () => {
  try {
    const response = await fetch(`${API_URL}/inventory`);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const addInventory = async (data) => {
  try {
    const response = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add inventory');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updateInventoryStatus = async (id, inStock) => {
  try {
    const response = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inStock }),
    });
    if (!response.ok) throw new Error('Failed to update inventory status');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (id) => {
  try {
    const response = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete inventory');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// --- Promo Codes API ---
export const getPromos = async () => {
  try {
    const response = await fetch(`${API_URL}/promos`);
    if (!response.ok) throw new Error('Failed to fetch promos');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const addPromo = async (data) => {
  try {
    const response = await fetch(`${API_URL}/promos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add promo');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deletePromoApi = async (code) => {
  try {
    const response = await fetch(`${API_URL}/promos/${code}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete promo');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// --- Products API ---
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const addProduct = async (data) => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add product');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
