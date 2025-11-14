# 📡 Ejemplos de Uso de la API - Urban Store

Colección de ejemplos para probar la API con cURL, PowerShell, o herramientas como Postman/Insomnia.

---

## 🏥 Health Check

### Verificar que el servidor está corriendo

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
```

**cURL:**
```bash
curl http://localhost:5000/api/health
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Urban Store API is running",
  "timestamp": "2025-11-14T10:30:00.000Z"
}
```

---

## 📦 Productos

### 1. Listar todos los productos

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method GET
```

### 2. Buscar productos

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/products?search=camiseta" -Method GET
```

### 3. Crear producto

**PowerShell:**
```powershell
$body = @{
    name = "Chamarra Urban Nueva"
    sku = "URB-CHA-003"
    category = "Chamarras"
    price = 899
    cost = 450
    stock = 10
    sizes = @("S", "M", "L", "XL")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chamarra Urban Nueva",
    "sku": "URB-CHA-003",
    "category": "Chamarras",
    "price": 899,
    "cost": 450,
    "stock": 10,
    "sizes": ["S", "M", "L", "XL"]
  }'
```

### 4. Actualizar producto

**PowerShell:**
```powershell
$productId = "6734ab123456789012345678"
$body = @{
    stock = 15
    price = 799
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/products/$productId" `
  -Method PUT `
  -Body $body `
  -ContentType "application/json"
```

### 5. Obtener productos con stock bajo

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/products/low-stock?threshold=5" -Method GET
```

---

## 💰 Ventas

### 1. Registrar venta en efectivo

**PowerShell:**
```powershell
$body = @{
    items = @(
        @{
            product = "6734ab123456789012345678"
            size = "M"
            quantity = 2
            unitPrice = 299
        }
    )
    paymentMethod = "efectivo"
    isCredit = $false
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/sales" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### 2. Registrar venta a crédito

**PowerShell:**
```powershell
$body = @{
    items = @(
        @{
            product = "6734ab123456789012345678"
            size = "L"
            quantity = 1
            unitPrice = 699
        }
    )
    paymentMethod = "credito"
    isCredit = $true
    customer = "6734cd987654321098765432"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/sales" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### 3. Ventas del día

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/sales/today" -Method GET
```

### 4. Estadísticas de ventas

**PowerShell:**
```powershell
$startDate = "2025-11-01"
$endDate = "2025-11-14"

Invoke-RestMethod -Uri "http://localhost:5000/api/sales/stats?startDate=$startDate&endDate=$endDate" -Method GET
```

---

## 💳 Clientes y Créditos

### 1. Crear cliente

**PowerShell:**
```powershell
$body = @{
    name = "Ana Martínez"
    whatsappNumber = "+525567890123"
    notes = "Cliente preferente"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/customers" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### 2. Listar clientes con deuda

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/customers?hasDebt=true" -Method GET
```

### 3. Ver detalle de cliente

**PowerShell:**
```powershell
$customerId = "6734cd987654321098765432"
Invoke-RestMethod -Uri "http://localhost:5000/api/customers/$customerId" -Method GET
```

### 4. Registrar pago

**PowerShell:**
```powershell
$customerId = "6734cd987654321098765432"
$body = @{
    amount = 500
    note = "Pago parcial en efectivo"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/customers/$customerId/payments" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### 5. Clientes morosos

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/customers/delinquent" -Method GET
```

---

## 📊 Dashboard

### Obtener métricas

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard" -Method GET
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "today": {
      "salesCount": 3,
      "salesTotal": 1497
    },
    "month": {
      "salesCount": 45,
      "salesTotal": 35420
    },
    "inventory": {
      "totalProducts": 10,
      "lowStockProducts": 2,
      "lowStockItems": [...]
    },
    "customers": {
      "total": 5,
      "withDebt": 2,
      "totalDebt": 2400,
      "debtList": [...]
    }
  }
}
```

---

## 🔔 Notificaciones

### 1. Ver logs de notificaciones

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/notifications" -Method GET
```

### 2. Filtrar por estado

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/notifications?status=sent" -Method GET
```

### 3. Ver logs de un cliente específico

**PowerShell:**
```powershell
$customerId = "6734cd987654321098765432"
Invoke-RestMethod -Uri "http://localhost:5000/api/notifications?customerId=$customerId" -Method GET
```

### 4. Estadísticas de notificaciones

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/stats" -Method GET
```

---

## 🧪 Colección de Postman

Importa este JSON en Postman para tener todos los endpoints:

```json
{
  "info": {
    "name": "Urban Store API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Products",
      "item": [
        {
          "name": "Get All Products",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{baseUrl}}/products",
              "host": ["{{baseUrl}}"],
              "path": ["products"]
            }
          }
        },
        {
          "name": "Create Product",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Producto Test\",\n  \"sku\": \"TEST-001\",\n  \"category\": \"Test\",\n  \"price\": 100,\n  \"cost\": 50,\n  \"stock\": 10,\n  \"sizes\": [\"M\", \"L\"]\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/products",
              "host": ["{{baseUrl}}"],
              "path": ["products"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

---

## 🔐 Pruebas con Token (cuando implementes autenticación)

Una vez que implementes JWT:

**PowerShell:**
```powershell
$token = "tu_jwt_token_aqui"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
  -Method GET `
  -Headers $headers
```

---

## 🐛 Manejo de Errores

Las respuestas de error siguen este formato:

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos (solo en desarrollo)"
}
```

**Códigos de estado comunes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Notas

- Reemplaza los IDs de ejemplo con IDs reales de tu base de datos
- Los timestamps se devuelven en formato ISO 8601
- Todos los montos son en MXN (pesos mexicanos)
- Los números de WhatsApp deben incluir código de país (+52 para México)
