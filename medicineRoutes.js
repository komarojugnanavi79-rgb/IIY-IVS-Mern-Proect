import express from 'express';
import {
  createMedicine,
  deleteMedicine,
  getHistory,
  getMedicines,
  getTodaySchedule,
  updateIntakeStatus,
  updateMedicine
} from '../controllers/medicineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getMedicines).post(createMedicine);
router.get('/schedule/today', getTodaySchedule);
router.get('/history', getHistory);
router.patch('/:id/status', updateIntakeStatus);
router.route('/:id').put(updateMedicine).delete(deleteMedicine);

export default router;

