import { createContext, useState, useEffect, useContext, useCallback } from 'react';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('lume_cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        console.error("Could not parse cart data", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('lume_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const syncCart = (e) => {
      if (e.key === 'lume_cart' && e.newValue) {
        try { setCartItems(JSON.parse(e.newValue)); } catch (err) { console.warn('Cart sync error',err); }
      }
    };
    window.addEventListener('storage', syncCart);
    return () => window.removeEventListener('storage', syncCart);
  }, []);  

  const addToCart = useCallback((product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, amount) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + amount);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const priceStr = String(item.price);
      const priceVal = parseInt(priceStr.replace(/\D/g, ''), 10);
      return total + (priceVal * item.quantity);
    }, 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
