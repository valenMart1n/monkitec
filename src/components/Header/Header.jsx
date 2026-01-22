import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { Icon } from '../Icon';
import './Header.css';
import logo from '../../img/logo.png';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import React, { useContext, useState } from "react";
import CartList from "../CartList/CartList";
import { CartContext } from '../../context/ShoppingCartContext';

function Header(){
     const navigate = useNavigate();
     const {cart, setCart, clearCart} = useContext(CartContext);
    return(
        
        <header className="header-background">
            <div className="title-background" onClick={() => navigate(`${process.env.REACT_APP_CLIENT_URL}/`)}>
            <img src={logo} className='image-logo'/>
            <p className='title'>Monkitec</p>
            </div>
            <div className="shopping-cart-container">
            <Icon icon={faShoppingCart} css="shopping-cart-logo" onClick={() => navigate(`${process.env.REACT_APP_CLIENT_URL}/shopping-cart`)}/>
            <p style={{fontSize: "16px"}}>({cart.length})</p>
            </div>
        </header>
    )
}
export default Header;
