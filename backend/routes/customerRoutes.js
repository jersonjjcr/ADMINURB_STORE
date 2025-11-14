import express from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  registerPayment,
  getDelinquentCustomers
} from '../controllers/customerController.js';

const router = express.Router();

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/delinquent', getDelinquentCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.post('/:customerId/payments', registerPayment);

export default router;
