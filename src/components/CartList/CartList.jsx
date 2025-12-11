import "./CartList.css"
import { CartContext } from "../../context/ShoppingCartContext"; 
import { useContext, useState, useEffect } from "react";
import { Icon } from "../Icon";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function CartList() {
  const [cart, setCart] = useContext(CartContext);
  const [total, setTotal] = useState(0); 

  // Calcular el total cuando cambie el carrito
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      return sum + (item.precio * item.cantidad);
    }, 0);
    
    setTotal(newTotal);
  }, [cart]); // Se ejecuta cada vez que cambia el carrito

  const getItemImage = (item) => {
    if (item.imageUrl) return item.imageUrl;
    if (item.ruta_imagen) return item.ruta_imagen;
    if (item.imagen_optimizada) {
      return item.imagen_optimizada.thumbnail || 
             item.imagen_optimizada.medium || 
             item.imagen_optimizada.original;
    }
    if (item.imagen) return item.imagen;
    return "/default-product.png";
  };

  const removeItem = (id) => {
    setCart((currItems) => {
      const itemToRemove = currItems.find((item) => item.id === id);
      
      if (!itemToRemove) return currItems;
      
      if (itemToRemove.cantidad === 1) {
        // Eliminar el item completamente
        return currItems.filter((item) => item.id !== id);
      } else {
        // Reducir la cantidad
        return currItems.map((item) => {
          if (item.id === id) {
            return { ...item, cantidad: item.cantidad - 1 };
          }
          return item;
        });
      }
    });
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  return (
    <div className="cart-list-background"> 
      {cart.map((item, index) => (
        <div className="cart-item" key={`${item.id}-${index}`}>
          <img 
            className="item-image" 
            src={getItemImage(item)} 
            alt={item.desc}
            onError={(e) => {
              e.target.src = "/default-product.png";
            }}
          />
          <div className="item-info-container">
            <section className="item-section">
              <p className="item-title">
                {item.desc} 
                {item.varianteDesc && ` (${item.varianteDesc})`}
              </p>
              <button 
                onClick={() => removeItem(item.id)} 
                className="delete-item-button"
              >
                <Icon icon={faXmark} css="delete-item-button"/>
              </button>
            </section>
            <section className="item-section">
              <p className="item-cantidad">{item.cantidad} x</p>
              <p className="item-precio">
                {formatPrice(item.precio)} = {formatPrice(item.precio * item.cantidad)}
              </p>
            </section>
          </div>  
        </div>
      ))}
      
      {cart.length > 0 ? (
        <div className="cart-summary">
          <div className="total-section">
            <div className="total-label">
            <p>Total:</p> <p className="label-precio">{formatPrice(total)}</p></div>
          </div>
         
          <button 
            className="checkout-button"
            onClick={() => {
              // Aquí iría la lógica para finalizar la compra
              alert(`Total a pagar: ${formatPrice(total)}`);
            }}
          >
            Confirmar compra
          </button>
        </div>
      ) : (
        <div className="empty-cart">
          <p>Tu carrito está vacío</p>
        </div>
      )}
    </div>
  );
}

export default CartList;