import CategoryItem from "./CategoryItem/CategoryItem";
import ListedProduct from "../ListedProduct/ListedProduct";
import "./CategoryList.css";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Error404 from "../../Error404/Error404";


function CategoryList() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
   
    const [categoriesArray, setCategoriesArray] = useState([]);
    const [productsArray, setProductsArray] = useState([]);
    const [currentCategory, setCurrentCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const getProductDetail = (product) => {
        navigate(`/product/${product.id}`, {
            state: {  product: {
                id: product.id,
                desc: product.desc,
                precio: product.precio,
                ruta_imagen: product.ruta_imagen || product.imageUrl,
                imagen_public_id: product.imagen_public_id,
                imagen_optimizada: product.imagen_optimizada,
                Variations: product.variations, 
                Category: product.category,
                stock_total: product.stock_total,
                disponible: product.disponible
            } }
        });
    };
    /*const addProducts = (product) => {
    
    setCart((currItems) => {
      
      const isItemFound = currItems.find((item) => item.codigo === product.codigo);
      if(isItemFound){
        return currItems.map((item) => 
        item.codigo === product.codigo 
            ? {...item, cantidad: item.cantidad +quantity}
            : item
        );
      }else{
        return [...currItems, {...product, cantidad: quantity}];
      }
    });     
    }
    */
    const handleCategoryClick = (id) => {
        navigate(`/categories/${id}`);
    };

    // Función para obtener la URL de imagen más adecuada
    const getImageUrl = (item) => {
        // Si tiene imagen optimizada de Cloudinary
        if (item.imagen_optimizada) {
            // Prioridad: thumbnail > medium > original
            return item.imagen_optimizada.thumbnail || 
                   item.imagen_optimizada.medium || 
                   item.imagen_optimizada.original;
        }
        // Si tiene ruta_imagen directa
        if (item.ruta_imagen) {
            return item.ruta_imagen;
        }
        // Imagen por defecto si no hay
        return "/default-category.png";
    };

    // Función para extraer solo datos necesarios de categoría
    const extractCategoryData = (category) => {
        return {
            id: category.id,
            desc: category.desc,
            parent: category.parent,
            imageUrl: getImageUrl(category),
            hasImage: !!(category.ruta_imagen || category.imagen_public_id)
        };
    };

    // Función para extraer solo datos necesarios de producto
    const extractProductData = (product) => {
        return {
            id: product.id,
            desc: product.desc,
            precio: product.precio,
            imageUrl: getImageUrl(product),
            hasImage: !!(product.ruta_imagen || product.imagen_public_id),
            variations: product.Variations || product.variations || [],
            stock_total: product.stock_total || 0,
            disponible: product.disponible !== false,
            ruta_imagen: product.ruta_imagen,
            imagen_public_id: product.imagen_public_id,
            imagen_optimizada: product.imagen_optimizada,
            category: product.Category 
        };
    };

    
    

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                if (categoryId) {
                    const parentId = parseInt(categoryId);
                    
                    // 1. Obtener información de la categoría actual
                    const categoryRes = await fetch("http://localhost:3030/categories/byId", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({ id: parentId })
                    });
                    
                    if (categoryRes.status === 404) {
                        throw new Error("CATEGORY_NOT_FOUND");
                    }
                    
                    if (!categoryRes.ok) {
                        throw new Error("Error al obtener categoría");
                    }
                    
                    const categoryJson = await categoryRes.json();
                    
                    // Manejar nuevo formato de respuesta
                    const categoryData = categoryJson.success ? categoryJson.data : categoryJson;
                    setCurrentCategory(categoryData.desc);
                    
                    // 2. Obtener subcategorías
                    const subRes = await fetch("http://localhost:3030/categories/subcategories", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({ parent_id: parentId })
                    });
                    
                    if (subRes.ok) {
                        const subJson = await subRes.json();
                        
                        // Manejar nuevo formato de respuesta
                        const subcategorias = subJson.success ? subJson.data : subJson;
                        
                        if (subcategorias && subcategorias.length > 0) {
                            // Extraer solo los datos necesarios con imágenes
                            const categoriesWithImages = subcategorias.map(extractCategoryData);
                            setCategoriesArray(categoriesWithImages);
                            setProductsArray([]);
                            return;
                        }
                    }
                    
                    // 3. Si no hay subcategorías, obtener productos
                    const productsRes = await fetch("http://localhost:3030/products/byCategory", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({ category_id: parentId })
                    });
                    
                    if (productsRes.ok) {
                        const productsJson = await productsRes.json();
                        
                        // Manejar nuevo formato de respuesta
                        let productos;
                        if (productsJson.success) {
                            productos = productsJson.data.products || productsJson.data;
                        } else {
                            productos = productsJson;
                        }
                        
                        // Extraer solo los datos necesarios con imágenes
                        const productsWithImages = Array.isArray(productos) 
                            ? productos.map(extractProductData)
                            : [];
                        
                        setProductsArray(productsWithImages);
                        setCategoriesArray([]);
                    } else {
                        throw new Error("Error al obtener productos");
                    }
                    
                } else {
                    // 4. Página principal: obtener categorías principales
                    const res = await fetch("http://localhost:3030/categories/", {
                        method: "GET",
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        }
                    });
                    
                    if (res.ok) {
                        const dataJson = await res.json();
                        
                        // Manejar nuevo formato de respuesta
                        const data = dataJson.success ? dataJson.data : dataJson;
                        
                        // Extraer solo los datos necesarios con imágenes
                        const categoriesWithImages = Array.isArray(data) 
                            ? data.map(extractCategoryData)
                            : [];
                        
                        setCategoriesArray(categoriesWithImages);
                        setProductsArray([]);
                    } else {
                        throw new Error("Error al obtener categorías");
                    }
                }
            } catch (error) {
                console.error("Error en fetchData:", error);
                if (error.message === "CATEGORY_NOT_FOUND") {
                    setError("CATEGORY_NOT_FOUND");
                } else {
                    setError(error.message);
                }
                setCategoriesArray([]);
                setProductsArray([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    if (error === "CATEGORY_NOT_FOUND") {
        return <Error404 message={`La categoría no existe`} />;
    }

    return (
        <div className="list-background">
            {productsArray.length > 0 ? (
                <div className="products-list-background">
                    <h1 className="products-list-title">{currentCategory}</h1>
                    {productsArray.map((product, index) => (
                       <ListedProduct 
                            key={product.id || index}
                            product={product} 
                            onClick={() => getProductDetail(product)}
                        />
                    ))}
                </div>
            ) : (
                <div className="categories-list-background">
                    <h1 className="categories-list-title">Categorías</h1>
                    {categoriesArray.map((category) => (
                        <div key={category.id} className="category-background">
                            <CategoryItem 
                                name={category.desc} 
                                imageUrl={category.imageUrl}
                                hasImage={category.hasImage}
                                onClick={() => handleCategoryClick(category.id)} 
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}
export default CategoryList;