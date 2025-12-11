import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { CartContext } from "../../context/ShoppingCartContext";
import "./Product.css"
import Error404 from "../Error404/Error404";
import ignite from "../../img/ignite.jpg"
import { Icon } from "../Icon";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

function Product() {
    const { id } = useParams();
    const location = useLocation();
    const [cart, setCart] = useContext(CartContext); 
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);

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
        alert("Producto no disponible");
        return;
    }
    
    // Verificar si tiene variantes y si se seleccionó una
    const hasVariants = variations.length > 0;
    
    if (hasVariants && !selectedVariant) {
        alert("Seleccione una variante de este producto");
        return;
    }
    
    // Calcular stock disponible
    let stockDisponible = 0;
    
    if (hasVariants && selectedVariant) {
        // Stock de la variante específica
        stockDisponible = selectedVariant.stock_info?.stock || 
                         selectedVariant.Product_Variation?.stock || 
                         0;
    } else {
        // Stock total del producto (sin variantes)
        stockDisponible = product.stock_total || 0;
    }
    
    // Verificar si hay stock
    if (stockDisponible <= 0) {
        alert("No hay stock disponible de este producto");
        return;
    }
    
    // Calcular cantidad ya en el carrito
    let cantidadEnCarrito = 0;
    
    if (hasVariants && selectedVariant) {
        // Buscar por producto + variante
        cantidadEnCarrito = cart.reduce((total, item) => {
            if (item.id === product.id && item.varianteId === selectedVariant.id) {
                return total + item.cantidad;
            }
            return total;
        }, 0);
    } else {
        // Buscar solo por producto (sin variantes)
        cantidadEnCarrito = cart.reduce((total, item) => {
            if (item.id === product.id && !item.varianteId) {
                return total + item.cantidad;
            }
            return total;
        }, 0);
    }
    
    // Verificar si supera el stock disponible
    const cantidadTotalDespues = cantidadEnCarrito + quantity;
    
    if (cantidadTotalDespues > stockDisponible) {
        const disponibleParaAgregar = stockDisponible - cantidadEnCarrito;
        
        if (disponibleParaAgregar <= 0) {
            alert("Ya tienes la cantidad máxima disponible en el carrito");
        } else {
            alert(`Solo puedes agregar ${disponibleParaAgregar} unidades más. Stock disponible: ${stockDisponible}`);
            
            // Opcional: ajustar automáticamente la cantidad al máximo disponible
            setQuantity(disponibleParaAgregar);
        }
        return;
    }
    
    // Datos mínimos para el carrito
    const cartItem = {
        id: product.id,
        desc: product.desc,
        precio: product.precio,
        cantidad: quantity,
        imagen: product.imageUrl || product.ruta_imagen || ignite,
        stockDisponible: stockDisponible, // Guardamos el stock disponible
        // Solo incluir variante si existe
        ...(hasVariants && selectedVariant && {
            varianteId: selectedVariant.id,
            varianteDesc: selectedVariant.descripcion
        })
    };
    
    // Crear ID único para el carrito
    const cartItemId = hasVariants && selectedVariant 
        ? `${product.id}-${selectedVariant.id}`
        : product.id.toString();
    
    setCart((currItems) => {
        const isItemFound = currItems.find((item) => {
            // Comparar por ID único del carrito
            const itemId = item.varianteId 
                ? `${item.id}-${item.varianteId}`
                : item.id.toString();
            return itemId === cartItemId;
        });
        
        if (isItemFound) {
            // Si ya existe, incrementar cantidad
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
            // Si no existe, agregar nuevo ítem
            return [...currItems, cartItem];
        }
    });
    
    // Mensaje de confirmación
    const mensaje = hasVariants 
        ? `${product.desc} (${selectedVariant.descripcion}) agregado al carrito`
        : `${product.desc} agregado al carrito`;
    
    alert(mensaje);

};
    // Función para obtener la mejor URL de imagen
    const getProductImageUrl = (productData) => {
        if (!productData) return ignite; // Imagen por defecto
        
        // Si tiene imagen optimizada de Cloudinary
        if (productData.imagen_optimizada) {
            // Prioridad: detail > large > medium > original
            return productData.imagen_optimizada.detail || 
                   productData.imagen_optimizada.large || 
                   productData.imagen_optimizada.medium || 
                   productData.imagen_optimizada.original || 
                   ignite;
        }
        
        // Si tiene ruta_imagen directa
        if (productData.ruta_imagen) {
            return productData.ruta_imagen;
        }
        
        // Imagen por defecto
        return ignite;
    };

    // Función para extraer datos limpios del producto
    const extractProductData = (productData) => {
        // Manejar si viene dentro de data.success o directamente
        let product = productData;
        if (productData.success && productData.data) {
            product = productData.data;
        }
        
        const imageUrl = getProductImageUrl(product);
        
        return {
            id: product.id,
            desc: product.desc,
            precio: product.precio,
            imageUrl: imageUrl,
            hasImage: !!(product.ruta_imagen || product.imagen_public_id),
            variations: product.Variations || product.variations || [],
            stock_total: product.stock_total || 0,
            disponible: product.disponible !== false,
            category: product.Category || null,
            imagen_optimizada: product.imagen_optimizada || null,
            ruta_imagen: product.ruta_imagen || null
        };
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                
                // Si ya tenemos el producto del estado (viene de navegación)
                if (location.state?.product) {
                    const cleanProduct = extractProductData(location.state.product);
                    setProduct(cleanProduct);
                    setLoading(false);
                    return;
                }
                
                // Obtener producto desde la API
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
                
                // Extraer datos limpios con imágenes
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
    
    return (
        <div className="product-detail-background">
            {/* Imagen del producto */}
            <div className="product-image-container">
                <img 
                    src={product.imageUrl} 
                    className="prod-img" 
                    alt={product.desc || "Producto"} 
                    onError={(e) => {
                        e.target.src = ignite;
                        e.target.onerror = null; // Evitar loops
                    }}
                />
                
                {/* Indicador si no tiene imagen */}
                {!product.hasImage && (
                    <div className="image-placeholder-note">
                        Imagen no disponible
                    </div>
                )}
            </div>
            
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
                
                {/* Información adicional de la imagen */}
                {product.imagen_optimizada && product.imagen_optimizada.zoom && (
                    <div className="image-zoom-note">
                        <small>Haz clic en la imagen para ver en tamaño completo</small>
                    </div>
                )}
            </div>  
        </div>
    );
}

export default Product;