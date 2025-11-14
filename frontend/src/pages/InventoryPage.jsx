import { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { useForm, useDebounce } from '../hooks/useCustomHooks';
import { useApp } from '../context/AppContext';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { showNotification, refreshTrigger, triggerRefresh } = useApp();

  const { values, handleChange, reset, setValues } = useForm({
    name: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    sizes: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, refreshTrigger]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        params: { search: debouncedSearch }
      });
      setProducts(response.data.data);
    } catch (error) {
      showNotification('Error cargando productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...values,
        sizes: values.sizes.split(',').map(s => s.trim()),
        price: parseFloat(values.price),
        cost: parseFloat(values.cost),
        stock: parseInt(values.stock)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productData);
        showNotification('Producto actualizado exitosamente');
      } else {
        await api.post('/products', productData);
        showNotification('Producto creado exitosamente');
      }

      setShowModal(false);
      reset();
      setEditingProduct(null);
      triggerRefresh();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error guardando producto', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setValues({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      sizes: product.sizes.join(', ')
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await api.delete(`/products/${id}`);
      showNotification('Producto eliminado exitosamente');
      triggerRefresh();
    } catch (error) {
      showNotification('Error eliminando producto', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    reset();
    setShowModal(true);
  };

  const columns = [
    { header: 'SKU', accessor: 'sku' },
    { header: 'Nombre', accessor: 'name' },
    { header: 'Categoría', accessor: 'category' },
    {
      header: 'Precio',
      render: (row) => `$${row.price.toFixed(2)}`
    },
    { header: 'Stock', accessor: 'stock' },
    {
      header: 'Acciones',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-800"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
        <button onClick={openCreateModal} className="btn btn-primary">
          + Nuevo Producto
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader size="large" />
        </div>
      ) : (
        <Table columns={columns} data={products} />
      )}

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          reset();
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nombre</label>
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
            <label className="label">SKU</label>
            <input
              type="text"
              name="sku"
              value={values.sku}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Categoría</label>
            <input
              type="text"
              name="category"
              value={values.category}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Precio</label>
              <input
                type="number"
                name="price"
                value={values.price}
                onChange={handleChange}
                className="input"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="label">Costo</label>
              <input
                type="number"
                name="cost"
                value={values.cost}
                onChange={handleChange}
                className="input"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Stock</label>
            <input
              type="number"
              name="stock"
              value={values.stock}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Tallas (separadas por coma)</label>
            <input
              type="text"
              name="sizes"
              value={values.sizes}
              onChange={handleChange}
              className="input"
              placeholder="S, M, L, XL"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
