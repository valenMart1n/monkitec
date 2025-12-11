import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { Icon } from '../Icon';
import './Header.css';
import logo from '../../img/logo.png';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import CartList from "../CartList/CartList";

function Header(){
    /* const [cart, setCart] = useContext(CartContext); // Estado para manejar el carrito
    const total = (cart ? cart.reduce((acc, curr) => {
        return acc + curr.cantidad;
    }, 0) : console.log("Está vacío"));
     */
     const navigate = useNavigate();
    return(
        
        <header className="header-background">
           <Icon icon={faBars} css="fa-bars"/>
           <div className="title-background">
            <img src={logo} className='image-logo'/>
            <p className='title'>Monkitec</p>
            </div>
            <div className="shopping-cart-container">
            <Icon icon={faShoppingCart} css="shopping-cart-logo" onClick={() => navigate("/shopping-cart")}/>
            </div>
        </header>
    )
}
export default Header;
