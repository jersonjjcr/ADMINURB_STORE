import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { useApp } from '../context/AppContext';

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { showNotification, triggerRefresh } = useApp();

  const [saleForm, setSaleForm] = useState({
    items: [],
    paymentMethod: 'efectivo',
    isCredit: false,
    customer: ''
  });

  const [currentItem, setCurrentItem] = useState({
    product: '',
    size: '',
    quantity: 1,
    unitPrice: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, productsRes, customersRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products'),
        api.get('/customers')
      ]);
      setSales(salesRes.data.data);
      setProducts(productsRes.data.data);
      setCustomers(customersRes.data.data);
    } catch (error) {
      showNotification('Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    const product = products.find(p => p._id === currentItem.product);
    if (!product) {
      showNotification('Selecciona un producto', 'error');
      return;
    }

    if (currentItem.quantity > product.stock) {
      showNotification('Stock insuficiente', 'error');
      return;
    }

    setSaleForm({
      ...saleForm,
      items: [
        ...saleForm.items,
        {
          ...currentItem,
          productName: product.name,
          unitPrice: product.price
        }
      ]
    });

    setCurrentItem({
      product: '',
      size: '',
      quantity: 1,
      unitPrice: 0
    });
  };

  const handleRemoveItem = (index) => {
    setSaleForm({
      ...saleForm,
      items: saleForm.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotal = () => {
    return saleForm.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleSubmitSale = async (e) => {
    e.preventDefault();

    if (saleForm.items.length === 0) {
      showNotification('Agrega al menos un producto', 'error');
      return;
    }

    if (saleForm.isCredit && !saleForm.customer) {
      showNotification('Selecciona un cliente para venta a crédito', 'error');
      return;
    }

    try {
      const total = calculateTotal();
      await api.post('/sales', {
        ...saleForm,
        total
      });

      showNotification('Venta registrada exitosamente');
      setShowModal(false);
      setSaleForm({
        items: [],
        paymentMethod: 'efectivo',
        isCredit: false,
        customer: ''
      });
      fetchData();
      triggerRefresh();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error registrando venta', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nueva Venta
        </button>
      </div>

      {/* Lista de Ventas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(sale.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      sale.paymentMethod === 'efectivo'
                        ? 'bg-green-100 text-green-800'
                        : sale.paymentMethod === 'tarjeta'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {sale.paymentMethod}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {sale.customer?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{sale.items.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                  {formatCurrency(sale.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Venta */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Venta"
      >
        <form onSubmit={handleSubmitSale} className="space-y-6">
          {/* Agregar Producto */}
          <div className="border-b pb-4">
            <h3 className="font-medium mb-3">Agregar Producto</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Producto</label>
                <select
                  value={currentItem.product}
                  onChange={(e) => {
                    const product = products.find(p => p._id === e.target.value);
                    setCurrentItem({
                      ...currentItem,
                      product: e.target.value,
                      unitPrice: product?.price || 0
                    });
                  }}
                  className="input"
                >
                  <option value="">Seleccionar...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} - {formatCurrency(p.price)} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Talla</label>
                <input
                  type="text"
                  value={currentItem.size}
                  onChange={(e) => setCurrentItem({ ...currentItem, size: e.target.value })}
                  className="input"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="label">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })
                  }
                  className="input"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn btn-primary w-full"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Items Agregados */}
          {saleForm.items.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Items ({saleForm.items.length})</h3>
              <div className="space-y-2">
                {saleForm.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {item.size && `Talla: ${item.size} | `}
                        Cant: {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right">
                <span className="text-xl font-bold">
                  Total: {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          )}

          {/* Método de Pago */}
          <div>
            <label className="label">Método de Pago</label>
            <select
              value={saleForm.paymentMethod}
              onChange={(e) =>
                setSaleForm({
                  ...saleForm,
                  paymentMethod: e.target.value,
                  isCredit: e.target.value === 'credito'
                })
              }
              className="input"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="credito">Crédito</option>
            </select>
          </div>

          {/* Cliente (si es crédito) */}
          {saleForm.isCredit && (
            <div>
              <label className="label">Cliente</label>
              <select
                value={saleForm.customer}
                onChange={(e) => setSaleForm({ ...saleForm, customer: e.target.value })}
                className="input"
                required
              >
                <option value="">Seleccionar cliente...</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} - {c.whatsappNumber}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Venta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesPage;
