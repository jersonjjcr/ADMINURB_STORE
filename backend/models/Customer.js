import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: String
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  whatsappNumber: {
    type: String,
    required: [true, 'El número de WhatsApp es requerido'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-()]+$/.test(v);
      },
      message: 'Número de WhatsApp inválido'
    }
  },
  creditHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale'
  }],
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentHistory: [paymentHistorySchema],
  lastReminder: {
    type: Date,
    default: null
  },
  nextPaymentDate: {
    type: Date,
    default: null
  },
  paymentReminderSent: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices
customerSchema.index({ name: 'text' });
customerSchema.index({ balance: 1 });
customerSchema.index({ lastReminder: 1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
