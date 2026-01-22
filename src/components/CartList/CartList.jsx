import "./CartList.css"
import { CartContext } from "../../context/ShoppingCartContext"; 
import { useContext, useState, useEffect } from "react";
import { Icon } from "../Icon";
import { faCircleExclamation, faXmark, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../context/AlertContext";

function CartList() {
  const navigate = useNavigate();
  const {createToast} = useAlert();
  const [lastRemovedItem, setLastRemovedItem] = useState(null);
  const {cart, setCart, clearCart} = useContext(CartContext); // Añade clearCart aquí
  const [total, setTotal] = useState(0); 
  const [nombre, setNombre] = useState("");
  const [verifyName,setVerifyName] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [verifyDelivery, setVerifyDelivery] = useState(false);
  const [address, setAddress] = useState("");
  
  useEffect(() => {
        if (lastRemovedItem) {
            createToast({
                text: "Producto eliminado del carrito",
                tipo: "cross"
            });
            setLastRemovedItem(null); // Resetear
        }
    }, [lastRemovedItem, createToast]); 
  const handleChangeCheck = (e) => {  
    setDelivery(!delivery);
  }
   const handleInputChange = (event) => {
        setNombre(event.target.value);
    };
    const handleInputAddressChange = (event) => {
        setAddress(event.target.value);
    };
    const hasVariant = (item) => {
      if(item.varianteDesc==undefined){
        return "";
      }else{
        return "("+item.varianteDesc+")";
      }
    }
  const sendMessagge = (e) => {
        if (nombre.trim() == "") {
          e.preventDefault();
          setVerifyName(true);
        }else if(address.trim() == "" && delivery == true){
          e.preventDefault();
          setVerifyDelivery(true);
        
        } else {
          let url = "https://wa.me/" + 3434645961 + "?text=Hola soy " + nombre + 
              ", quisiera hacer un pedido de:%0a" + 
              cart.map((item, index) => (
                "- " + item.desc + hasVariant(item) + " " + item.cantidad + 
                  " x $" + item.precio + " = $" + (item.precio * item.cantidad) + "%0a"
              )) + 
              "Total: $" + total + "%0a"
              + (delivery ? "Entregar el pedido a la dirección: " + address: "Retiro el pedido personalmente");
    
    window.open(url, "_blank");
    
    clearCart();
    setNombre("");
    setAddress("");
    setDelivery(false);
    setVerifyName(false);
    setVerifyDelivery(false);
    }
    };
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      return sum + (item.precio * item.cantidad);
    }, 0);
    
    setTotal(newTotal);
  }, [cart]); 

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

  const removeItem = (id, varianteId, varianteDesc) => {
    setCart((currItems) => {
      const itemToRemove = currItems.find((item) => {
        if(item.varianteId){
          return item.id === id && item.varianteId === varianteId
        }else {
          return item.id === id && item.varianteDesc === varianteDesc;
        }

      });
      
      if (!itemToRemove) return currItems;
      
      if (itemToRemove.cantidad === 1) {
        setLastRemovedItem({id, varianteId, varianteDesc})
        return currItems.filter((item) => {
          if(item.varianteId){  
            return !(item.id === id && item.varianteId === varianteId);
          }else{
            return !(item.id === id && item.varianteDesc === varianteDesc);
          }
        });
      } else {
        return currItems.map((item) => {
          if (item.id === id && item.varianteId === varianteId) {
            return { ...item, cantidad: item.cantidad - 1 };
          }
          return item;
        });
      }
    });
  };

  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  return (
    <div className="cart-list-background"> 
    <h1 className="cart-list-title">Carrito de Compras</h1>
    <div className="items-container">
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
                onClick={() => removeItem(item.id, item.varianteId, item.varianteDesc)} 
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
      </div>
      
      {cart.length > 0 ? (
        <div className="cart-summary">
          <div className="total-section">
            <div className="total-label">
            <p>Total:</p> <p className="label-precio">{formatPrice(total)}</p></div>
          </div>
          <form className="client-data">
          <div className="client-input-container">
          <p className="cart-label-name">Nombre y apellido</p>
          <input required type="text" className={`name-input ${verifyName}`} value={nombre} onChange={handleInputChange}></input>
          </div>
          <div className="client-input-container">
          <p className="cart-label-delivery">¿Envio a domicilio? (No marcar si lo retira personalmente)</p>
          <input type="checkbox" onChange={handleChangeCheck}/>
          </div>
          <div className={`delivery-input-container ${delivery}`}>
            <p className="cart-label-address">Ingrese su dirección (Calle y Nro)</p>
            <input type="text" className={`delivery-input ${verifyDelivery}`} value={address} onChange={handleInputAddressChange}/>
          </div>
          <button 
            className="checkout-button"
            onClick={sendMessagge}
          >
            Enviar pedido por WhatsApp
          </button>
          </form>
        </div>
      ) : (
        <div className="empty-cart">
          <p><Icon icon={faCircleExclamation}/> El carrito de compras esta vacío</p>
        </div>
      )}
    </div>
  );
}

export default CartList;