import CategoryItem from "./CategoryItem/CategoryItem";
import ListedProduct from "../ListedProduct/ListedProduct";
import "./CategoryList.css";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Error404 from "../../Error404/Error404";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";

function CategoryList() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [featured, setFeatured] = useState([]);
    const [categoriesArray, setCategoriesArray] = useState([]);
    const [productsArray, setProductsArray] = useState([]);
    const [currentCategory, setCurrentCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const getProductDetail = (product) => {
        navigate(`${process.env.REACT_APP_CLIENT_URL}/product/${product.id}`, {
            state: {  product: {
                id: product.id,
                desc: product.desc,
                precio: product.precio,
                ruta_imagen: product.ruta_imagen || product.imageUrl,
                ruta_imagen2: product.ruta_imagen2 || product.imageUrl2,
                imagen_public_id: product.imagen_public_id,
                imagen_optimizada: product.imagen_optimizada,
                imagen2_optimizada: product.imagen2_optimizada,
                Variations: product.variations, 
                Category: product.category,
                stock_total: product.stock_total,
                disponible: product.disponible
            } }
        });
    };
  
    const handleCategoryClick = (id) => {
        navigate(`${process.env.REACT_APP_CLIENT_URL}/categories/${id}`);
    };

   
    const getImageUrl = (optimizada, ruta) => {
        if (optimizada) {
            return optimizada.original||
                   optimizada.medium||
                   null;
        }
        if (ruta) {
            return ruta;
        }
        
        return "/default-category.png";
    };

    
    const extractCategoryData = (category) => {
        return {
            id: category.id,
            desc: category.desc,
            parent: category.parent,
            imageUrl: getImageUrl(category.imagen_optimizada, category.ruta_imagen),
            hasImage: !!(category.ruta_imagen || category.imagen_public_id)
        };
    };

    // Función para extraer solo datos necesarios de producto
    const extractProductData = (product) => {
        return {
            id: product.id,
            desc: product.desc,
            precio: product.precio,
            imageUrl: getImageUrl(product.imagen_optimizada, product.ruta_imagen),
            imageUrl2: getImageUrl(product.imagen2_optimizada, product.ruta_imagen2),
            hasImage: !!(product.ruta_imagen || product.imagen_public_id || product.image_public_id2),
            variations: product.Variations || product.variations || [],
            stock_total: product.stock_total || 0,
            disponible: product.disponible !== false,
            ruta_imagen: product.ruta_imagen,
            ruta_imagen2: product.ruta_imagen2,
            imagen_public_id: product.imagen_public_id,
            image_public_id2: product.imagen_public_id2,
            imagen_optimizada: product.imagen_optimizada,
            imagen2_optimizada: product.imagen2_optimizada,
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
                    
                    const categoryRes = await fetch(`${process.env.REACT_APP_API_URL}/categories/byId`, {
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
                    
                    
                    const categoryData = categoryJson.success ? categoryJson.data : categoryJson;
                    setCurrentCategory(categoryData.desc);
                    
                  
                    const subRes = await fetch(`${process.env.REACT_APP_API_URL}/categories/subcategories`, {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({ parent_id: parentId })
                    });
                    const subJson = await subRes.json();

                    if(subJson.data.length > 0){
                        const subcategorias = subJson.success ? subJson.data : subJson;
                        
                        if (subcategorias && subcategorias.length > 0) {
                          
                            const categoriesWithImages = subcategorias.map(extractCategoryData);
                            setCategoriesArray(categoriesWithImages);
                            setProductsArray([]);
                            setFeatured([]);
                            return;
                        }
                    }
                    
                   
                    const productsRes = await fetch(`${process.env.REACT_APP_API_URL}/products/byCategory`, {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({ category_id: parentId })
                    });
                    
                    if (productsRes.ok) {
                        const productsJson = await productsRes.json();
                        
                      
                        let productos;
                        if (productsJson.success) {
                            productos = productsJson.data.products || productsJson.data;
                        } else {
                            productos = productsJson;
                        }
                        
                       
                        const productsWithImages = Array.isArray(productos) 
                            ? productos.map(extractProductData)
                            : [];
                        
                        setProductsArray(productsWithImages);
                        setCategoriesArray([]);
                        setFeatured([]);
                    } else {
                        throw new Error("Error al obtener productos");
                    }
                    
                } else {
                    const res = await fetch(`${process.env.REACT_APP_API_URL}/categories/`, {
                        method: "GET",
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        }
                    });
                    
                    if (res.ok) {
                        const dataJson = await res.json();
                        
          
                        const data = dataJson.success ? dataJson.data : dataJson;
                        
               
                        const categoriesWithImages = Array.isArray(data) 
                            ? data.map(extractCategoryData)
                            : [];
                        
                        setCategoriesArray(categoriesWithImages);
                        setProductsArray([]);
                        setCurrentCategory("Categorías");
                        const res2 = await fetch(`${process.env.REACT_APP_API_URL}/products/featured?limit=4`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json"    
                            }
                        });
                        if(res2.ok){
                            const data2Json = await res2.json();
                            const data2 = data2Json.success ? data2Json.data : data2Json;
                            const featuredWithImages = Array.isArray(data2)
                            ? data2.map(extractProductData)
                            : [];
                            setFeatured(featuredWithImages);

                        }
                    } else {
                        throw new Error("Error al obtener categorías");
                    }
                }
            } catch (error) {
                if (error.message === "CATEGORY_NOT_FOUND") {
                    setError("CATEGORY_NOT_FOUND");
                } else {
                    setError(error.message);
                }
                setCategoriesArray([]);
                setProductsArray([]);
                setFeatured([])
            } finally { 
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId]);

    if (loading) {
        return (
            <LoadingSpinner/>
        );
    }

    if (error === "CATEGORY_NOT_FOUND") {
        return <Error404 message={`La categoría no existe`} />;
    }

    return (
        <div className="list-background">
            {productsArray.length > 0 ? (
                <div className="products-list-background">
                    <h1 className="products-list-title">{currentCategory||"Categorías"}</h1>
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
                    <h1 className="categories-list-title">{currentCategory||"Categorías"}</h1>
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
            {featured.length > 0 ? (
                <div className="featured_background">
                    <h1 className="featured_title">Productos destacados</h1>
                    {featured.map((featured_product) => (
                        
                            <ListedProduct 
                            key={featured_product.id}
                            product={featured_product}
                            onClick={() => getProductDetail(featured_product)}
                            />
                    ))}
                </div>
            ):(null)}
            
        </div>
    );

}
export default CategoryList;