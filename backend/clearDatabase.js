import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Sale from './models/Sale.js';
import Customer from './models/Customer.js';
import NotificationLog from './models/NotificationLog.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('🗑️  Eliminando todos los datos...');
    
    // Eliminar todas las colecciones
    await Sale.deleteMany({});
    console.log('✅ Ventas eliminadas');
    
    await Product.deleteMany({});
    console.log('✅ Productos eliminados');
    
    await Customer.deleteMany({});
    console.log('✅ Clientes eliminados');
    
    await NotificationLog.deleteMany({});
    console.log('✅ Logs de notificaciones eliminados');

    console.log('\n🎉 Base de datos completamente limpia!');
    console.log('Ahora puedes empezar a agregar tus propios datos.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

clearDatabase();
