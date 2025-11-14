import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String, // Denormalizado para mantener historial
  size: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const saleSchema = new mongoose.Schema({
  items: [saleItemSchema],
  paymentMethod: {
    type: String,
    required: true,
    enum: ['efectivo', 'tarjeta', 'transferencia', 'credito'],
    default: 'efectivo'
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  isCredit: {
    type: Boolean,
    default: false
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: function() {
      return this.isCredit === true;
    }
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completada', 'pendiente', 'cancelada'],
    default: 'completada'
  }
}, {
  timestamps: true
});

// Índices
saleSchema.index({ date: -1 });
saleSchema.index({ customer: 1 });
saleSchema.index({ isCredit: 1 });

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
