# 💡 Guía de Desarrollo y Mejores Prácticas - Urban Store

Esta guía te ayudará a mantener y extender el proyecto de manera profesional.

---

## 📁 Organización del Código

### Backend

```
backend/
├── controllers/       # Lógica de negocio (separada de rutas)
├── routes/           # Definición de endpoints
├── models/           # Esquemas de MongoDB
├── services/         # Servicios externos (Twilio, email, etc.)
├── cron/             # Tareas programadas
├── middleware/       # Middleware personalizado (auth, validación)
├── utils/            # Utilidades reutilizables
└── config/           # Configuración (DB, constantes)
```

### Frontend

```
frontend/src/
├── components/       # Componentes reutilizables
├── pages/           # Páginas/vistas principales
├── context/         # Context API para estado global
├── hooks/           # Custom hooks
├── services/        # Llamadas a API
├── utils/           # Helpers y utilidades
└── assets/          # Imágenes, fuentes, etc.
```

---

## 🔒 Seguridad

### Variables de Entorno

✅ **Hacer:**
- Nunca commitear archivos `.env`
- Usar variables para todo: credenciales, URLs, puertos
- Documentar en `.env.example`

❌ **Evitar:**
- Hardcodear credenciales en el código
- Subir `.env` a repositorios públicos

### Validación

✅ **Siempre validar:**
```javascript
// Backend
import { body, validationResult } from 'express-validator';

router.post('/products',
  body('name').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ...
  }
);
```

### CORS

```javascript
// Solo permitir orígenes conocidos en producción
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://tudominio.com'
    : 'http://localhost:5173',
  credentials: true
}));
```

---

## 🎯 Patrones y Convenciones

### Nombres de Variables

```javascript
// ✅ Usar camelCase para variables y funciones
const customerBalance = 1500;
function calculateTotal() { }

// ✅ Usar PascalCase para componentes React
function ProductCard() { }

// ✅ Constantes en UPPER_CASE
const MAX_STOCK_THRESHOLD = 5;
```

### Funciones Async/Await

```javascript
// ✅ Usar try-catch en funciones async
async function fetchData() {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ❌ Evitar .then() innecesarios
api.get('/products')
  .then(res => res.data)
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Componentes React

```javascript
// ✅ Componentes funcionales con hooks
function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  return <div>...</div>;
}

// ✅ Extraer lógica compleja a custom hooks
function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // fetch logic
  }, []);
  
  return { products, loading };
}
```

---

## 🚀 Optimización de Performance

### Backend

#### 1. Índices en MongoDB

```javascript
// En los modelos
productSchema.index({ name: 'text', category: 'text' });
productSchema.index({ sku: 1 });
```

#### 2. Limitar resultados

```javascript
// Paginación
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

Product.find().skip(skip).limit(limit);
```

#### 3. Proyecciones (seleccionar solo campos necesarios)

```javascript
// Solo traer campos específicos
Product.find({}, 'name price stock');
```

### Frontend

#### 1. Lazy Loading de componentes

```javascript
import { lazy, Suspense } from 'react';

const InventoryPage = lazy(() => import('./pages/InventoryPage'));

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <InventoryPage />
    </Suspense>
  );
}
```

#### 2. Debounce en búsquedas

```javascript
// Ya implementado en useDebounce
const debouncedSearch = useDebounce(searchTerm, 500);
```

#### 3. Memoización

```javascript
import { useMemo } from 'react';

function ProductList({ products }) {
  const expensiveCalculation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.price, 0);
  }, [products]);
  
  return <div>{expensiveCalculation}</div>;
}
```

---

## 🧪 Testing

### Backend (con Jest)

```javascript
// __tests__/product.test.js
import request from 'supertest';
import app from '../server.js';

describe('Products API', () => {
  test('GET /api/products should return array', async () => {
    const response = await request(app).get('/api/products');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Frontend (con React Testing Library)

```javascript
// ProductCard.test.jsx
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';

test('renders product name', () => {
  const product = { name: 'Test Product', price: 100 };
  render(<ProductCard product={product} />);
  
  expect(screen.getByText('Test Product')).toBeInTheDocument();
});
```

---

## 📊 Monitoreo y Logging

### Backend

```javascript
// Usar un logger profesional (winston)
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// En controladores
logger.info('Venta registrada', { saleId: sale._id, total: sale.total });
logger.error('Error en venta', { error: error.message });
```

### Monitoreo de errores

```javascript
// Middleware para capturar errores
app.use((err, req, res, next) => {
  // Enviar a servicio externo (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(err);
  }
  
  res.status(500).json({ success: false, message: err.message });
});
```

---

## 🔄 Versionado de API

```javascript
// Estructura para múltiples versiones
routes/
├── v1/
│   ├── products.js
│   └── sales.js
└── v2/
    ├── products.js
    └── sales.js

// En server.js
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);
```

---

## 🌐 Internacionalización (i18n)

```javascript
// Frontend con react-i18next
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    es: {
      translation: {
        "welcome": "Bienvenido",
        "products": "Productos"
      }
    },
    en: {
      translation: {
        "welcome": "Welcome",
        "products": "Products"
      }
    }
  },
  lng: 'es',
  fallbackLng: 'es'
});
```

---

## 🐳 Dockerización

### Dockerfile (Backend)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/urban_store
    depends_on:
      - mongodb
  
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mongo-data:
```

---

## 📱 PWA (Progressive Web App)

### Añadir service worker

```javascript
// public/service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('urban-store-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/main.js',
        '/static/css/main.css'
      ]);
    })
  );
});
```

### Manifest

```json
// public/manifest.json
{
  "name": "Urban Store",
  "short_name": "Urban",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0ea5e9",
  "background_color": "#ffffff"
}
```

---

## 🔐 Autenticación JWT (Opcional)

### Backend

```javascript
import jwt from 'jsonwebtoken';

// Generar token
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Middleware de autenticación
export const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Proteger rutas
router.get('/products', auth, getProducts);
```

### Frontend

```javascript
// Guardar token
localStorage.setItem('token', token);

// Enviar en requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🎨 Tips de UI/UX

1. **Loading states**: Siempre mostrar feedback visual
2. **Error handling**: Mensajes claros y accionables
3. **Confirmaciones**: Usar modales para acciones destructivas
4. **Responsive**: Probar en diferentes dispositivos
5. **Accesibilidad**: Usar labels, alt text, ARIA attributes

---

## 📦 Deployment

### Vercel (Frontend)

```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Render / Railway (Backend)

1. Conectar repositorio
2. Configurar variables de entorno
3. Build command: `npm install`
4. Start command: `node server.js`

### MongoDB Atlas

1. Crear cluster gratuito
2. Whitelist IP: `0.0.0.0/0` (desarrollo) o IP específica
3. Crear usuario de DB
4. Obtener connection string
5. Actualizar `MONGO_URI` en variables de entorno

---

## 🔄 CI/CD con GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd backend && npm install
      - run: cd backend && npm test
```

---

## 📚 Recursos Adicionales

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Docs](https://react.dev/)
- [MongoDB Performance](https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/)
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)

---

¡Mantén el código limpio, documentado y testeado! 🚀
