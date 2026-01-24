import ReactPixel from 'react-facebook-pixel';

class FacebookServiceSimple {
  constructor() {
    this.pixelId = process.env.REACT_APP_PIXEL_ID;
    this.initialized = false;
    this.pixelLoaded = false;
  }

  init() {
    if (!this.pixelId) {
      console.warn('⚠️ Facebook Pixel ID no configurado');
      return;
    }

    if (!this.initialized) {
      try {
        const options = {
          autoConfig: true,
          debug: false,
        };
        
        ReactPixel.init(this.pixelId, {}, options);
        ReactPixel.pageView();
        
        this.initialized = true;
        this.pixelLoaded = true;
       // console.log('✅ Facebook Pixel inicializado');
        
      } catch (error) {
        console.warn('⚠️ Facebook Pixel bloqueado por navegador/extensión');
        console.warn('ℹ️ Esto es normal en desarrollo con bloqueadores');
        this.initialized = true; // Marcamos como "inicializado" pero sin Pixel
        this.pixelLoaded = false;
      }
    }
  }

  trackEvent(eventName, datos = {}) {
    if (this.initialized && this.pixelLoaded) {
      try {
        ReactPixel.track(eventName, datos);
       // console.log(`📊 Evento Facebook: ${eventName}`, datos);
      } catch (error) {
       // console.warn(`⚠️ No se pudo enviar evento ${eventName}:`, error.message);
      }
    } else if (this.initialized && !this.pixelLoaded) {
      // Simular envío para desarrollo (sin error)
     // console.log(`[SIMULADO] Evento Facebook: ${eventName}`, datos);
    }
  }

  // Métodos específicos con simulación
  trackViewProduct(productoNombre, productoId, precio) {
    const datos = {
      content_name: productoNombre,
      content_ids: [productoId],
      content_type: 'product',
      value: precio,
      currency: 'ARS'
    };
    
    if (this.pixelLoaded) {
      ReactPixel.track('ViewContent', datos);
    }
    //console.log(`📊 ${this.pixelLoaded ? 'Enviado' : '[Simulado]'} ViewContent:`, datos);
  }



  trackAddToCart(productoNombre, productoId, precio, cantidad = 1) {
    this.trackEvent('AddToCart', {
      content_ids: [productoId],
      content_name: productoNombre,
      content_type: 'product',
      value: precio,
      currency: 'ARS',
    });
  }

  trackStartCheckout(total, cantidadItems) {
    this.trackEvent('InitiateCheckout', {
      value: total,
      currency: 'ARS',
      num_items: cantidadItems
    });
  }

  // NUEVO: Evento Agregar Información de Pago
  trackAddPaymentInfo(metodoPago, valor, moneda = 'ARS') {
    this.trackEvent('AddPaymentInfo', {
      value: valor,
      currency: moneda,
      payment_method: metodoPago
    });
  }
}

// Crear y exportar una sola instancia
const facebookService = new FacebookServiceSimple();
export default facebookService;