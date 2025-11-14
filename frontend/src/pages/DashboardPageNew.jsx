import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import StatCardModern from '../components/StatCardModern';
import Loader from '../components/Loader';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { refreshTrigger } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalDebt: 0,
    customersWithDebt: [],
    recentSales: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bienvenido a Urban Store</p>
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardModern
          title="Ventas Totales"
          value={formatCurrency(stats.totalSales)}
          icon="💰"
          color="green"
          trend="up"
          trendValue="+12%"
        />
        <StatCardModern
          title="Productos"
          value={stats.totalProducts}
          icon="📦"
          color="blue"
        />
        <StatCardModern
          title="Stock Bajo"
          value={stats.lowStockProducts}
          icon="⚠️"
          color="orange"
        />
        <StatCardModern
          title="Deuda Total"
          value={formatCurrency(stats.totalDebt)}
          icon="💳"
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clientes con Deuda */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Clientes con Deuda</h2>
              <button
                onClick={() => navigate('/credits')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
              >
                Ver todos →
              </button>
            </div>

            {stats.customersWithDebt.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">🎉</p>
                <p className="text-gray-600 font-medium">¡No hay clientes con deudas pendientes!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.customersWithDebt.slice(0, 5).map((customer) => (
                  <div
                    key={customer._id}
                    onClick={() => navigate(`/customers/${customer._id}`)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                          {customer.name}
                        </h3>
                        <p className="text-sm text-gray-600">{customer.whatsappNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-red-600">{formatCurrency(customer.balance)}</p>
                      <p className="text-xs text-gray-500">Pendiente</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Productos con Stock Bajo */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Stock Bajo</h2>
              <button
                onClick={() => navigate('/inventory')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
              >
                Ver todos →
              </button>
            </div>

            {stats.lowStockProducts === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-gray-600 text-sm">Stock en buen estado</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 text-orange-600 rounded-lg p-3">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{stats.lowStockProducts}</p>
                      <p className="text-xs text-gray-600">Productos</p>
                    </div>
                  </div>
                  <span className="text-orange-600 font-bold text-xl">⚠️</span>
                </div>
                <p className="text-sm text-gray-600 text-center mt-4">
                  Revisa tu inventario para reabastecer productos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ventas Recientes */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Ventas Recientes</h2>
          <button
            onClick={() => navigate('/sales')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition"
          >
            Ver todas →
          </button>
        </div>

        {stats.recentSales && stats.recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Método</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Cliente</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentSales.slice(0, 5).map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(sale.date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        sale.paymentMethod === 'efectivo' ? 'bg-green-100 text-green-700' :
                        sale.paymentMethod === 'tarjeta' ? 'bg-blue-100 text-blue-700' :
                        sale.paymentMethod === 'transferencia' ? 'bg-purple-100 text-purple-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {sale.customer?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-gray-900">
                      {formatCurrency(sale.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">💼</p>
            <p className="text-gray-600 font-medium">No hay ventas registradas aún</p>
            <button
              onClick={() => navigate('/sales')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Registrar primera venta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
