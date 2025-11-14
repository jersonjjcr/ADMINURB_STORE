import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { useApp } from '../context/AppContext';
import { useForm } from '../hooks/useCustomHooks';

const CreditsPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { showNotification, triggerRefresh } = useApp();

  const { values, handleChange, reset } = useForm({
    name: '',
    whatsappNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers', {
        params: { hasDebt: true }
      });
      setCustomers(response.data.data);
    } catch (error) {
      showNotification('Error cargando clientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      // Asegurar formato correcto del número
      let phone = values.whatsappNumber;
      if (!phone.startsWith('+')) {
        phone = '+52' + phone.replace(/\D/g, '');
      }

      await api.post('/customers', {
        ...values,
        whatsappNumber: phone
      });

      showNotification('Cliente creado exitosamente');
      setShowModal(false);
      reset();
      fetchCustomers();
      triggerRefresh();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error creando cliente', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns = [
    { header: 'Nombre', accessor: 'name' },
    { header: 'WhatsApp', accessor: 'whatsappNumber' },
    {
      header: 'Deuda',
      render: (row) => (
        <span className="font-bold text-red-600">{formatCurrency(row.balance)}</span>
      )
    },
    {
      header: 'Último Recordatorio',
      render: (row) => (
        <span className={!row.lastReminder ? 'text-yellow-600' : ''}>
          {formatDate(row.lastReminder)}
        </span>
      )
    },
    {
      header: 'Créditos',
      render: (row) => row.creditHistory?.length || 0
    },
    {
      header: 'Acciones',
      render: (row) => (
        <button
          onClick={() => navigate(`/customers/${row._id}`)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver Detalle →
        </button>
      )
    }
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Clientes a Crédito</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Total Clientes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{customers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Deuda Total</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {formatCurrency(customers.reduce((sum, c) => sum + c.balance, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 uppercase">Sin Recordatorio Reciente</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {customers.filter((c) => {
              if (!c.lastReminder) return true;
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return new Date(c.lastReminder) <= sevenDaysAgo;
            }).length}
          </p>
        </div>
      </div>

      <Table columns={columns} data={customers} />

      {/* Modal Nuevo Cliente */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          reset();
        }}
        title="Nuevo Cliente"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="label">Nombre Completo</label>
            <input
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Número de WhatsApp</label>
            <input
              type="text"
              name="whatsappNumber"
              value={values.whatsappNumber}
              onChange={handleChange}
              className="input"
              placeholder="+52 555 123 4567"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Incluye el código de país (ej: +52 para México)
            </p>
          </div>

          <div>
            <label className="label">Notas (opcional)</label>
            <textarea
              name="notes"
              value={values.notes}
              onChange={handleChange}
              className="input"
              rows="3"
              placeholder="Información adicional del cliente..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Cliente
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CreditsPage;
