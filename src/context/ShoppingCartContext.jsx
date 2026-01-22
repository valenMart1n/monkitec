import React, {createContext, useEffect, useState, useCallback} from "react";

export const CartContext = createContext(null);

export const ShoppingCartProvider = ({children}) => {
    // 1. Cargar primero desde localStorage (inmediato)
    const [cart, setCartState] = useState(() => {
        try {
            const saved = localStorage.getItem('carrito_local');
            if (saved === null || saved === '[]' || saved === '') {
                return []; // Retornar array vacío si no hay nada válido
            }
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });
    
    useEffect(() => {
        if (cart.length === 0) {
            localStorage.removeItem('carrito_local');
          
        } else {
            localStorage.setItem('carrito_local', JSON.stringify(cart));
        }
        
        saveToBackend(cart);
    }, [cart]);

    const saveToBackend = useCallback(async (cartData) => {
        try {
   
            if (cartData.length === 0) {
                await fetch(`${process.env.REACT_APP_API_URL}/cart/clear`, {
                    method: 'POST',
                    credentials: 'include',
                });
            } else {
                await fetch(`${process.env.REACT_APP_API_URL}/cart/save`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ cart: cartData }),
                });
            }
        } catch (error) {
        }
    }, []);

    
    useEffect(() => {
        const loadFromBackend = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
                    credentials: 'include'
                });
                const data = await response.json();
                
                if (data.success && data.carrito && Array.isArray(data.carrito)) {
                    if (data.carrito.length > 0) {
                        setCartState(data.carrito);
                    } else {
                        setCartState([]);
                        localStorage.removeItem('carrito_local');
               
                    }
                }
            } catch (error) {
            }
        };
        
        loadFromBackend();
    }, []);

    const addToCart = useCallback((item) => {
        setCartState((prevCart) => {
            const existingItemIndex = prevCart.findIndex(cartItem => {
                if (cartItem.varianteId && item.varianteId) {
                    return cartItem.id === item.id && cartItem.varianteId === item.varianteId;
                } else if (cartItem.varianteDesc && item.varianteDesc) {
                    return cartItem.id === item.id && cartItem.varianteDesc === item.varianteDesc;
                }
                return cartItem.id === item.id;
            });

            if (existingItemIndex >= 0) {
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    cantidad: newCart[existingItemIndex].cantidad + (item.cantidad || 1)
                };
                return newCart;
            } else {
                return [...prevCart, {
                    ...item,
                    cantidad: item.cantidad || 1
                }];
            }
        });
    }, []);

    const removeFromCart = useCallback((id, varianteId, varianteDesc) => {
        setCartState((prevCart) => {
            const newCart = prevCart.filter((item) => {
                if (varianteId !== undefined && item.varianteId !== undefined) {
                    return !(item.id === id && item.varianteId === varianteId);
                } else if (varianteDesc !== undefined && item.varianteDesc !== undefined) {
                    return !(item.id === id && item.varianteDesc === varianteDesc);
                }
                return !(item.id === id);
            });
            
            return newCart;
        });
    }, []);

    const updateQuantity = useCallback((id, varianteId, varianteDesc, newQuantity) => {
        setCartState((prevCart) => {
            const newCart = prevCart.map((item) => {
                if (varianteId !== undefined && item.varianteId !== undefined) {
                    if (item.id === id && item.varianteId === varianteId) {
                        return { ...item, cantidad: Math.max(0, newQuantity) };
                    }
                } else if (varianteDesc !== undefined && item.varianteDesc !== undefined) {
                    if (item.id === id && item.varianteDesc === varianteDesc) {
                        return { ...item, cantidad: Math.max(0, newQuantity) };
                    }
                } else if (item.id === id) {
                    return { ...item, cantidad: Math.max(0, newQuantity) };
                }
                return item;
            }).filter(item => item.cantidad > 0); // Eliminar items con cantidad 0
            
            return newCart;
        });
    }, []);

    const clearCart = useCallback(() => {
        setCartState([]); // Esto activará el useEffect que limpia localStorage y backend
    }, []);

    const getCartItemCount = useCallback(() => {
        return cart.reduce((total, item) => total + item.cantidad, 0);
    }, [cart]);

    const isInCart = useCallback((id, varianteId, varianteDesc) => {
        return cart.some(item => {
            if (varianteId !== undefined && item.varianteId !== undefined) {
                return item.id === id && item.varianteId === varianteId;
            } else if (varianteDesc !== undefined && item.varianteDesc !== undefined) {
                return item.id === id && item.varianteDesc === varianteDesc;
            }
            return item.id === id;
        });
    }, [cart]);

    const refreshCart = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setCartState(data.carrito || []);
            }
        } catch (error) {
        }
    }, []);

    const value = {
        cart,
        setCart: setCartState,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItemCount,
        isInCart,
        refreshCart,
        isLoading: false
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};