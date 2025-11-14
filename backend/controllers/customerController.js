import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import mongoose from 'mongoose';

// Crear un nuevo cliente
export const createCustomer = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creando cliente',
      error: error.message
    });
  }
};

// Obtener todos los clientes
export const getCustomers = async (req, res) => {
  try {
    const { search, hasDebt, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    // Búsqueda por nombre
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Filtrar clientes con deuda
    if (hasDebt === 'true') {
      query.balance = { $gt: 0 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ balance: -1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Customer.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo clientes',
      error: error.message
    });
  }
};

// Obtener un cliente por ID con su historial
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate({
        path: 'creditHistory',
        options: { sort: { date: -1 } }
      });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo cliente',
      error: error.message
    });
  }
};

// Actualizar cliente
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error actualizando cliente',
      error: error.message
    });
  }
};

// Eliminar cliente
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Verificar que no tenga deuda pendiente
    if (customer.balance > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un cliente con deuda pendiente'
      });
    }
    
    await customer.deleteOne();
    
    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error eliminando cliente',
      error: error.message
    });
  }
};

// Registrar pago (parcial o total)
export const registerPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { customerId } = req.params;
    const { amount, note } = req.body;
    
    const customer = await Customer.findById(customerId).session(session);
    
    if (!customer) {
      throw new Error('Cliente no encontrado');
    }
    
    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }
    
    if (amount > customer.balance) {
      throw new Error('El monto excede la deuda pendiente');
    }
    
    // Actualizar balance
    customer.balance -= amount;
    
    // Agregar al historial de pagos
    customer.paymentHistory.push({
      amount,
      note: note || '',
      date: new Date()
    });
    
    // Si el cliente saldó su deuda completamente, resetear campos de recordatorio
    if (customer.balance === 0) {
      customer.nextPaymentDate = null;
      customer.paymentReminderSent = false;
    }
    
    await customer.save({ session });
    await session.commitTransaction();
    
    res.json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: {
        customer,
        newBalance: customer.balance
      }
    });
    
  } catch (error) {
    await session.abortTransaction();
    
    res.status(400).json({
      success: false,
      message: 'Error registrando pago',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Obtener clientes morosos (con deuda y sin recordatorio reciente)
export const getDelinquentCustomers = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const customers = await Customer.find({
      balance: { $gt: 0 },
      $or: [
        { lastReminder: null },
        { lastReminder: { $lte: sevenDaysAgo } }
      ]
    }).sort({ balance: -1 });
    
    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo clientes morosos',
      error: error.message
    });
  }
};
