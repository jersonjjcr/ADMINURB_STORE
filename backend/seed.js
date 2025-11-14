import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import Customer from './models/Customer.js';
import Sale from './models/Sale.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Iniciando seed de datos...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Limpiar colecciones existentes
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    console.log('🗑️  Colecciones limpiadas');
    
    // Crear productos de ejemplo
    const products = await Product.create([
      {
        name: 'Camiseta Urban Básica',
        sku: 'URB-CAM-001',
        images: ['https://via.placeholder.com/400x400?text=Camiseta'],
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Camisetas',
        price: 299,
        cost: 150,
        stock: 25
      },
      {
        name: 'Jeans Slim Fit',
        sku: 'URB-JEA-001',
        images: ['https://via.placeholder.com/400x400?text=Jeans'],
        sizes: ['28', '30', '32', '34', '36'],
        category: 'Pantalones',
        price: 699,
        cost: 350,
        stock: 15
      },
      {
        name: 'Sudadera con Capucha',
        sku: 'URB-SUD-001',
        images: ['https://via.placeholder.com/400x400?text=Sudadera'],
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Sudaderas',
        price: 549,
        cost: 280,
        stock: 18
      },
      {
        name: 'Gorra Urban Logo',
        sku: 'URB-GOR-001',
        images: ['https://via.placeholder.com/400x400?text=Gorra'],
        sizes: ['Única'],
        category: 'Accesorios',
        price: 199,
        cost: 80,
        stock: 30
      },
      {
        name: 'Chamarra Bomber',
        sku: 'URB-CHA-001',
        images: ['https://via.placeholder.com/400x400?text=Chamarra'],
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Chamarras',
        price: 899,
        cost: 450,
        stock: 8
      },
      {
        name: 'Playera Estampada',
        sku: 'URB-PLA-001',
        images: ['https://via.placeholder.com/400x400?text=Playera'],
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Camisetas',
        price: 349,
        cost: 180,
        stock: 22
      },
      {
        name: 'Shorts Deportivos',
        sku: 'URB-SHO-001',
        images: ['https://via.placeholder.com/400x400?text=Shorts'],
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Pantalones',
        price: 399,
        cost: 200,
        stock: 20
      },
      {
        name: 'Calcetines Pack x3',
        sku: 'URB-CAL-001',
        images: ['https://via.placeholder.com/400x400?text=Calcetines'],
        sizes: ['Única'],
        category: 'Accesorios',
        price: 149,
        cost: 60,
        stock: 45
      },
      {
        name: 'Chamarra Mezclilla',
        sku: 'URB-CHA-002',
        images: ['https://via.placeholder.com/400x400?text=Chamarra+Mezclilla'],
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'Chamarras',
        price: 799,
        cost: 400,
        stock: 3
      },
      {
        name: 'Mochila Urban',
        sku: 'URB-MOC-001',
        images: ['https://via.placeholder.com/400x400?text=Mochila'],
        sizes: ['Única'],
        category: 'Accesorios',
        price: 499,
        cost: 250,
        stock: 12
      }
    ]);
    
    console.log(`✅ ${products.length} productos creados`);
    
    // Crear clientes de ejemplo
    const customers = await Customer.create([
      {
        name: 'Juan Pérez',
        whatsappNumber: '+525512345678',
        balance: 0,
        notes: 'Cliente frecuente'
      },
      {
        name: 'María González',
        whatsappNumber: '+525523456789',
        balance: 0,
        notes: ''
      },
      {
        name: 'Carlos Ramírez',
        whatsappNumber: '+525534567890',
        balance: 0,
        notes: ''
      },
      {
        name: 'Ana López',
        whatsappNumber: '+525545678901',
        balance: 0,
        notes: 'Prefiere pagar en efectivo'
      },
      {
        name: 'Luis Martínez',
        whatsappNumber: '+525556789012',
        balance: 0,
        notes: ''
      }
    ]);
    
    console.log(`✅ ${customers.length} clientes creados`);
    
    // Crear algunas ventas de ejemplo
    const sales = [];
    
    // Venta 1 - Efectivo
    const sale1 = await Sale.create({
      items: [
        {
          product: products[0]._id,
          productName: products[0].name,
          size: 'M',
          quantity: 2,
          unitPrice: products[0].price,
          subtotal: products[0].price * 2
        }
      ],
      paymentMethod: 'efectivo',
      total: products[0].price * 2,
      isCredit: false,
      status: 'completada'
    });
    
    // Actualizar stock
    products[0].stock -= 2;
    await products[0].save();
    
    // Venta 2 - Crédito
    const sale2 = await Sale.create({
      items: [
        {
          product: products[1]._id,
          productName: products[1].name,
          size: '32',
          quantity: 1,
          unitPrice: products[1].price,
          subtotal: products[1].price
        },
        {
          product: products[3]._id,
          productName: products[3].name,
          size: 'Única',
          quantity: 1,
          unitPrice: products[3].price,
          subtotal: products[3].price
        }
      ],
      paymentMethod: 'credito',
      total: products[1].price + products[3].price,
      isCredit: true,
      customer: customers[0]._id,
      status: 'completada'
    });
    
    // Actualizar cliente con crédito
    customers[0].balance = sale2.total;
    customers[0].creditHistory.push(sale2._id);
    await customers[0].save();
    
    // Actualizar stocks
    products[1].stock -= 1;
    products[3].stock -= 1;
    await products[1].save();
    await products[3].save();
    
    // Venta 3 - Tarjeta
    const sale3 = await Sale.create({
      items: [
        {
          product: products[2]._id,
          productName: products[2].name,
          size: 'L',
          quantity: 1,
          unitPrice: products[2].price,
          subtotal: products[2].price
        }
      ],
      paymentMethod: 'tarjeta',
      total: products[2].price,
      isCredit: false,
      status: 'completada'
    });
    
    products[2].stock -= 1;
    await products[2].save();
    
    // Venta 4 - Otro crédito
    const sale4 = await Sale.create({
      items: [
        {
          product: products[4]._id,
          productName: products[4].name,
          size: 'M',
          quantity: 1,
          unitPrice: products[4].price,
          subtotal: products[4].price
        }
      ],
      paymentMethod: 'credito',
      total: products[4].price,
      isCredit: true,
      customer: customers[2]._id,
      status: 'completada'
    });
    
    customers[2].balance = sale4.total;
    customers[2].creditHistory.push(sale4._id);
    customers[2].lastReminder = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 días atrás
    await customers[2].save();
    
    products[4].stock -= 1;
    await products[4].save();
    
    console.log(`✅ 4 ventas de ejemplo creadas`);
    
    console.log('\n📊 Resumen de datos:');
    console.log(`   Productos: ${products.length}`);
    console.log(`   Clientes: ${customers.length}`);
    console.log(`   Clientes con deuda: 2`);
    console.log(`   Ventas: 4`);
    console.log(`   Productos con stock bajo (<5): ${products.filter(p => p.stock < 5).length}`);
    
    console.log('\n✅ Seed completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Desconectado de MongoDB');
  }
};

// Ejecutar seed
seedData();
