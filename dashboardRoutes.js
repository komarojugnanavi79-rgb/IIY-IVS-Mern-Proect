import express from 'express';
import { downloadReport, getDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getDashboard);
router.get('/report', downloadReport);

export default router;

