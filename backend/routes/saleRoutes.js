import express from 'express';
import {
  createSale,
  getSales,
  getSaleById,
  getTodaySales,
  getSalesStats,
  deleteSale
} from '../controllers/saleController.js';

const router = express.Router();

router.post('/', createSale);
router.get('/', getSales);
router.get('/today', getTodaySales);
router.get('/stats', getSalesStats);
router.get('/:id', getSaleById);
router.delete('/:id', deleteSale);

export default router;
