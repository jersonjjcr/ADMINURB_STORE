import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

let client = null;

// Inicializar cliente de Twilio solo si las credenciales están configuradas
if (accountSid && authToken && accountSid !== 'your_account_sid_here') {
  client = twilio(accountSid, authToken);
}

/**
 * Enviar mensaje de WhatsApp a un cliente
 * @param {string} to - Número de WhatsApp del destinatario (formato: +52xxxxxxxxxx)
 * @param {string} message - Mensaje a enviar
 * @returns {Promise<object>} - Respuesta de Twilio o error
 */
export const sendWhatsAppMessage = async (to, message) => {
  try {
    if (!client) {
      console.warn('⚠️  Twilio no está configurado. Mensaje simulado:');
      console.log(`📱 Para: ${to}`);
      console.log(`💬 Mensaje: ${message}`);
      
      return {
        success: true,
        simulated: true,
        message: 'Twilio no configurado - mensaje simulado',
        to,
        body: message
      };
    }
    
    // Asegurar formato correcto del número (agregar whatsapp: si no lo tiene)
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    const response = await client.messages.create({
      from: whatsappFrom,
      to: formattedTo,
      body: message
    });
    
    console.log(`✅ Mensaje enviado a ${to}: ${response.sid}`);
    
    return {
      success: true,
      simulated: false,
      sid: response.sid,
      status: response.status,
      to: response.to,
      dateCreated: response.dateCreated
    };
    
  } catch (error) {
    console.error(`❌ Error enviando mensaje a ${to}:`, error.message);
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      to
    };
  }
};

/**
 * Crear mensaje de recordatorio de deuda personalizado
 * @param {string} customerName - Nombre del cliente
 * @param {number} balance - Saldo pendiente
 * @returns {string} - Mensaje formateado
 */
export const createDebtReminderMessage = (customerName, balance) => {
  const formattedBalance = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(balance);
  
  return `Hola ${customerName} 👋

Desde *Urban Store* te recordamos que tienes un saldo pendiente de *${formattedBalance}*.

Por favor, acércate cuando puedas para liquidar tu cuenta. 

¡Gracias por tu preferencia! 🙌`;
};

/**
 * Validar formato de número de WhatsApp
 * @param {string} number - Número a validar
 * @returns {boolean} - true si es válido
 */
export const isValidWhatsAppNumber = (number) => {
  // Debe empezar con + y tener entre 10 y 15 dígitos
  const regex = /^\+\d{10,15}$/;
  const cleanNumber = number.replace(/whatsapp:/g, '').trim();
  return regex.test(cleanNumber);
};

export default {
  sendWhatsAppMessage,
  createDebtReminderMessage,
  isValidWhatsAppNumber
};
