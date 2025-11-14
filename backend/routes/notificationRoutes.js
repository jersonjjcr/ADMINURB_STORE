import express from 'express';
import {
  getNotificationLogs,
  getNotificationStats
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotificationLogs);
router.get('/stats', getNotificationStats);

export default router;
