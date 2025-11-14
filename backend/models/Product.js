import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'El SKU es requerido'],
    unique: true,
    trim: true,
    uppercase: true
  },
  images: [{
    type: String,
    default: []
  }],
  sizes: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  cost: {
    type: Number,
    required: [true, 'El costo es requerido'],
    min: [0, 'El costo no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
productSchema.index({ name: 'text', category: 'text' });
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
