import { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import { useApp } from '../context/AppContext';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useApp();

  useEffect(() => {
    fetchMetrics();
  }, [refreshTrigger]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard');
      setMetrics(response.data.data);
    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="large" />
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-center text-gray-500">Error cargando datos</div>;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Hoy"
          value={formatCurrency(metrics.today.salesTotal)}
          subtitle={`${metrics.today.salesCount} ventas`}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Ventas del Mes"
          value={formatCurrency(metrics.month.salesTotal)}
          subtitle={`${metrics.month.salesCount} ventas`}
          icon="📈"
          color="blue"
        />
        <StatCard
          title="Deuda Total"
          value={formatCurrency(metrics.customers.totalDebt)}
          subtitle={`${metrics.customers.withDebt} clientes`}
          icon="💳"
          color="red"
        />
        <StatCard
          title="Stock Bajo"
          value={metrics.inventory.lowStockProducts}
          subtitle="productos"
          icon="⚠️"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes con Deuda */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Clientes con Deuda
          </h2>
          {metrics.customers.debtList.length > 0 ? (
            <div className="space-y-3">
              {metrics.customers.debtList.map((customer) => (
                <div
                  key={customer._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.whatsappNumber}</p>
                  </div>
                  <span className="font-bold text-red-600">
                    {formatCurrency(customer.balance)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay clientes con deuda</p>
          )}
        </div>

        {/* Productos con Stock Bajo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Inventario Crítico
          </h2>
          {metrics.inventory.lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {metrics.inventory.lowStockItems.map((product) => (
                <div
                  key={product._id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sku}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    {product.stock} unidades
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Todos los productos tienen stock suficiente
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
