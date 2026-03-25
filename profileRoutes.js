import express from 'express';
import {
  addHealthMetric,
  getHealthMetrics,
  savePushSubscription,
  updateProfile
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.put('/', updateProfile);
router.post('/push-subscription', savePushSubscription);
router.route('/health').get(getHealthMetrics).post(addHealthMetric);

export default router;

