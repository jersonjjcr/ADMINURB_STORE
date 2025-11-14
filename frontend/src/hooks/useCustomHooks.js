import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Hook personalizado para hacer peticiones HTTP
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones de configuración
 * @returns {object} - { data, loading, error, refetch }
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url, options);
      setData(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook para manejar formularios
 * @param {object} initialValues - Valores iniciales del formulario
 * @returns {object} - { values, handleChange, handleSubmit, reset, setValues }
 */
export const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const reset = () => {
    setValues(initialValues);
  };

  return {
    values,
    handleChange,
    reset,
    setValues
  };
};

/**
 * Hook para debounce (útil en búsquedas)
 * @param {any} value - Valor a hacer debounce
 * @param {number} delay - Delay en milisegundos
 * @returns {any} - Valor con debounce aplicado
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
