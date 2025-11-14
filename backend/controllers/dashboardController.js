import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

// Obtener métricas del dashboard
export const getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Ventas del día
    const todaySales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);
    
    // Ventas del mes
    const monthSales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: firstDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);
    
    // Productos con stock bajo (≤ 5)
    const lowStockProducts = await Product.find({
      stock: { $lte: 5 }
    }).sort({ stock: 1 }).limit(10);
    
    // Clientes con deuda
    const customersWithDebt = await Customer.find({
      balance: { $gt: 0 }
    }).sort({ balance: -1 }).limit(10);
    
    // Total de productos
    const totalProducts = await Product.countDocuments();
    
    // Total de clientes
    const totalCustomers = await Customer.countDocuments();
    
    // Deuda total pendiente
    const totalDebt = await Customer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$balance' }
        }
      }
    ]);
    
    // Obtener ventas recientes
    const recentSales = await Sale.find()
      .populate('customer', 'name whatsappNumber')
      .sort({ date: -1 })
      .limit(10);

    // Calcular total de todas las ventas
    const allSales = await Sale.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      totalSales: allSales[0]?.total || 0,
      totalProducts: totalProducts,
      lowStockProducts: lowStockProducts.length,
      totalDebt: totalDebt[0]?.total || 0,
      customersWithDebt: customersWithDebt,
      recentSales: recentSales,
      lowStockItems: lowStockProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo métricas del dashboard',
      error: error.message
    });
  }
};
