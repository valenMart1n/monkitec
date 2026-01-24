import { useEffect, useState } from "react";
import "./SearchModal.css"
import { Icon } from "../Icon";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function SearchModal({onClose}){
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchActive, setSearchActive] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!onClose) return;

        const fetchProducts = async () => {
            setLoading(true);
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/products`);
                const data = await response.json();
                setProducts(data.data);
                setFilteredProducts(data.data);
            }catch(error){
                console.error("Error obteniendo productos: ", error);
            }finally{
                setLoading(false);
            }
        }
        fetchProducts();
    }, [onClose]);

    useEffect(() => {
        if(!searchTerm){
            setFilteredProducts(products);
            return;
        }

        const results = products.filter(product => 
            product.desc.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredProducts(results);
    }, [searchTerm, products]);

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

    const handleClose = () => {
        setSearchTerm("");
        setFilteredProducts([]);
        setLoading(true);
        onClose();
    }

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
        <div className={`search-modal-background ${searchActive ? ("active"):("")}`}>
            <div className='search-bar-container'>
                <Icon css="close-search-bar" icon={faXmark} onClick={handleClose}/>
                <input placeholder='¿Qué estás buscando?' className='search-bar' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                
            </div>
            
            
                <div className="search-results">
                    {filteredProducts.length > 0 && searchTerm != ""? (
                        filteredProducts.map(product => (
                            <div className="product-result"  onClick={() => {getProductDetail(product)
                                handleClose()
                            }}>
                                <img 
                                    className="product-result-image"
                                    src={getImageUrl(product.imagen_optimizada, product.ruta_imagen)}
                                />
                                <section className="product-result-data">
                                <h4 className="product-result-desc">{product.desc}</h4>
                                <strong>${product.precio.toLocaleString('es-AR')}</strong>
                                </section>
                            </div>
                        ))
                    ): searchTerm ? (
                        <p>No se encontraron productos</p>
                    ): null}
                </div>

        </div>
    )
}

export default SearchModal;