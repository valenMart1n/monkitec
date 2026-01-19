import React from 'react';
import './ListedProduct.css';
import { useContext } from "react";
import { Icon } from '../../Icon';
import { faBasketShopping } from '@fortawesome/free-solid-svg-icons';
import { CartContext } from "../../../context/ShoppingCartContext";
import { useNavigate } from "react-router-dom";
import {useAlert} from "../../../context/AlertContext";

function ListedProduct({ product, onClick }) {
    const {createToast} = useAlert();
    const navigate = useNavigate();
    const {cart, setCart} = useContext(CartContext); 

    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(product.precio);

     const getImage = (optimizada, ruta) => {
        if (optimizada) {
            return optimizada.detail || 
                   optimizada.large || 
                   optimizada.medium || 
                   optimizada.original || 
                   null
        }
        if (ruta) return ruta;
    };


    const hasSecondImage = () => {
    const result = getImage(product.imagen2_optimizada, product.ruta_imagen2);
        if(result == 0 || result == null){
            return false;
        }
        return true;
    };

    const image1 = getImage(product.imagen_optimizada, product.ruta_imagen);
    const image2 = getImage(product.imagen2_optimizada, product.ruta_imagen2);
    const showHoverEffect = hasSecondImage();

    const addToCart = (e) => {
        if (e) e.stopPropagation();
        const hasVariants = Array.isArray(product.variations) && 
                       product.variations.length > 0 && 
                       product.variations.some(v => v !== null && v !== undefined);
        
        if (hasVariants) {
            navigate(`/product/${product.id}`, {
                state: { product }
            });
        } else {
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
            createToast({
                text: "Producto agregado",
                tipo: "check"
            });
        }
        
    };

    return (
        <div className="listed-product-background" onClick={onClick}>
            <div className={`listed-product-image-container ${showHoverEffect ? 'has-hover' : ''}`}>
                {product.hasImage || product.ruta_imagen || product.imagen_optimizada ? (
                    <>
                        {/* Imagen principal */}
                        <img 
                            src={image1} 
                            alt={product.desc}
                            className={`prod-image primary ${showHoverEffect ? 'hover-enabled' : ''}`}
                            onError={(e) => {
                                e.target.src = '/default-product.png';
                            }}
                        />
                        
                        {/* Imagen secundaria (solo si hay hover effect) */}
                        {showHoverEffect && (
                            <img 
                                src={image2} 
                                alt={`${product.desc} - vista alterna`}
                                className="prod-image secondary"
                                onError={(e) => {
                                    e.target.src = image1 || '/default-product.png';
                                }}
                            />
                        )}
                    </>
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
               
               <div className={`product-status ${!product.stock_total == 0 ? 'available' : 'sold-out'}`}>
                    {product.stock_total === 0 || !product.disponible ? 'Sin stock' : ""}
                </div>
            </div>
            
        </div>
    );
}

export default ListedProduct;