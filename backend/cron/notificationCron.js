import cron from 'node-cron';
import Customer from '../models/Customer.js';
import NotificationLog from '../models/NotificationLog.js';
import { sendWhatsAppMessage, createDebtReminderMessage } from '../services/twilioService.js';

/**
 * Job que se ejecuta cada 7 días para enviar recordatorios de deuda
 * Expresión cron: '0 9 * * 1' = Todos los lunes a las 9:00 AM
 * Para pruebas: '* * * * *' = Cada minuto
 */
export const startCronJobs = () => {
  // Job 1: Recordatorios de deuda semanales (lunes 9:00 AM)
  cron.schedule('0 9 * * 1', async () => {
    console.log('🔔 Iniciando job de recordatorios de deuda...');
    await sendDebtReminders();
  });
  
  // Job 2: Verificar fechas de pago diariamente (9:00 AM)
  cron.schedule('0 9 * * *', async () => {
    console.log('📅 Iniciando verificación de fechas de pago...');
    await checkPaymentDates();
  });
  
  console.log('✅ Cron jobs programados:');
  console.log('   📌 Recordatorios de deuda: Lunes 9:00 AM');
  console.log('   📌 Verificación de pagos: Diario 9:00 AM');
};

/**
 * Enviar recordatorios a clientes con deuda
 */
export const sendDebtReminders = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Buscar clientes con deuda y que no han recibido recordatorio en los últimos 7 días
    const customers = await Customer.find({
      balance: { $gt: 0 },
      $or: [
        { lastReminder: null },
        { lastReminder: { $lte: sevenDaysAgo } }
      ]
    });
    
    if (customers.length === 0) {
      console.log('ℹ️  No hay clientes pendientes de recordatorio');
      return;
    }
    
    console.log(`📋 Encontrados ${customers.length} clientes para recordar`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Enviar recordatorio a cada cliente
    for (const customer of customers) {
      try {
        // Crear mensaje personalizado
        const message = createDebtReminderMessage(customer.name, customer.balance);
        
        // Enviar mensaje por WhatsApp
        const result = await sendWhatsAppMessage(customer.whatsappNumber, message);
        
        // Guardar log de la notificación
        const log = new NotificationLog({
          customer: customer._id,
          customerName: customer.name,
          whatsappNumber: customer.whatsappNumber,
          message,
          status: result.success ? 'sent' : 'failed',
          providerResponse: result,
          error: result.error || null
        });
        
        await log.save();
        
        if (result.success) {
          // Actualizar fecha del último recordatorio
          customer.lastReminder = new Date();
          await customer.save();
          
          successCount++;
          console.log(`✅ Recordatorio enviado a ${customer.name}`);
        } else {
          failCount++;
          console.error(`❌ Falló el envío a ${customer.name}: ${result.error}`);
        }
        
        // Esperar 1 segundo entre cada envío para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        failCount++;
        console.error(`❌ Error procesando cliente ${customer.name}:`, error.message);
        
        // Guardar log del error
        try {
          await NotificationLog.create({
            customer: customer._id,
            customerName: customer.name,
            whatsappNumber: customer.whatsappNumber,
            message: 'Error al procesar',
            status: 'failed',
            error: error.message
          });
        } catch (logError) {
          console.error('Error guardando log:', logError);
        }
      }
    }
    
    console.log(`\n📊 Resumen de recordatorios:`);
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Fallidos: ${failCount}`);
    console.log(`   📝 Total procesados: ${customers.length}`);
    
  } catch (error) {
    console.error('❌ Error en job de recordatorios:', error);
  }
};

/**
 * Función para verificar y enviar recordatorios de fechas de pago programadas
 * Se ejecuta diariamente a las 9:00 AM
 */
const checkPaymentDates = async () => {
  try {
    console.log('\n📅 Verificando fechas de pago programadas...');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Buscar clientes con fecha de pago para hoy que aún tengan deuda
    const customers = await Customer.find({
      nextPaymentDate: { $lte: now },
      balance: { $gt: 0 },
      paymentReminderSent: false
    });
    
    console.log(`📋 Clientes con pago vencido hoy: ${customers.length}`);
    
    if (customers.length === 0) {
      console.log('✅ No hay pagos programados para hoy');
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const customer of customers) {
      try {
        // Formatear fecha de pago
        const paymentDate = new Date(customer.nextPaymentDate);
        const formattedDate = paymentDate.toLocaleDateString('es-CO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        // Mensaje personalizado para recordatorio de pago
        const message = `🔔 *RECORDATORIO DE PAGO - Urban Store*\n\n` +
          `Hola ${customer.name},\n\n` +
          `Te recordamos que hoy *${formattedDate}* vence tu pago pendiente.\n\n` +
          `💰 Saldo pendiente: $${customer.balance.toFixed(2)}\n\n` +
          `Por favor realiza tu pago lo antes posible para mantener tu crédito activo.\n\n` +
          `Gracias por tu preferencia 🙏`;
        
        console.log(`📤 Enviando recordatorio a ${customer.name} (${customer.whatsappNumber})...`);
        
        // Enviar mensaje de WhatsApp
        await sendWhatsAppMessage(customer.whatsappNumber, message);
        
        // Marcar recordatorio como enviado
        customer.paymentReminderSent = true;
        await customer.save();
        
        // Guardar log de notificación exitosa
        await NotificationLog.create({
          customer: customer._id,
          customerName: customer.name,
          whatsappNumber: customer.whatsappNumber,
          message: message,
          status: 'sent',
          sentAt: new Date()
        });
        
        successCount++;
        console.log(`   ✅ Recordatorio enviado exitosamente`);
        
        // Esperar 1 segundo entre envíos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        failCount++;
        console.error(`❌ Error procesando recordatorio para ${customer.name}:`, error.message);
        
        try {
          await NotificationLog.create({
            customer: customer._id,
            customerName: customer.name,
            whatsappNumber: customer.whatsappNumber,
            message: 'Error al enviar recordatorio de pago',
            status: 'failed',
            error: error.message
          });
        } catch (logError) {
          console.error('Error guardando log:', logError);
        }
      }
    }
    
    console.log(`\n📊 Resumen de recordatorios de pago:`);
    console.log(`   ✅ Exitosos: ${successCount}`);
    console.log(`   ❌ Fallidos: ${failCount}`);
    console.log(`   📝 Total procesados: ${customers.length}`);
    
  } catch (error) {
    console.error('❌ Error en job de recordatorios de pago:', error);
  }
};

/**
 * Función para ejecutar el job manualmente (útil para pruebas)
 */
export const runManualReminder = async () => {
  console.log('🔧 Ejecutando recordatorio manual...');
  await sendDebtReminders();
};

/**
 * Función para ejecutar el job de fechas de pago manualmente
 */
export const runManualPaymentCheck = async () => {
  console.log('🔧 Ejecutando verificación de pagos manual...');
  await checkPaymentDates();
};

export default {
  startCronJobs,
  sendDebtReminders,
  checkPaymentDates,
  runManualReminder,
  runManualPaymentCheck
};
