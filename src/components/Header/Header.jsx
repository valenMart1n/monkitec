import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { Icon } from '../Icon';
import './Header.css';
import logo from '../../img/logo.png';
import { faSearch, faShoppingCart, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import CartList from "../CartList/CartList";
import { CartContext } from '../../context/ShoppingCartContext';
import SearchModal from '../SearchModal/SearchModal';
import SearchSuggestion from '../SearchSuggestion/SearchSuggestion';

function Header(){
    const navigate = useNavigate();
    const {cart, setCart, clearCart} = useContext(CartContext);
    const [searchActive, setSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCloseSearch = () => {
        setSearchActive(false);
    }

    useEffect(() => {
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
        if(products.length === 0){
            fetchProducts();
        }
    }, []);
    
    useEffect(() => {
        if(!searchTerm){
            return;
        }
        
        const results = products.filter(product => 
            product.desc.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredProducts(results);
    }, [searchTerm, products]);
    
    return(
        
        <header className="header-background">
            
                <div className="title-background" onClick={() => navigate(`${process.env.REACT_APP_CLIENT_URL}/`)}>
                    <img src={logo} className='image-logo'/>
                    <p className='header-title'>Monkitec</p>
                </div>
            
                <div className="shopping-cart-container">
                    <div className='search-bar-header-container'>
                        <input className="search-bar-header" placeholder='¿Qué estás buscando?' onChange={(e) => setSearchTerm(e.target.value)}/>
                        <Icon icon={faSearch} css="search-bar-icon"/>
                        {searchTerm && (<SearchSuggestion products={filteredProducts}/>)}
                    </div>
                    
                    <Icon icon={faSearch} css="search-button" onClick={() => {setSearchActive(!searchActive)
                        console.log("Valor search: ", searchActive)
                    }}/>
                    <Icon icon={faShoppingCart} css="shopping-cart-logo" onClick={() => navigate(`${process.env.REACT_APP_CLIENT_URL}/shopping-cart`)}/>
                    <p style={{fontSize: "16px"}}>({cart.length})</p>
                </div>
                {searchActive && (
                    <SearchModal onClose={handleCloseSearch}/>
                )}
                
        </header>
    )
}
export default Header;
