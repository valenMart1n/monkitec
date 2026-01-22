// SERVICIO SIMPLIFICADO - SIN DATOS COMPLEJOS
import {fb} from 'facebook-pixel';

class FacebookServiceSimple {
  constructor() {
    this.pixelId = process.env.REACT_APP_FACEBOOK_PIXEL_ID;
    this.initialized = false;
  }

  // ========== INICIALIZACIÓN SIMPLE ==========
  init() {
    if (!this.pixelId) {
      console.warn('⚠️ Facebook Pixel ID no configurado');
      return;
    }

    if (!this.initialized) {
      // Inicializar Pixel de forma simple
      fb.init(this.pixelId);
      fb.pageView();
      
      this.initialized = true;
      console.log('✅ Facebook Pixel inicializado');
    }
  }

  // ========== MÉTODOS BÁSICOS ==========
  
  // 1. Rastrear página
  trackPageView() {
    if (this.initialized) {
      fb.pageView();
    }
  }

  // 2. Rastrear evento GENÉRICO
  trackEvent(eventName, datos = {}) {
    if (this.initialized) {
      fb.track(eventName, datos);
      console.log(`📊 Evento Facebook: ${eventName}`, datos);
    }
  }

  // ========== EVENTOS PREDEFINIDOS (sin datos complejos) ==========
  
  // Cuando alguien VE un producto
  trackViewProduct(productoNombre, productoId, precio) {
    this.trackEvent('ViewContent', {
      content_name: productoNombre,
      content_ids: [productoId],
      content_type: 'product',
      value: precio,
      currency: 'ARS'
    });
  }

  // Cuando alguien AGREGA al carrito
  trackAddToCart(productoNombre, productoId, precio, cantidad = 1) {
    this.trackEvent('AddToCart', {
      content_ids: [productoId],
      content_name: productoNombre,
      content_type: 'product',
      value: precio,
      currency: 'ARS',
    });
  }

  // Cuando alguien INICIA checkout
  trackStartCheckout(total, cantidadItems) {
    this.trackEvent('InitiateCheckout', {
      value: total,
      currency: 'ARS',
      num_items: cantidadItems
    });
  }
}

// Crear y exportar una sola instancia
const facebookService = new FacebookServiceSimple();
export default facebookService;