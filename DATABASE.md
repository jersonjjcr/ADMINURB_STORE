# 📊 Estructura de Base de Datos - Urban Store

## Colecciones MongoDB

### 1. Products (Productos)

```javascript
{
  _id: ObjectId,
  name: String,              // "Camiseta Urban Básica"
  sku: String,               // "URB-CAM-001" (único)
  images: [String],          // URLs de imágenes
  sizes: [String],           // ["S", "M", "L", "XL"]
  category: String,          // "Camisetas"
  price: Number,             // 299.00
  cost: Number,              // 150.00
  stock: Number,             // 25
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `sku` (único)
- `name` (texto)
- `category`

---

### 2. Sales (Ventas)

```javascript
{
  _id: ObjectId,
  items: [
    {
      product: ObjectId,       // Referencia a Product
      productName: String,     // Denormalizado para historial
      size: String,            // "M"
      quantity: Number,        // 2
      unitPrice: Number,       // 299.00
      subtotal: Number         // 598.00
    }
  ],
  paymentMethod: String,       // "efectivo" | "tarjeta" | "credito"
  total: Number,               // 598.00
  isCredit: Boolean,           // true
  customer: ObjectId,          // Referencia a Customer (si es crédito)
  date: Date,
  status: String,              // "completada" | "pendiente" | "cancelada"
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `date` (descendente)
- `customer`
- `isCredit`

---

### 3. Customers (Clientes)

```javascript
{
  _id: ObjectId,
  name: String,                // "Juan Pérez"
  whatsappNumber: String,      // "+525512345678"
  creditHistory: [ObjectId],   // Referencias a Sales
  balance: Number,             // 1200.00 (deuda pendiente)
  paymentHistory: [
    {
      amount: Number,          // 500.00
      date: Date,
      note: String             // "Pago parcial en efectivo"
    }
  ],
  lastReminder: Date,          // Última vez que se envió recordatorio
  notes: String,               // "Cliente frecuente"
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `name` (texto)
- `balance`
- `lastReminder`

---

### 4. NotificationLogs (Logs de Notificaciones)

```javascript
{
  _id: ObjectId,
  customer: ObjectId,          // Referencia a Customer
  customerName: String,        // "Juan Pérez"
  whatsappNumber: String,      // "+525512345678"
  message: String,             // Texto del mensaje enviado
  status: String,              // "sent" | "failed" | "pending"
  providerResponse: Mixed,     // Respuesta de Twilio
  error: String,               // Mensaje de error (si aplica)
  sentAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `customer`
- `sentAt` (descendente)
- `status`

---

## Relaciones

```
Product ────┐
            │
            ├─ items ─→ Sale ─→ customer ─→ Customer
            │
            └─ creditHistory ─────────────────┘
```

### Flujo de Venta a Crédito

1. Se crea una **Sale** con `isCredit: true` y referencia a **Customer**
2. Se decrementa el `stock` de cada **Product** en la venta
3. Se actualiza el `balance` del **Customer** (suma el total)
4. Se agrega la venta al `creditHistory` del **Customer**

### Flujo de Pago

1. Cliente realiza pago (total o parcial)
2. Se decrementa el `balance` del **Customer**
3. Se registra en `paymentHistory` del **Customer**

### Flujo de Notificaciones

1. **Cron job** corre cada lunes a las 9:00 AM
2. Busca clientes con:
   - `balance > 0`
   - `lastReminder` es `null` O `lastReminder <= hace 7 días`
3. Envía mensaje por WhatsApp (Twilio)
4. Crea registro en **NotificationLog**
5. Actualiza `lastReminder` del **Customer**

---

## Consultas Comunes

### Productos con stock bajo
```javascript
db.products.find({ stock: { $lte: 5 } }).sort({ stock: 1 })
```

### Clientes morosos (sin recordatorio en 7+ días)
```javascript
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
db.customers.find({
  balance: { $gt: 0 },
  $or: [
    { lastReminder: null },
    { lastReminder: { $lte: sevenDaysAgo } }
  ]
})
```

### Ventas del día
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

db.sales.find({
  date: { $gte: today, $lt: tomorrow }
})
```

### Total vendido del mes
```javascript
const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

db.sales.aggregate([
  { $match: { date: { $gte: firstDay } } },
  { $group: { _id: null, total: { $sum: "$total" } } }
])
```

---

## Backups Recomendados

### Backup Manual
```bash
mongodump --db urban_store --out ./backup
```

### Restaurar
```bash
mongorestore --db urban_store ./backup/urban_store
```

### Automatizado (cron)
```bash
# En Linux/Mac - Todos los días a las 3 AM
0 3 * * * mongodump --db urban_store --out /backups/urban_store_$(date +\%Y\%m\%d)
```

---

## Migración de Datos

Si necesitas migrar de otro sistema, crea un script en `backend/migrations/`:

```javascript
// migrate_old_data.js
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import oldData from './old_inventory.json' assert { type: 'json' };

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  
  for (const item of oldData) {
    await Product.create({
      name: item.nombre,
      sku: item.codigo,
      price: item.precio,
      stock: item.cantidad,
      // ... mapear campos
    });
  }
  
  console.log('Migración completa');
  process.exit(0);
}

migrate();
```
