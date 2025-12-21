import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { CartContext } from "../../context/ShoppingCartContext";
import "./Product.css"
import Error404 from "../Error404/Error404";
import ignite from "../../img/ignite.jpg"
import { Icon } from "../Icon";
import { useAlert } from "../../context/AlertContext";
import { faAngleLeft, faAngleRight, faArrowLeft, faArrowRight, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

function Product() {
    const { createToast } = useAlert();
    const { id } = useParams();
    const location = useLocation();
    const {cart, setCart} = useContext(CartContext); 
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [primary, setPrimaryImage] = useState(true);
    const [touchStartX, setTouchStartX] = useState(0);

    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };
    const handleTouchEnd = (e) => {
        if (!touchStartX) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        const minSwipeDistance = 50;
        
        if (diff > minSwipeDistance) {
            setPrimaryImage(false);
        }
        else if (diff < -minSwipeDistance) {
            setPrimaryImage(true);
        }
        
        setTouchStartX(0);
    };

    const append = () => {
        setQuantity(prev => prev + 1);
    }
    
    const prepend = () => {
        if(quantity > 1){
            setQuantity(prev => prev - 1);
        }
    }

    const addToCart = (e) => {
        e.stopPropagation();
        
        if (!product.disponible) {
            createToast({
            text: "El producto ya no se encuentra disponible",
            tipo: "cross"
        }); 
            return;
        }
        
        const hasVariants = variations.length > 0;
        
        if (hasVariants && !selectedVariant) {
            alert("Seleccione una variante de este producto");
            return;
        }
        
        let stockDisponible = 0;
        
        if (hasVariants && selectedVariant) {
            stockDisponible = selectedVariant.stock_info?.stock || 
                             selectedVariant.Product_Variation?.stock || 
                             0;
        } else {
            stockDisponible = product.stock_total || 0;
        }
        
        if (stockDisponible <= 0) {
            alert("No hay stock disponible de este producto");
            return;
        }
        
        let cantidadEnCarrito = 0;
        
        if (hasVariants && selectedVariant) {
            cantidadEnCarrito = cart.reduce((total, item) => {
                if (item.id === product.id && item.varianteId === selectedVariant.id) {
                    return total + item.cantidad;
                }
                return total;
            }, 0);
        } else {
            cantidadEnCarrito = cart.reduce((total, item) => {
                if (item.id === product.id && !item.varianteId) {
                    return total + item.cantidad;
                }
                return total;
            }, 0);
        }
        
        const cantidadTotalDespues = cantidadEnCarrito + quantity;
        
        if (cantidadTotalDespues > stockDisponible) {
            const disponibleParaAgregar = stockDisponible - cantidadEnCarrito;
            
            if (disponibleParaAgregar <= 0) {
                createToast({
                    text: "Ya tenés la cantidad máxima disponible en el carrito",
                    tipo: "cross"
                }); 
            } else {
                createToast({
                    text: `Solo puedes agregar ${disponibleParaAgregar} unidades más. Stock disponible: ${stockDisponible}`,
                    tipo: "warning"
                });
                setQuantity(disponibleParaAgregar);
            }
            return;
        }
        
        const cartItem = {
            id: product.id,
            desc: product.desc,
            precio: product.precio,
            cantidad: quantity,
            imagen: product.imageUrl || product.ruta_imagen || ignite,
            stockDisponible: stockDisponible,
            ...(hasVariants && selectedVariant && {
                varianteId: selectedVariant.id,
                varianteDesc: selectedVariant.descripcion
            })
        };
        
        const cartItemId = hasVariants && selectedVariant 
            ? `${product.id}-${selectedVariant.id}`
            : product.id.toString();
        
        setCart((currItems) => {
            const isItemFound = currItems.find((item) => {
                const itemId = item.varianteId 
                    ? `${item.id}-${item.varianteId}`
                    : item.id.toString();
                return itemId === cartItemId;
            });
            
            if (isItemFound) {
                return currItems.map((item) => {
                    const itemId = item.varianteId 
                        ? `${item.id}-${item.varianteId}`
                        : item.id.toString();
                        
                    return itemId === cartItemId 
                        ? { 
                            ...item, 
                            cantidad: item.cantidad + quantity 
                        }
                        : item;
                });
            } else {
                return [...currItems, cartItem];
            }
        });
        
        const mensaje = hasVariants 
            ? `${product.desc} (${selectedVariant.descripcion}) agregado al carrito`
            : `${product.desc} agregado al carrito`;
        createToast({
            text: mensaje,
            tipo: "check"
        });
    };

    // Función para extraer datos limpios del producto
    const extractProductData = (productData) => {
        let product = productData;
        if (productData.success && productData.data) {
            product = productData.data;
        }
        
        return {
            id: product.id,
            desc: product.desc,
            precio: product.precio,
            hasImage: !!(product.ruta_imagen || product.imagen_public_id || product.ruta_imagen2 || product.imagen_public_id2),
            variations: product.Variations || product.variations || [],
            stock_total: product.stock_total || 0,
            disponible: product.disponible !== false,
            category: product.Category || null,
            imagen_optimizada: product.imagen_optimizada || null,
            imagen2_optimizada: product.imagen2_optimizada || null,
            ruta_imagen: product.ruta_imagen || null,
            ruta_imagen2: product.ruta_imagen2 || null
        };
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                
                if (location.state?.product) {
                    const cleanProduct = extractProductData(location.state.product);
                    setProduct(cleanProduct);
                    setLoading(false);
                    return;
                }
                
                const response = await fetch("http://localhost:3030/products/byId", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ id: parseInt(id) })
                });
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("PRODUCT_NOT_FOUND");
                    }
                    throw new Error("Error en la petición");
                }
                
                const productData = await response.json();
                
                if (!productData) {
                    throw new Error("PRODUCT_NOT_FOUND");
                }
                
                const cleanProduct = extractProductData(productData);
                setProduct(cleanProduct);
                
            } catch (error) {
                console.error("Error:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, location.state]);
    
    if (loading) {
        return <div className="loading">Cargando producto...</div>;
    }
    
    if (!product) {
        return <Error404/>;
    }
    
    const variations = product.variations || [];
    const categoryName = product.category?.desc || "";
    
    
    const getImage = (optimizada, ruta) => {
          if (!optimizada && !ruta) {
        return null;
    }

    if (optimizada) {
        const url = optimizada.detail || 
                   optimizada.large || 
                   optimizada.medium || 
                   optimizada.original || 
                   null;
        
        if (url && isCloudinaryPlaceholder(url)) {
            return null;
        }
        return url;
    }
    if (ruta) {
        if (isCloudinaryPlaceholder(ruta)) {
            return null;
        }
        return ruta;
    }
    
        return null;
    };
    
    const isCloudinaryPlaceholder = (url) => {
        if (!url) return true;
    
        const placeholderPatterns = [
            '/0?_a=',      
            '/image/upload/0',
            '/default',    
            '/placeholder' 
    ];
    
    return placeholderPatterns.some(pattern => url.includes(pattern));
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
    
    return (
        <div className="product-detail-background">
            <section className="image-section">
            {(!primary && hasSecondImage())&&(
            <Icon css="previus-image" icon={faAngleLeft} onClick={()=>{setPrimaryImage(true)}}/>

            )}
            <div className={`product-image-container ${hasSecondImage() ? 'has-hover' : ''}`}>
                {product.hasImage ? (
                    <>
                        <img 
                            src={image1} 
                            alt={product.desc}
                            className={`prod-image primary`}
                            onError={(e) => {
                                e.target.src = ignite;
                            }}
                        />
                        
                        {(hasSecondImage()) && (
                            <img 
                                src={image2} 
                                alt={`${product.desc} - vista alterna`}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                                className={`prod-image secondary ${!primary? 'active':''}`}
                                onError={(e) => {
                                    e.target.src = image1 || ignite;
                                }}
                            />
                        )}
                    </>
                ) : (
                    <img 
                        src={ignite} 
                        alt={product.desc}
                        className="prod-image"
                    />
                )}
                
                {!product.hasImage && (
                    <div className="image-placeholder-note">
                        Imagen no disponible
                    </div>
                )}
            </div>
            {(hasSecondImage() && primary) &&(
                <Icon css="next-image" icon={faAngleRight} onClick={()=> {setPrimaryImage(false)}}/>
            )}
            </section>
            <div className="detail-container">
                <h1 className="product-detail-title">{product.desc}</h1>
                <p className="product-detail-price">${product.precio.toLocaleString('es-AR')}</p>
                
                {variations.length > 0 && (
                    <section className="options-section">
                        <select className="variations" onChange={(e) => {
                            if(e.target.value === ""){
                                setSelectedVariant(null);
                            } else {
                                const selectedIndex = e.target.selectedIndex - 1;
                                setSelectedVariant(variations[selectedIndex]);
                            }
                        }}>
                            {categoryName.includes("Vapes") ? (
                                <option value="">Selecciona un gusto</option>
                            ) : (
                                <option value="">Selecciona un color</option>
                            )}
                            
                            {variations.map((variation, index) => {
                                const stock = variation.stock_info?.stock || variation.Product_Variation?.stock || 0;
                                const isOutOfStock = stock === 0;
                                
                                return (
                                    <option 
                                        key={variation.id || index}
                                        value={variation.id || index}
                                        className="variation-option"
                                        disabled={isOutOfStock}
                                        style={{
                                            backgroundColor: isOutOfStock ? "rgb(61, 61, 61)" : "white",
                                            color: isOutOfStock ? "white" : "black"
                                        }}
                                    >
                                        {isOutOfStock ? 
                                            `${variation.descripcion} (sin stock)` : 
                                            variation.descripcion}
                                    </option>
                                );
                            })}
                        </select>
                    </section>
                )}
                
                <section className="product-detail-buttons">
                    <div className="form-quantity">
                        <button 
                            type="button" 
                            className="form-quantity-button-minus" 
                            onClick={(e) => {
                                e.preventDefault();
                                prepend();
                            }}
                            disabled={quantity <= 1}
                        >
                            <Icon icon={faMinus}/>
                        </button>
                        
                        <input 
                            className="form-quantity-input" 
                            type="number" 
                            min="1"
                            max={product.stock_total || 99}
                            value={quantity} 
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val > 0 && val <= (product.stock_total || 99)) {
                                    setQuantity(val);
                                }
                            }}
                        />
                        
                        <button 
                            type="button" 
                            className="form-quantity-button-plus" 
                            onClick={() => append()}
                            disabled={quantity >= (product.stock_total || 99)}
                        >
                            <Icon icon={faPlus}/>
                        </button>
                    </div>
                    
                    <button 
                        className="shop-button-detail"
                        disabled={!product.disponible || (selectedVariant && selectedVariant.stock_info?.stock === 0)}
                        onClick={addToCart}
                    >
                        {product.disponible ? 'AGREGAR AL CARRITO' : 'PRODUCTO AGOTADO'}
                    </button>
                </section>
            </div>  
        </div>
    );
}

export default Product;