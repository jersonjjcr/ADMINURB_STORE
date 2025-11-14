import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import mongoose from 'mongoose';

// Crear una nueva venta (con transacción para actualizar stock)
export const createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { items, paymentMethod, customer, isCredit } = req.body;
    
    // Validar que si es crédito, debe tener customer
    if (isCredit && !customer) {
      throw new Error('Las ventas a crédito deben tener un cliente asociado');
    }
    
    // Preparar items y calcular total
    let total = 0;
    const saleItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      
      if (!product) {
        throw new Error(`Producto ${item.product} no encontrado`);
      }
      
      // Validar stock suficiente
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
      }
      
      // Calcular subtotal
      const subtotal = item.quantity * item.unitPrice;
      total += subtotal;
      
      // Preparar item de la venta
      saleItems.push({
        product: product._id,
        productName: product.name,
        size: item.size || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal
      });
      
      // Decrementar stock
      product.stock -= item.quantity;
      await product.save({ session });
    }
    
    // Crear la venta
    const sale = new Sale({
      items: saleItems,
      paymentMethod,
      total,
      isCredit: isCredit || false,
      customer: isCredit ? customer : undefined,
      status: 'completada'
    });
    
    await sale.save({ session });
    
    // Si es crédito, actualizar el balance del cliente
    if (isCredit && customer) {
      const customerDoc = await Customer.findById(customer).session(session);
      
      if (!customerDoc) {
        throw new Error('Cliente no encontrado');
      }
      
      customerDoc.balance += total;
      customerDoc.creditHistory.push(sale._id);
      await customerDoc.save({ session });
    }
    
    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      message: 'Venta registrada exitosamente',
      data: sale
    });
    
  } catch (error) {
    await session.abortTransaction();
    
    res.status(400).json({
      success: false,
      message: 'Error registrando venta',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Obtener todas las ventas
export const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, paymentMethod } = req.query;
    
    let query = {};
    
    // Filtro por rango de fechas
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Filtro por método de pago
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('customer', 'name whatsappNumber')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Sale.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: sales,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ventas',
      error: error.message
    });
  }
};

// Obtener una venta por ID
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('customer', 'name whatsappNumber balance')
      .populate('items.product');
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo venta',
      error: error.message
    });
  }
};

// Obtener ventas del día
export const getTodaySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sales = await Sale.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('customer', 'name');
    
    const total = sales.reduce((sum, sale) => sum + sale.total, 0);
    
    res.json({
      success: true,
      data: {
        sales,
        count: sales.length,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo ventas del día',
      error: error.message
    });
  }
};

// Obtener estadísticas de ventas
export const getSalesStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }
    
    const stats = await Sale.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};
