import { useNavigate } from "react-router-dom";
import "./SearchSuggestion.css"
import { useState } from "react";

function SearchSuggestion({products}){
    const navigate = useNavigate();
    const [found, setFound] = useState(false);

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
                Variations: product.Variations, 
                Category: product.category,
                stock_total: product.stock_total,
                disponible: product.disponible
            } }
        });
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

    return(
        <div className={`search-suggestion-background ${!found ? ("active"):("")}`}>
            <ul className="search-suggestion-list">
                {products.map((product) => {
                    return (
                    <li className="suggestion-result" onClick={() => {getProductDetail(product)
                        setFound(true);
                        }
                    }>
                        <img
                            src={getImageUrl(product.imagen_optimizada, product.ruta_imagen)}
                            className="suggestion-image"
                        />
                        <section className="suggestion-result-data">
                            <h4 className="suggestion-result-title">{product.desc}</h4>
                            <strong>${product.precio.toLocaleString('es-AR')}</strong>
                        </section>
                    </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default SearchSuggestion;