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
  // Ejecutar todos los lunes a las 9:00 AM
  cron.schedule('0 9 * * 1', async () => {
    console.log('🔔 Iniciando job de recordatorios de deuda...');
    await sendDebtReminders();
  });
  
  console.log('✅ Cron job programado: Recordatorios cada lunes a las 9:00 AM');
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
 * Función para ejecutar el job manualmente (útil para pruebas)
 */
export const runManualReminder = async () => {
  console.log('🔧 Ejecutando recordatorio manual...');
  await sendDebtReminders();
};

export default {
  startCronJobs,
  sendDebtReminders,
  runManualReminder
};
