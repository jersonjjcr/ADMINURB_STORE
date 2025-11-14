/**
 * Utilidades auxiliares para formateo y validaciones
 */

/**
 * Formatear moneda en pesos mexicanos
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

/**
 * Formatear fecha en español
 */
export const formatDate = (date, includeTime = true) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };
  
  return new Date(date).toLocaleDateString('es-MX', options);
};

/**
 * Validar formato de número de WhatsApp
 */
export const validateWhatsAppNumber = (number) => {
  const cleaned = number.replace(/\s/g, '');
  const regex = /^\+\d{10,15}$/;
  return regex.test(cleaned);
};

/**
 * Formatear número de WhatsApp
 */
export const formatWhatsAppNumber = (number) => {
  let cleaned = number.replace(/\D/g, '');
  
  if (!number.startsWith('+')) {
    cleaned = '+52' + cleaned;
  }
  
  return cleaned;
};

/**
 * Calcular días desde una fecha
 */
export const daysSince = (date) => {
  if (!date) return null;
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now - past);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Obtener saludo según hora del día
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

/**
 * Truncar texto
 */
export const truncate = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
