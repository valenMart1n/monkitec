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
    
    // 2. Guardar automáticamente en localStorage cuando cambia el carrito
    useEffect(() => {
        if (cart.length === 0) {
            // Si el carrito está vacío, REMOVER el item de localStorage
            localStorage.removeItem('carrito_local');
            console.log('🗑️ Carrito vacío - eliminado de localStorage');
        } else {
            localStorage.setItem('carrito_local', JSON.stringify(cart));
            console.log('💾 Guardado en localStorage:', cart.length, 'items');
        }
        
        // Intentar guardar en backend (pero no es crítico si falla)
        saveToBackend(cart);
    }, [cart]);

    // 3. Función para guardar en backend (con manejo de carrito vacío)
    const saveToBackend = useCallback(async (cartData) => {
        try {
            // Si el carrito está vacío, también limpiamos el backend
            if (cartData.length === 0) {
                await fetch('http://monkitec-api.vercel.app/cart/clear', {
                    method: 'POST',
                    credentials: 'include',
                });
                console.log('✅ Backend limpiado (carrito vacío)');
            } else {
                await fetch('http://monkitec-api.vercel.app/cart/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ cart: cartData }),
                });
                console.log('✅ Carrito sincronizado con backend');
            }
        } catch (error) {
            console.log('⚠️ Backend no disponible');
        }
    }, []);

    // 4. Cargar desde backend al inicio (opcional, en segundo plano)
    useEffect(() => {
        const loadFromBackend = async () => {
            try {
                const response = await fetch('http://monkitec-api.vercel.app/cart', {
                    credentials: 'include'
                });
                const data = await response.json();
                
                if (data.success && data.carrito && Array.isArray(data.carrito)) {
                    // Solo actualizar si el backend tiene datos
                    if (data.carrito.length > 0) {
                        setCartState(data.carrito);
                        console.log('📥 Carrito cargado desde backend:', data.carrito.length, 'items');
                    } else {
                        // Si el backend tiene array vacío, limpiamos local también
                        setCartState([]);
                        localStorage.removeItem('carrito_local');
                        console.log('📥 Backend tiene carrito vacío');
                    }
                }
            } catch (error) {
                console.log('📦 Usando carrito de localStorage');
            }
        };
        
        loadFromBackend();
    }, []);

    // 5. Funciones del carrito (corregidas para limpiar cuando queda vacío)
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
            const response = await fetch('http://monkitec-api.vercel.app/cart', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                setCartState(data.carrito || []);
            }
        } catch (error) {
            console.log('No se pudo actualizar del backend');
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