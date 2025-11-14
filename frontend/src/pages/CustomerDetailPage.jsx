import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';
import { useForm } from '../hooks/useCustomHooks';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { showNotification, triggerRefresh } = useApp();

  const { values, handleChange, reset } = useForm({
    amount: '',
    note: ''
  });

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/customers/${id}`);
      setCustomer(response.data.data);
    } catch (error) {
      showNotification('Error cargando cliente', 'error');
      navigate('/credits');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPayment = async (e) => {
    e.preventDefault();

    const amount = parseFloat(values.amount);
    if (amount <= 0) {
      showNotification('El monto debe ser mayor a cero', 'error');
      return;
    }

    if (amount > customer.balance) {
      showNotification('El monto excede la deuda pendiente', 'error');
      return;
    }

    try {
      await api.post(`/customers/${id}/payments`, {
        amount,
        note: values.note
      });

      showNotification('Abono registrado exitosamente');
      setShowPaymentModal(false);
      reset();
      fetchCustomer();
      triggerRefresh();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error registrando abono', 'error');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${customer.name}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/customers/${id}`);
      showNotification('Cliente eliminado exitosamente');
      triggerRefresh();
      navigate('/credits');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error eliminando cliente', 'error');
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
      month: 'long',
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

  if (!customer) {
    return <div className="text-center text-gray-500">Cliente no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/credits')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
          {customer.balance === 0 && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              ✅ Paz y Salvo
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          {customer.balance > 0 && (
            <button onClick={() => setShowPaymentModal(true)} className="btn btn-primary">
              💰 Registrar Abono
            </button>
          )}
          {customer.balance === 0 && (
            <button 
              onClick={handleDeleteCustomer}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🗑️ Eliminar Cliente
            </button>
          )}
        </div>
      </div>

      {/* Info del Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">WhatsApp</p>
          <p className="text-xl font-bold text-gray-900 mt-2">{customer.whatsappNumber}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Saldo Pendiente</p>
          <p className="text-xl font-bold text-red-600 mt-2">
            {formatCurrency(customer.balance)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Total Créditos</p>
          <p className="text-xl font-bold text-gray-900 mt-2">
            {customer.creditHistory?.length || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Último Recordatorio</p>
          <p className="text-sm font-medium text-gray-900 mt-2">
            {customer.lastReminder
              ? new Date(customer.lastReminder).toLocaleDateString('es-MX')
              : 'Nunca'}
          </p>
        </div>
      </div>

      {/* Próximo Pago Programado */}
      {customer.nextPaymentDate && customer.balance > 0 && (
        <div className={`rounded-lg shadow-md p-6 ${
          new Date(customer.nextPaymentDate) < new Date() 
            ? 'bg-red-50 border-2 border-red-500' 
            : 'bg-blue-50 border-2 border-blue-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase mb-1">
                {new Date(customer.nextPaymentDate) < new Date() 
                  ? '⚠️ Pago Vencido' 
                  : '📅 Próximo Pago Programado'}
              </p>
              <p className="text-2xl font-bold">
                {new Date(customer.nextPaymentDate).toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm mt-1">
                {customer.paymentReminderSent 
                  ? '✅ Recordatorio enviado por WhatsApp' 
                  : '⏳ Recordatorio pendiente de envío'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notas */}
      {customer.notes && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm font-medium text-blue-900">Notas:</p>
          <p className="text-sm text-blue-700 mt-1">{customer.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historial de Créditos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Créditos</h2>
          {customer.creditHistory && customer.creditHistory.length > 0 ? (
            <div className="space-y-3">
              {customer.creditHistory.map((sale) => (
                <div key={sale._id} className="border-l-4 border-yellow-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {sale.items?.length || 0} producto(s)
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(sale.date)}</p>
                      {sale.items && sale.items.length > 0 && (
                        <ul className="text-xs text-gray-500 mt-1 space-y-1">
                          {sale.items.map((item, idx) => (
                            <li key={idx}>
                              • {item.productName} ({item.quantity} x{' '}
                              {formatCurrency(item.unitPrice)})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <span className="font-bold text-yellow-700">
                      {formatCurrency(sale.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay créditos registrados</p>
          )}
        </div>

        {/* Historial de Pagos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Pagos</h2>
          {customer.paymentHistory && customer.paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {customer.paymentHistory
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((payment, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-green-700">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-gray-600">{formatDate(payment.date)}</p>
                        {payment.note && (
                          <p className="text-xs text-gray-500 mt-1 italic">{payment.note}</p>
                        )}
                      </div>
                      <span className="text-green-600 text-xl">✓</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay pagos registrados</p>
          )}
        </div>
      </div>

      {/* Modal Registrar Pago */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          reset();
        }}
        title="Registrar Pago"
      >
        <form onSubmit={handleRegisterPayment} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Saldo pendiente actual:</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(customer.balance)}
            </p>
          </div>

          <div>
            <label className="label">Monto del Abono</label>
            <input
              type="number"
              name="amount"
              value={values.amount}
              onChange={handleChange}
              className="input"
              step="0.01"
              min="0.01"
              max={customer.balance}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo: {formatCurrency(customer.balance)}
            </p>
          </div>

          {values.amount > 0 && parseFloat(values.amount) <= customer.balance && (
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-gray-600">Saldo restante después del abono:</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(customer.balance - parseFloat(values.amount))}
              </p>
              {customer.balance - parseFloat(values.amount) === 0 && (
                <p className="text-green-600 text-sm font-semibold mt-2">
                  ✅ El cliente quedará paz y salvo
                </p>
              )}
            </div>
          )}

          <div>
            <label className="label">Nota (opcional)</label>
            <textarea
              name="note"
              value={values.note}
              onChange={handleChange}
              className="input"
              rows="3"
              placeholder="Información adicional del pago..."
            />
          </div>

          {values.amount && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Nuevo saldo:</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(customer.balance - parseFloat(values.amount || 0))}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Pago
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerDetailPage;
