import React from 'react';
import './ListedProduct.css';
import { useContext } from "react";
import { Icon } from '../../Icon';
import { faBasketShopping } from '@fortawesome/free-solid-svg-icons';
import { CartContext } from "../../../context/ShoppingCartContext";
import { useNavigate } from "react-router-dom";

function ListedProduct({ product, onClick }) {
    const navigate = useNavigate();
    const [cart, setCart] = useContext(CartContext); 
    // Formatear precio
    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(product.precio);

    // Función para agregar al carrito
    const addToCart = (e) => {
        if (e) e.stopPropagation();
        
        // Verificar si tiene variantes
        const hasVariants = product.variations && product.variations.length > 0;
        
        if (hasVariants) {
            // Si tiene variantes, navegar a la página de detalles
            navigate(`/product/${product.id}`, {
                state: { product }
            });
        } else {
            // Si no tiene variantes, agregar directamente al carrito
            setCart((currItems) => {
                const isItemFound = currItems.find((item) => item.id === product.id);
                
                if (isItemFound) {
                    return currItems.map((item) => 
                        item.id === product.id 
                            ? { ...item, cantidad: item.cantidad + 1 }
                            : item
                    );
                } else {
                    return [...currItems, { 
                        ...product, 
                        cantidad: 1,
                        precio: product.precio,
                        desc: product.desc,
                        imageUrl: product.imageUrl || product.ruta_imagen || '/default-product.png'
                    }];
                }
            });
            
            // Opcional: mostrar mensaje de confirmación
            alert(`${product.desc} agregado al carrito`);
            console.log(cart);
        }
    };

    // Función para obtener la mejor imagen (simplificada)
    const getBestImage = () => {
        if (product.imagen_optimizada) {
            return product.imagen_optimizada.thumbnail || 
                   product.imagen_optimizada.medium || 
                   product.imagen_optimizada.original;
        }
        if (product.ruta_imagen) return product.ruta_imagen;
        if (product.imageUrl) return product.imageUrl;
        return '/default-product.png';
    };

    return (
        <div className="listed-product-background" onClick={onClick}>
            <div className="listed-product-image-container">
                {product.hasImage || product.ruta_imagen || product.imagen_optimizada ? (
                    <img 
                        src={getBestImage()} 
                        alt={product.desc}
                        className="prod-image"
                        onError={(e) => {
                            e.target.src = '/default-product.png';
                        }}
                    />
                ) : (
                    <div className="product-image-placeholder">
                        <span className="placeholder-text">No image</span>
                    </div>
                )}
            </div>
            
            <div className="labels-container">
                <h3 className="product-name">{product.desc}</h3>
                <p className="label-price">{formattedPrice}</p>
            </div> 
            
            <div className='button-container'>    
                <button 
                    className='shop-button' 
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart(e);
                    }}
                    disabled={product.stock_total === 0}
                >
                    Comprar <Icon icon={faBasketShopping}/>
                </button>
               
               <div className={`product-status ${product.disponible ? 'available' : 'sold-out'}`}>
                    {product.stock_total === 0 ? 'Sin stock' : (!product.disponible ? 'Agotado' : '')}
                </div>
            </div>
        </div>
    );
}

export default ListedProduct;